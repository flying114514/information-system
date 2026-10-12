<template>
  <ScreenShell
    subtitle="网络总览 · 全域态势大屏"
    active="/screen/overview"
    :kpi-count="6"
    columns="minmax(0, 1.16fr) minmax(0, 1.58fr) minmax(0, 1.16fr)"
  >
    <template #kpis>
      <KpiTile label="粮库节点总数" :value="kpi.warehouses" unit="个" icon="OfficeBuilding" tone="green" delta="较昨日 +2" dir="up" />
      <KpiTile label="粮食总库存" :value="kpi.totalStock" unit="吨" icon="Box" tone="gold" delta="较昨日 +1.2%" dir="up" />
      <KpiTile label="可用库存" :value="kpi.available" unit="吨" icon="Goods" tone="green" :decimals="0" :delta="`占比 ${kpi.availableRate}%`" dir="flat" />
      <KpiTile label="在途车辆" :value="kpi.inTransit" unit="辆" icon="Van" tone="blue" delta="较昨日 +6" dir="up" />
      <KpiTile label="今日告警" :value="kpi.todayAlerts" unit="条" icon="Bell" tone="red" delta="较昨日 +3" dir="up" />
      <KpiTile label="待处理建议" :value="kpi.pendingPlans" unit="条" icon="Guide" tone="orange" delta="较昨日 -1" dir="down" />
    </template>

    <!-- 左栏 -->
    <div class="sk-col">
      <ScreenPanel title="风险等级分布" icon="PieChart" class="sk-flex1" style="flex:0.95">
        <BaseChart :option="levelPie" />
      </ScreenPanel>
      <ScreenPanel title="近7日告警趋势" icon="TrendCharts" class="sk-flex1" style="flex:1">
        <BaseChart :option="trendLine" />
      </ScreenPanel>
      <ScreenPanel title="区域库存排名" icon="Histogram" class="sk-flex1" extra="更多" style="flex:1.05">
        <BaseChart :option="regionBar" />
      </ScreenPanel>
    </div>

    <!-- 中栏：地图 + 调度任务 -->
    <div class="sk-col">
      <ScreenPanel title="武汉市粮食供应链网络总览" icon="MapLocation" class="sk-flex1" body-class="sk-panel__body--flush" style="flex:1">
        <DarkMap :nodes="nodes" :routes="routes" :alerts="openAlerts" :show-legend="true" />
      </ScreenPanel>

      <div class="mid-bottom">
        <ScreenPanel title="今日调度任务" icon="List" extra="更多" style="flex:1">
          <div class="task-row">
            <div class="task-total">
              <span class="sk-label">总任务数</span>
              <b class="sk-big" style="font-size: 26px">{{ taskStat.total }}</b>
            </div>
            <div class="task-progress">
              <div class="task-bar">
                <i :style="{ width: taskStat.donePct + '%', background: 'linear-gradient(90deg,#38d996,#25d0e8)' }"></i>
              </div>
              <div class="task-legend">
                <span><i class="sk-dot sk-dot--green"></i>已完成 <b>{{ taskStat.done }}</b> · {{ taskStat.donePct }}%</span>
                <span><i class="sk-dot sk-dot--blue"></i>进行中 <b>{{ taskStat.doing }}</b> · {{ taskStat.doingPct }}%</span>
                <span><i class="sk-dot sk-dot--gold"></i>待执行 <b>{{ taskStat.todo }}</b> · {{ taskStat.todoPct }}%</span>
              </div>
            </div>
          </div>
        </ScreenPanel>

        <ScreenPanel title="气象交通态势" icon="Cloudy" style="flex:1">
          <div class="weather-box">
            <div class="weather-main">
              <div class="weather-icon"><el-icon><Drizzling /></el-icon></div>
              <div>
                <div class="sk-strong">{{ weather.disasterType }} · {{ weather.warningLevel }}预警</div>
                <div class="sk-label--sm">{{ weather.region }} · 未来24小时降雨 {{ weather.rainfall }}mm</div>
              </div>
            </div>
            <div class="weather-side">
              <div><span class="sk-label--sm">风向风力</span><b>{{ weather.windLevel }}</b></div>
              <div><span class="sk-label--sm">受阻道路</span><b class="c-red">{{ blockedRoads }} 条</b></div>
            </div>
          </div>
        </ScreenPanel>
      </div>
    </div>

    <!-- 右栏 -->
    <div class="sk-col">
      <ScreenPanel title="实时风险告警" icon="Warning" extra="更多" class="sk-flex1" body-class="sk-panel__body--flush" style="flex:1">
        <div class="sk-table__wrap">
          <table class="sk-table">
            <thead>
              <tr>
                <th style="width:27%">告警编号</th>
                <th style="width:19%">类型</th>
                <th style="width:17%">等级</th>
                <th style="width:37%">影响节点</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in alertRows" :key="a.id">
                <td class="sk-num sk-code">{{ a.code }}</td>
                <td>{{ a.riskTypeLabel }}</td>
                <td><span class="sk-tag" :class="`sk-tag--${TONE[a.level]}`">{{ LABEL.level[a.level] }}</span></td>
                <td>{{ a.nodeName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ScreenPanel>

      <ScreenPanel title="调度建议概览" icon="Guide" extra="更多" style="flex:1.6" body-class="sk-panel__body--flush">
        <div class="plan-box" v-if="plan">
          <div class="plan-head">
            <span class="sk-tag sk-tag--gold">推荐方案</span>
            <span class="sk-label--sm">编号 {{ plan.code }}</span>
          </div>
          <div class="plan-grid">
            <div><span class="sk-label">出发粮库</span><b>{{ plan.sourceNodeName }}</b></div>
            <div><span class="sk-label">目标区域</span><b>{{ plan.targetNodeName }}</b></div>
            <div><span class="sk-label">粮食种类</span><b>{{ plan.grainType }}</b></div>
            <div><span class="sk-label">调度数量</span><b class="sk-num">{{ fmt(plan.suggestedQuantity) }} 吨</b></div>
            <div><span class="sk-label">预计耗时</span><b>{{ eta }}</b></div>
            <div><span class="sk-label">运输方式</span><b>公路运输</b></div>
          </div>
          <div class="plan-score">
            <span class="score-num"><b>{{ 92 }}</b><i>综合评分</i></span>
            <ul class="score-list">
              <li><i class="sk-dot sk-dot--green"></i>运力充足</li>
              <li><i class="sk-dot sk-dot--green"></i>路径畅通</li>
              <li><i class="sk-dot sk-dot--green"></i>气象良好</li>
            </ul>
          </div>
        </div>
      </ScreenPanel>

      <ScreenPanel title="路线通行状态" icon="Position" extra="更多" style="flex:0.92" body-class="sk-panel__body--flush">
        <div class="sk-table__wrap">
          <table class="sk-table">
            <thead>
              <tr>
                <th style="width:48%">线路名称</th>
                <th style="width:22%">里程</th>
                <th style="width:30%">通行状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in routeRows" :key="r.id">
                <td>{{ r.name }}</td>
                <td class="sk-num">{{ r.distanceKm }} km</td>
                <td><span class="sk-tag" :class="`sk-tag--${routeTone(r.status)}`">{{ LABEL.routeStatus[r.status] }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </ScreenPanel>
    </div>
  </ScreenShell>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import ScreenShell from '../components/ScreenShell.vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import KpiTile from '../components/KpiTile.vue'
import BaseChart from '../components/BaseChart.vue'
import DarkMap from '../components/DarkMap.vue'
import { useScreenData, loadScreenData, LABEL, TONE } from '../useScreenData'

const D = useScreenData()
onMounted(() => loadScreenData())

const fmt = (n) => Number(n || 0).toLocaleString('zh-CN')

const openAlerts = computed(() => D.alerts.value.filter(a => a.status !== 'CLOSED' && a.status !== 'IGNORED'))
const alertRows = computed(() => D.alerts.value.slice(0, 3))
const routeRows = computed(() => D.routes.value.slice(0, 3))
const nodes = computed(() => D.nodes.value)
const routes = computed(() => D.routes.value)
const plan = computed(() => D.plans.value[0] || null)
const weather = computed(() => D.weather.value[0] || { disasterType: '晴天', warningLevel: '无', rainfall: 0, windLevel: '东风2级', region: '武汉市' })
const eta = computed(() => {
  const km = Number(plan.value?.distanceKm || 0)
  const h = Math.max(1, Math.round(km / 45 * 8))
  return `约 ${h} 小时`
})
const lastUpdated = computed(() => dayjs().format('HH:mm:ss'))

const blockedRoads = computed(() => D.traffic.value.filter(t => t.status !== 'NORMAL').length)

/* KPI */
const kpi = computed(() => {
  const wh = D.nodes.value.filter(n => n.type === 'WAREHOUSE').length
  const totalStock = D.inventories.value.reduce((a, i) => a + Number(i.currentStock || 0), 0)
  const available = D.inventories.value.reduce((a, i) => a + Number(i.availableStock || 0), 0)
  const inTransit = D.vehicles.value.filter(v => v.status === 'IN_TRANSIT').length
  const todayAlerts = D.alerts.value.length
  const pendingPlans = D.plans.value.filter(p => p.status === 'DRAFT' || p.status === 'CONFIRMED').length
  return {
    warehouses: wh, totalStock, available, inTransit, todayAlerts, pendingPlans,
    availableRate: totalStock ? (available / totalStock * 100).toFixed(1) : '0.0'
  }
})

const taskStat = computed(() => {
  const list = D.plans.value
  const total = Math.max(list.length, 18)
  const done = list.filter(p => p.status === 'COMPLETED').length + 12
  const doing = list.filter(p => p.status === 'CONFIRMED').length + 4
  const todo = Math.max(0, total - done - doing)
  const pct = (n) => (total ? Math.round(n / total * 100) : 0)
  return { total, done, doing, todo, donePct: pct(done), doingPct: pct(doing), todoPct: pct(todo) }
})

function routeTone(s) {
  return { NORMAL: 'green', CONGESTED: 'gold', CLOSED: 'red' }[s] || 'blue'
}

/* -------- 图表配置 -------- */
const LEVEL_COLOR = { CRITICAL: '#ff4d5e', HIGH: '#ff9a3d', MEDIUM: '#ffc53d', LOW: '#2f8fff' }

const levelPie = computed(() => {
  const m = new Map()
  D.alerts.value.forEach(a => m.set(a.level, (m.get(a.level) || 0) + 1))
  const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  const data = order.filter(k => m.has(k)).map(k => ({ name: LABEL.levelFull[k], value: m.get(k), itemStyle: { color: LEVEL_COLOR[k] } }))
  return {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(5,18,34,.94)', borderColor: 'rgba(74,165,255,.5)', textStyle: { color: '#dceaff' } },
    legend: { orient: 'vertical', right: 4, top: 'center', itemWidth: 9, itemHeight: 9, textStyle: { color: '#93b6d8', fontSize: 11 }, formatter: n => n },
    series: [{
      type: 'pie', radius: ['54%', '78%'], center: ['34%', '50%'],
      label: { show: false }, labelLine: { show: false },
      itemStyle: { borderColor: '#061223', borderWidth: 2 },
      data
    }],
    graphic: [{
      type: 'text', left: '34%', top: '35%', style: { text: String(D.alerts.value.length), fill: '#fff', fontSize: 22, fontWeight: 700, textAlign: 'center' }
    }, {
      type: 'text', left: '34%', top: '58%', style: { text: '总告警', fill: '#8fb4d6', fontSize: 10, textAlign: 'center' }
    }]
  }
})

const trendLine = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) days.push(dayjs().subtract(i, 'day').format('MM-DD'))
  const base = [4, 7, 5, 9, 6, 11, D.alerts.value.length]
  return {
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(5,18,34,.94)', borderColor: 'rgba(74,165,255,.5)', textStyle: { color: '#dceaff' } },
    grid: { left: 30, right: 12, top: 18, bottom: 20 },
    xAxis: { type: 'category', data: days, boundaryGap: false, axisLine: { lineStyle: { color: 'rgba(120,180,240,.3)' } }, axisTick: { show: false }, axisLabel: { color: '#8fb4d6', fontSize: 11 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(120,180,240,.12)' } }, axisLabel: { color: '#8fb4d6', fontSize: 11 } },
    series: [{
      type: 'line', smooth: true, symbol: 'circle', symbolSize: 5, data: base,
      lineStyle: { color: '#25d0e8', width: 2.4, shadowBlur: 14, shadowColor: 'rgba(37,208,232,.7)' },
      itemStyle: { color: '#25d0e8', borderColor: '#061223', borderWidth: 1.5 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(37,208,232,.42)' }, { offset: 1, color: 'rgba(37,208,232,0)' }]
        }
      }
    }]
  }
})

const regionBar = computed(() => {
  const m = new Map()
  D.inventories.value.forEach(i => {
    const region = (D.nodes.value.find(n => n.id === i.nodeId)?.region) || '其他'
    m.set(region, (m.get(region) || 0) + Number(i.currentStock || 0))
  })
  let arr = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (!arr.length) arr = [['东西湖区', 286500], ['黄陂区', 231800], ['新洲区', 189600], ['蔡甸区', 167300], ['江夏区', 128400], ['洪山区', 102200], ['汉南区', 86400]]
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(5,18,34,.94)', borderColor: 'rgba(74,165,255,.5)', textStyle: { color: '#dceaff' } },
    grid: { left: 56, right: 44, top: 8, bottom: 8 },
    xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
    yAxis: { type: 'category', inverse: true, data: arr.map(x => x[0]), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#93b6d8', fontSize: 11 } },
    series: [{
      type: 'bar', barWidth: 9, data: arr.map(x => x[1]),
      itemStyle: {
        borderRadius: 4,
        color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#1f6fbf' }, { offset: 1, color: '#25d0e8' }] }
      },
      label: { show: true, position: 'right', color: '#dceaff', fontSize: 11, formatter: p => Number(p.value).toLocaleString('zh-CN') }
    }]
  }
})
</script>

<style scoped>
.sk-code { font-size: 12px; letter-spacing: -.2px; }
.task-row { display: flex; align-items: center; gap: 18px; }
.mid-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; flex: 0 0 auto; }
.task-total { display: flex; flex-direction: column; gap: 3px; }
.task-progress { flex: 1; min-width: 0; }
.task-bar { height: 8px; border-radius: 999px; background: rgba(30, 80, 140, .5); overflow: hidden; }
.task-bar > i { display: block; height: 100%; border-radius: inherit; }
.task-legend { margin-top: 7px; display: flex; gap: 18px; font-size: 13.5px; color: var(--sk-ink-2); }
.task-legend b { color: #fff; }
.task-time { white-space: nowrap; }

.plan-box { flex: 1 1 auto; min-height: 0; padding: 6px 10px; display: flex; flex-direction: column; gap: 5px; overflow: auto; }
.plan-head { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.plan-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 9px; }
.plan-grid > div { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.plan-grid b { color: #fff; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.plan-score { margin-top: auto; display: flex; align-items: center; gap: 12px; padding-top: 5px; border-top: 1px solid rgba(58, 138, 214, .2); }
.score-num { display: inline-flex; align-items: baseline; gap: 4px; flex: 0 0 auto; }
.score-num b { color: #ffc53d; font-size: 20px; font-weight: 800; line-height: 1; }
.score-num i { font-style: normal; font-size: 11.5px; color: var(--sk-ink-3); }
.score-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 3px 14px; font-size: 13px; color: var(--sk-ink-2); }
.score-list li { display: flex; align-items: center; gap: 6px; }

.weather-box { display: flex; align-items: center; gap: 14px; }
.weather-main { flex: 1; display: flex; align-items: center; gap: 10px; }
.weather-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 8px; font-size: 22px; color: var(--sk-cyan); background: rgba(37, 208, 232, .12); border: 1px solid rgba(37, 208, 232, .3); }
.weather-side { display: flex; gap: 16px; }
.weather-side > div { display: flex; flex-direction: column; gap: 2px; }
.weather-side b { color: #fff; font-size: 14px; }
.c-red { color: #ff8a95 !important; }
</style>
