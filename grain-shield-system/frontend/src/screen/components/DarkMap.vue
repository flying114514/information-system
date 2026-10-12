<template>
  <div class="sk-map">
    <div ref="el" class="sk-map__canvas"></div>

    <div class="sk-map__legend" v-if="showLegend">
      <h5>图例</h5>
      <div class="sk-legend" style="flex-direction: column; gap: 5px">
        <span class="sk-legend__item"><i class="sk-dot sk-dot--green"></i>粮库</span>
        <span class="sk-legend__item"><i class="sk-dot sk-dot--blue"></i>加工企业</span>
        <span class="sk-legend__item"><i class="sk-dot sk-dot--gold"></i>配送中心</span>
        <span class="sk-legend__item"><span class="sk-legend__line" style="border-color:#25d0e8"></span>正常线路</span>
        <span class="sk-legend__item"><span class="sk-legend__line" style="border-color:#ffc53d"></span>拥堵</span>
        <span class="sk-legend__item"><span class="sk-legend__line" style="border-color:#ff4d5e; border-top-style:dashed"></span>封闭</span>
      </div>
    </div>

    <div class="sk-map__north">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="rgba(120,180,240,.5)" stroke-width="1"/>
        <path d="M12 4l3 7h-2v9h-2v-9H9z" fill="#25d0e8"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import wuhanGeoJson from '../../assets/maps/wuhan.json'

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  routes: { type: Array, default: () => [] },
  alerts: { type: Array, default: () => [] },
  highlightRoutes: { type: Array, default: () => [] },
  recommendPath: { type: Array, default: () => [] },
  showLegend: { type: Boolean, default: true },
  mode: { type: String, default: 'network' }
})

const el = ref()
let chart
let ro
const MAP = 'wuhan-sk'

const NODE_COLOR = { WAREHOUSE: '#38d996', PROCESSING: '#2f8fff', DISTRIBUTION: '#25d0e8', LOGISTICS: '#ffc53d' }
const ROUTE_COLOR = { NORMAL: '#25d0e8', CONGESTED: '#ffc53d', CLOSED: '#ff4d5e' }
const LEVEL_COLOR = { CRITICAL: '#ff4d5e', HIGH: '#ff9a3d', MEDIUM: '#ffc53d', LOW: '#2f8fff' }

function num(v) { return v == null ? null : Number(v) }

function nodePoint(n) {
  const lng = num(n.longitude), lat = num(n.latitude)
  if (lng != null && lat != null) return [lng, lat]
  const f = wuhanGeoJson.features.find(x => x.properties.name === n.region)
  return f ? (f.properties.centroid || f.properties.center) : null
}

function buildNodeSeries() {
  const byType = { WAREHOUSE: [], PROCESSING: [], DISTRIBUTION: [] }
  props.nodes.forEach(n => {
    const p = nodePoint(n)
    if (!p) return
    const key = byType[n.type] ? n.type : 'WAREHOUSE'
    byType[key].push({
      name: n.name,
      value: [...p, n.id],
      raw: n,
      itemStyle: {
        color: NODE_COLOR[n.type] || '#38d996',
        borderColor: 'rgba(255,255,255,.85)',
        borderWidth: 1.4,
        shadowBlur: 14,
        shadowColor: NODE_COLOR[n.type] || '#38d996'
      }
    })
  })
  const sizes = { WAREHOUSE: 15, PROCESSING: 13, DISTRIBUTION: 11 }
  const labels = { WAREHOUSE: '粮库', PROCESSING: '加工', DISTRIBUTION: '配送' }
  return Object.entries(byType).map(([type, data]) => ({
    name: labels[type],
    type: 'scatter',
    coordinateSystem: 'geo',
    zlevel: 4,
    symbol: 'roundRect',
    symbolSize: sizes[type],
    data,
    label: {
      show: type === 'WAREHOUSE',
      position: 'right',
      distance: 4,
      color: '#dceaff',
      fontSize: 11,
      fontWeight: 600,
      formatter: '{b}',
      textBorderColor: 'rgba(3,12,24,.9)',
      textBorderWidth: 3,
      overflow: 'truncate',
      width: 92
    },
    emphasis: { scale: 1.3, label: { show: true, color: '#fff' } }
  }))
}

function buildRouteSeries() {
  const nodeMap = new Map()
  props.nodes.forEach(n => {
    const p = nodePoint(n)
    if (p) nodeMap.set(String(n.id), p)
  })
  const groups = { NORMAL: [], CONGESTED: [], CLOSED: [] }
  props.routes.forEach(r => {
    const s = nodeMap.get(String(r.startNodeId))
    const e = nodeMap.get(String(r.endNodeId))
    if (!s || !e) return
    const status = groups[r.status] ? r.status : 'NORMAL'
    const hl = props.highlightRoutes.some(id => String(id) === String(r.id))
    groups[status].push({
      name: r.name,
      coords: [s, e],
      raw: r,
      hl,
      lineStyle: {
        color: hl ? '#ffc53d' : ROUTE_COLOR[status],
        width: hl ? 4 : status === 'CLOSED' ? 2.4 : 1.8,
        type: status === 'CLOSED' ? 'dashed' : 'solid',
        curveness: 0.18,
        opacity: hl ? 1 : 0.82,
        shadowBlur: hl ? 20 : 8,
        shadowColor: hl ? '#ffc53d' : ROUTE_COLOR[status]
      }
    })
  })
  return Object.entries(groups)
    .filter(([, data]) => data.length)
    .map(([status, data]) => ({
      name: '运输线路',
      type: 'lines',
      coordinateSystem: 'geo',
      zlevel: 3,
      polyline: false,
      data,
      effect: {
        show: true,
        period: 4,
        trailLength: 0.25,
        symbol: 'arrow',
        symbolSize: 5,
        color: status === 'CLOSED' ? '#ff4d5e' : status === 'CONGESTED' ? '#ffc53d' : '#e8f6ff'
      },
      emphasis: { lineStyle: { width: 4 } }
    }))
}

function buildAlertSeries() {
  if (!props.alerts.length) return []
  const nodeMap = new Map()
  props.nodes.forEach(n => {
    const p = nodePoint(n)
    if (p) nodeMap.set(String(n.id), p)
  })
  const data = props.alerts.map(a => {
    let p = null
    if (a.longitude != null && a.latitude != null) p = [num(a.longitude), num(a.latitude)]
    else if (a.nodeId != null) p = nodeMap.get(String(a.nodeId))
    if (!p) return null
    const level = a.level || 'MEDIUM'
    return {
      name: a.code || a.nodeName,
      value: [...p, 1],
      raw: a,
      itemStyle: { color: LEVEL_COLOR[level] || '#ff9a3d', shadowBlur: 14, shadowColor: LEVEL_COLOR[level] || '#ff9a3d' }
    }
  }).filter(Boolean)
  return [{
    name: '告警',
    type: 'effectScatter',
    coordinateSystem: 'geo',
    zlevel: 6,
    symbol: 'triangle',
    symbolSize: 11,
    rippleEffect: { brushType: 'stroke', scale: 4.2, period: 3 },
    showEffectOn: 'render',
    data,
    label: { show: false },
    emphasis: { label: { show: true } }
  }]
}

function buildRecommendSeries() {
  if (!props.recommendPath.length) return []
  const pts = props.recommendPath.map(p => (Array.isArray(p) ? p : nodePoint(p))).filter(Boolean)
  if (pts.length < 2) return []
  return [{
    name: '推荐路径',
    type: 'lines',
    coordinateSystem: 'geo',
    zlevel: 7,
    data: [{ coords: pts }],
    lineStyle: {
      color: '#38d996',
      width: 4,
      curveness: 0.14,
      shadowBlur: 22,
      shadowColor: '#38d996'
    },
    effect: { show: true, period: 2.6, trailLength: 0.4, symbol: 'circle', symbolSize: 6, color: '#eafff5' }
  }]
}

function baseOption() {
  return {
    backgroundColor: 'transparent',
    animationDuration: 900,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(5,18,34,.94)',
      borderColor: 'rgba(74,165,255,.5)',
      borderWidth: 1,
      textStyle: { color: '#dceaff', fontSize: 12 },
      formatter: p => {
        const d = p.data
        if (d && d.raw) {
          const r = d.raw
          if (r.plateNumber || r.startNodeName) return `${r.name || ''}<br/>${r.startNodeName || ''} → ${r.endNodeName || ''}<br/>${r.distanceKm || ''} km`
          if (r.code) return `${r.code}<br/>${r.riskType || ''} · ${r.level || ''}<br/>${r.detail || r.nodeName || ''}`
          return `${r.name || ''}<br/>${r.region || ''}${r.status ? ' · ' + r.status : ''}`
        }
        return p.name
      }
    },
    geo: {
      map: MAP,
      roam: true,
      zoom: 1.16,
      aspectScale: 0.96,
      layoutCenter: ['50%', '52%'],
      layoutSize: '99%',
      itemStyle: {
        areaColor: 'rgba(10, 40, 78, .88)',
        borderColor: '#2b7fd0',
        borderWidth: 1.1,
        shadowColor: 'rgba(37, 160, 255, .55)',
        shadowBlur: 22
      },
      emphasis: {
        itemStyle: { areaColor: 'rgba(30, 92, 158, .95)' },
        label: { color: '#ffffff', fontSize: 12 }
      },
      select: { itemStyle: { areaColor: 'rgba(30, 92, 158, .95)' } },
      label: { show: true, color: '#7fb6e8', fontSize: 11 }
    },
    series: [
      { name: '武汉市', type: 'map', map: MAP, geoIndex: 0, data: [], silent: true },
      ...buildRouteSeries(),
      ...buildNodeSeries(),
      ...buildAlertSeries(),
      ...buildRecommendSeries()
    ]
  }
}

function draw() {
  if (!chart) return
  chart.setOption(baseOption(), true)
}

onMounted(() => {
  echarts.registerMap(MAP, wuhanGeoJson)
  chart = echarts.init(el.value)
  draw()
  window.addEventListener('resize', resize)
  // 容器高度由 flex 决定，必须跟随容器变化重算画布，否则矮视口下会溢出面板
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => resize())
    ro.observe(el.value)
  }
})

function resize() { chart?.resize() }

watch(() => [props.nodes, props.routes, props.alerts, props.highlightRoutes, props.recommendPath], () => nextTick(draw), { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  ro?.disconnect()
  ro = undefined
  chart?.dispose()
})
</script>
