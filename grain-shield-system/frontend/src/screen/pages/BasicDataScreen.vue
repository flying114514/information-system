<template>
  <ScreenShell
    subtitle="基础数据与系统管理大屏"
    active="/screen/basic"
    :kpi-count="6"
    columns="minmax(0, 1.02fr) minmax(0, 1.86fr) minmax(0, 1.02fr)"
  >
    <template #kpis>
      <KpiTile label="粮库节点总数" :value="stat.warehouse" unit="个" icon="OfficeBuilding" tone="gold" delta="较昨日 +2" dir="up" />
      <KpiTile label="配送节点数" :value="stat.distribution" unit="个" icon="Shop" tone="blue" delta="较昨日 +6" dir="up" />
      <KpiTile label="运输线路数" :value="stat.routes" unit="条" icon="Guide" tone="green" delta="较昨日 +8" dir="up" />
      <KpiTile label="车辆总数" :value="stat.vehicles" unit="辆" icon="Van" tone="blue" delta="较昨日 +12" dir="up" />
      <KpiTile label="粮食品种数" :value="stat.grainTypes" unit="类" icon="Box" tone="gold" delta="较昨日 +1" dir="up" />
      <KpiTile label="用户角色数" :value="stat.roles" unit="个" icon="UserFilled" tone="green" delta="较昨日 0" dir="flat" />
    </template>

    <!-- 左栏 -->
    <div class="sk-col">
      <ScreenPanel title="节点基础信息总览" icon="DataAnalysis" style="flex:1.05">
        <BaseChart :option="nodePie" />
      </ScreenPanel>

      <ScreenPanel title="库存与粮食品种概览" icon="Histogram" style="flex:1.02">
        <BaseChart :option="stockBar" />
      </ScreenPanel>

      <ScreenPanel title="模拟状态数据接入" icon="Connection" style="flex:1.15" body-class="sk-panel__body--flush">
        <ScreenTable :columns="accessCols" :rows="accessRows" />
      </ScreenPanel>
    </div>

    <!-- 中栏 -->
    <div class="sk-col">
      <ScreenPanel title="武汉市粮食供应链基础数据分布" icon="MapLocation" style="flex:1" body-class="sk-panel__body--flush">
        <DarkMap :nodes="nodes" :routes="routes" :show-legend="true" />
      </ScreenPanel>

      <div class="mid-bottom">
        <ScreenPanel title="节点与车辆状态统计" icon="Odometer" body-class="sk-panel__body--flush" style="flex:1">
          <div class="stat-strip">
            <div class="stat-block">
              <h4>节点（个）</h4>
              <div class="stat-items">
                <div v-for="it in nodeStatItems" :key="it.label">
                  <i :style="{ background: it.color, boxShadow: `0 0 8px ${it.color}` }"></i>
                  <span class="sk-label--sm">{{ it.label }}</span>
                  <b class="sk-num">{{ it.value }}</b>
                </div>
              </div>
            </div>
            <div class="stat-block">
              <h4>车辆（辆）</h4>
              <div class="stat-items">
                <div v-for="it in vehicleStatItems" :key="it.label">
                  <i :style="{ background: it.color, boxShadow: `0 0 8px ${it.color}` }"></i>
                  <span class="sk-label--sm">{{ it.label }}</span>
                  <b class="sk-num">{{ it.value }}</b>
                </div>
              </div>
            </div>
          </div>
        </ScreenPanel>

        <ScreenPanel title="最新数据记录接入" icon="Document" body-class="sk-panel__body--flush" style="flex:1.08">
          <ScreenTable :columns="recordCols" :rows="recordRows" />
        </ScreenPanel>
      </div>
    </div>

    <!-- 右栏 -->
    <div class="sk-col">
      <ScreenPanel title="运输线路与车辆管理" icon="Van" extra="更多" style="flex:1.1" body-class="sk-panel__body--flush">
        <ScreenTable :columns="routeCols" :rows="routeRows">
          <template #status="{ row }">
            <span class="sk-tag" :class="`sk-tag--${routeTone(row.status)}`">{{ LABEL.routeStatus[row.status] }}</span>
          </template>
        </ScreenTable>
      </ScreenPanel>

      <ScreenPanel title="风险规则配置概览" icon="SetUp" extra="更多" style="flex:1.15" body-class="sk-panel__body--flush">
        <ScreenTable :columns="ruleCols" :rows="ruleRows">
          <template #level="{ row }">
            <span class="sk-tag" :class="`sk-tag--${TONE[row.alarmLevel]}`">{{ LABEL.level[row.alarmLevel] }}</span>
          </template>
          <template #enabled="{ row }">
            <span class="sk-tag" :class="row.enabled ? 'sk-tag--green' : 'sk-tag--gray'">{{ row.enabled ? '已启用' : '已停用' }}</span>
          </template>
        </ScreenTable>
      </ScreenPanel>

      <ScreenPanel title="用户与权限管理" icon="UserFilled" extra="更多" style="flex:1.05">
        <div class="user-box">
          <div class="user-pie">
            <BaseChart :option="rolePie" />
          </div>
          <div class="role-list">
            <div v-for="r in roleRows" :key="r.role" class="role-item">
              <i :style="{ background: r.color }"></i>
              <span>{{ r.label }}</span>
              <b class="sk-num">{{ r.pct }}%</b>
            </div>
          </div>
        </div>
      </ScreenPanel>
    </div>

    <template #footer>
      <div class="sk-footer-grid">
        <ScreenPanel title="今日数据更新与维护任务进度" icon="Timer" style="flex:1.35">
          <div class="maint-row">
            <div v-for="m in maint" :key="m.label" class="maint-item">
              <div class="maint-head">
                <span>{{ m.label }}</span>
                <b class="sk-num">{{ m.pct }}%</b>
              </div>
              <div class="sk-meter"><i :style="{ width: m.pct + '%' }"></i></div>
            </div>
          </div>
        </ScreenPanel>

        <ScreenPanel title="操作日志" icon="Document" extra="更多" style="flex:1" body-class="sk-panel__body--flush">
          <ScreenTable :columns="logCols" :rows="logRows">
            <template #action="{ row }">
              <span class="sk-tag sk-tag--blue">{{ row.action }}</span>
            </template>
          </ScreenTable>
        </ScreenPanel>
      </div>
    </template>
  </ScreenShell>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import ScreenShell from '../components/ScreenShell.vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import KpiTile from '../components/KpiTile.vue'
import BaseChart from '../components/BaseChart.vue'
import DarkMap from '../components/DarkMap.vue'
import ScreenTable from '../components/ScreenTable.vue'
import { useScreenData, loadScreenData, LABEL, TONE } from '../useScreenData'

const D = useScreenData()
onMounted(() => loadScreenData())

const nodes = computed(() => D.nodes.value)
const routes = computed(() => D.routes.value)
const routeTone = (s) => ({ NORMAL: 'green', CONGESTED: 'gold', CLOSED: 'red' }[s] || 'blue')
const fmt = (n) => Number(n || 0).toLocaleString('zh-CN')

/* ---------- 统计 ---------- */
const stat = computed(() => ({
  warehouse: D.nodes.value.filter(n => n.type === 'WAREHOUSE').length,
  distribution: D.nodes.value.filter(n => n.type === 'DISTRIBUTION').length,
  routes: D.routes.value.length,
  vehicles: D.vehicles.value.length,
  grainTypes: [...new Set(D.inventories.value.map(i => i.grainType))].length,
  roles: new Set(D.users.value.map(u => u.role)).size
}))

const nodeStatItems = computed(() => [
  { label: '粮库', value: stat.value.warehouse, color: '#38d996' },
  { label: '加工企业', value: D.nodes.value.filter(n => n.type === 'PROCESSING').length, color: '#2f8fff' },
  { label: '配送点', value: stat.value.distribution, color: '#25d0e8' }
])

const vehicleStatItems = computed(() => {
  const c = (s) => D.vehicles.value.filter(v => v.status === s).length
  return [
    { label: '可调度', value: c('AVAILABLE'), color: '#38d996' },
    { label: '在途', value: c('IN_TRANSIT'), color: '#25d0e8' },
    { label: '检修/离线', value: c('MAINTENANCE') + c('OFFLINE'), color: '#ff4d5e' }
  ]
})

/* ---------- 节点基础信息总览 ---------- */
const TYPE_COLOR = { WAREHOUSE: '#38d996', PROCESSING: '#2f8fff', DISTRIBUTION: '#25d0e8', LOGISTICS: '#ffc53d' }

const nodePie = computed(() => {
  const total = D.nodes.value.length || 1
  const order = ['WAREHOUSE', 'PROCESSING', 'DISTRIBUTION']
  const data = order.map(t => ({
    name: LABEL.nodeType[t],
    value: D.nodes.value.filter(n => n.type === t).length,
    itemStyle: { color: TYPE_COLOR[t] }
  })).filter(d => d.value > 0)
  return {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(5,18,34,.94)', borderColor: 'rgba(74,165,255,.5)', textStyle: { color: '#dceaff' } },
    legend: {
      orient: 'vertical', right: 6, top: 'center', itemWidth: 9, itemHeight: 9,
      textStyle: { color: '#93b6d8', fontSize: 11 },
      formatter: (n) => {
        const d = data.find(x => x.name === n)
        return `${n}  ${d ? d.value : 0}  ${d ? (d.value / total * 100).toFixed(1) : 0}%`
      }
    },
    series: [{
      type: 'pie', radius: ['52%', '76%'], center: ['32%', '50%'],
      label: { show: false }, labelLine: { show: false },
      itemStyle: { borderColor: '#061223', borderWidth: 2 },
      data
    }],
    graphic: [
      { type: 'text', left: '32%', top: '35%', style: { text: String(D.nodes.value.length), fill: '#fff', fontSize: 22, fontWeight: 700, textAlign: 'center' } },
      { type: 'text', left: '32%', top: '58%', style: { text: '节点总数', fill: '#8fb4d6', fontSize: 10, textAlign: 'center' } }
    ]
  }
})

/* ---------- 库存与粮食品种 ---------- */
const stockBar = computed(() => {
  const m = new Map()
  D.inventories.value.forEach(i => {
    const cur = m.get(i.grainType) || { cur: 0, safe: 0 }
    cur.cur += Number(i.currentStock || 0)
    cur.safe += Number(i.safetyStock || 0)
    m.set(i.grainType, cur)
  })
  let arr = [...m.entries()].slice(0, 6)
  if (!arr.length) arr = [['稻谷', { cur: 286, safe: 180 }], ['小麦', { cur: 220, safe: 150 }], ['玉米', { cur: 231, safe: 140 }], ['成品粮', { cur: 180, safe: 120 }]]
  return {
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(5,18,34,.94)', borderColor: 'rgba(74,165,255,.5)', textStyle: { color: '#dceaff' } },
    legend: { right: 0, top: 0, itemWidth: 9, itemHeight: 9, textStyle: { color: '#93b6d8', fontSize: 11 } },
    // left 需给「12.5万」这类轴标签留出宽度，否则会被裁成 "0,000"
    grid: { left: 48, right: 8, top: 24, bottom: 18 },
    xAxis: { type: 'category', data: arr.map(x => x[0]), axisTick: { show: false }, axisLine: { lineStyle: { color: 'rgba(120,180,240,.3)' } }, axisLabel: { color: '#8fb4d6', fontSize: 10.5 } },
    yAxis: {
      type: 'value', splitNumber: 3,
      splitLine: { lineStyle: { color: 'rgba(120,180,240,.12)' } },
      axisLabel: { color: '#8fb4d6', fontSize: 10.5, formatter: v => (v >= 10000 ? (v / 10000).toFixed(v % 10000 ? 1 : 0) + '万' : String(v)) }
    },
    series: [
      { name: '当前库存', type: 'bar', barWidth: 11, itemStyle: { borderRadius: [3, 3, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#25d0e8' }, { offset: 1, color: '#1f6fbf' }] } }, data: arr.map(x => x[1].cur) },
      { name: '安全库存', type: 'bar', barWidth: 11, itemStyle: { borderRadius: [3, 3, 0, 0], color: 'rgba(255,197,61,.7)' }, data: arr.map(x => x[1].safe) }
    ]
  }
})

/* ---------- 模拟状态接入 ---------- */
const accessCols = [
  { prop: 'source', label: '数据来源', width: '24%' },
  { prop: 'status', label: '状态', width: '16%' },
  { prop: 'count', label: '今日记录', width: '30%' },
  { prop: 'time', label: '最新接入', width: '30%' }
]
const accessRows = computed(() => [
  { id: 1, source: '气象数据', status: '正常', count: fmt(D.weather.value.length * 320 + 940), time: '10-25 14:20' },
  { id: 2, source: '交通数据', status: '正常', count: fmt(D.traffic.value.length * 220 + 12), time: '10-25 14:18' },
  { id: 3, source: '粮情数据', status: '正常', count: fmt(D.iot.value.length * 114), time: '10-25 14:20' },
  { id: 4, source: '车辆GPS', status: '正常', count: fmt(D.vehicles.value.length * 68 + 24), time: '10-25 14:10' }
])

/* ---------- 最新数据记录 ---------- */
const recordCols = [
  { prop: 'time', label: '时间', width: '30%' },
  { prop: 'type', label: '数据类型', width: '26%' },
  { prop: 'source', label: '来源', width: '26%' },
  { prop: 'status', label: '状态', width: '18%' }
]
const recordRows = computed(() => {
  const types = ['气象数据', '交通数据', '粮情数据', '车辆GPS', '库存数据']
  const srcs = ['API接口', 'API接口', 'IoT采集', 'API接口', 'CSV导入']
  return types.map((t, i) => ({
    id: i + 1,
    time: '10-25 ' + String(14 - i).padStart(2, '0') + ':' + String(20 - i * 3).padStart(2, '0'),
    type: t, source: srcs[i], status: i === 1 ? '处理中' : '正常'
  }))
})

/* ---------- 运输线路与车辆 ---------- */
const routeCols = [
  { prop: 'name', label: '线路名称', width: '40%' },
  { prop: 'distanceKm', label: '里程', width: '18%' },
  { prop: 'vehicleCount', label: '车辆', width: '20%' },
  { prop: 'status', label: '状态', width: '22%' }
]
const routeRows = computed(() => D.routes.value.slice(0, 3).map((r, i) => ({ ...r, distanceKm: r.distanceKm + ' km', vehicleCount: 6 + (i * 5) % 40 })))

/* ---------- 风险规则 ---------- */
const ruleCols = [
  { prop: 'name', label: '规则名称', width: '24%' },
  { prop: 'metric', label: '监测指标', width: '20%' },
  { prop: 'thresholdText', label: '阈值设置', width: '36%' },
  { prop: 'level', label: '风险等级', width: '20%' }
]
const ruleRows = computed(() => D.rules.value.slice(0, 3))

/* ---------- 用户与权限 ---------- */
const ROLE_COLOR = { ADMIN: '#ff4d5e', DISPATCHER: '#2f8fff', NODE_MANAGER: '#25d0e8' }
const rolePie = computed(() => {
  const m = new Map()
  D.users.value.forEach(u => m.set(u.role, (m.get(u.role) || 0) + 1))
  const data = [...m.entries()].map(([r, v]) => ({ name: LABEL.role[r], value: v, itemStyle: { color: ROLE_COLOR[r] || '#38d996' } }))
  return {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(5,18,34,.94)', borderColor: 'rgba(74,165,255,.5)', textStyle: { color: '#dceaff' } },
    series: [{ type: 'pie', radius: ['56%', '80%'], center: ['50%', '50%'], label: { show: false }, labelLine: { show: false }, itemStyle: { borderColor: '#061223', borderWidth: 2 }, data }],
    graphic: [
      { type: 'text', left: '50%', top: '35%', style: { text: String(D.users.value.length), fill: '#fff', fontSize: 20, fontWeight: 700, textAlign: 'center' } },
      { type: 'text', left: '50%', top: '58%', style: { text: '用户总数', fill: '#8fb4d6', fontSize: 10, textAlign: 'center' } }
    ]
  }
})
const roleRows = computed(() => {
  const total = D.users.value.length || 1
  const m = new Map()
  D.users.value.forEach(u => m.set(u.role, (m.get(u.role) || 0) + 1))
  return [...m.entries()].map(([r, v]) => ({ role: r, label: LABEL.role[r], pct: (v / total * 100).toFixed(1), color: ROLE_COLOR[r] }))
})

/* ---------- 操作日志 ---------- */
const logCols = [
  { prop: 'createdAt', label: '时间', width: '26%' },
  { prop: 'username', label: '操作人', width: '18%' },
  { prop: 'action', label: '类型', width: '16%' },
  { prop: 'detail', label: '操作内容', width: '40%' }
]
const logRows = computed(() => D.logs.value.slice(0, 2))

/* ---------- 维护进度 ---------- */
const maint = computed(() => {
  const nodeTotal = Math.max(D.nodes.value.length, 32)
  const routeTotal = Math.max(D.routes.value.length, 126)
  const vehTotal = Math.max(D.vehicles.value.length, 320)
  const ruleTotal = Math.max(D.rules.value.length, 12)
  return [
    { label: '基础数据同步', pct: 100, detail: `${nodeTotal}/${nodeTotal}` },
    { label: '节点信息维护', pct: 100, detail: `${nodeTotal}/${nodeTotal}` },
    { label: '运输线路更新', pct: 98, detail: `${routeTotal - 2}/${routeTotal}` },
    { label: '车辆位置更新', pct: 98, detail: `${Math.round(vehTotal * 0.9845)}/${vehTotal}` },
    { label: '风险规则检查', pct: 100, detail: `${ruleTotal}/${ruleTotal}` }
  ]
})
</script>

<style scoped>
.mid-bottom { display: grid; grid-template-columns: 1fr 1.08fr; gap: 10px; flex: 0 0 auto; }
.sk-footer-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 10px; }

.stat-strip { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 9px 12px; }
.stat-block h4 { margin: 0 0 6px; font-size: 13.5px; color: #cfe6ff; font-weight: 700; }
.stat-items { display: flex; flex-direction: column; gap: 5px; }
.stat-items > div { display: flex; align-items: center; gap: 7px; }
.stat-items i { width: 6px; height: 6px; border-radius: 50%; flex: 0 0 auto; }
.stat-items b { margin-left: auto; color: #fff; font-size: 14px; }

.user-box { flex: 1 1 auto; min-height: 0; display: flex; align-items: center; gap: 10px; }
/* 关键：.sk-chart 靠 flex:1 撑高，父级必须是 flex 且不能 align-items:center（会塌成 0 高），
   所以这里用 align-self:stretch 让容器吃满高度，环形图才有高度 */
.user-pie { flex: 0 0 118px; align-self: stretch; min-height: 0; display: flex; }
.role-list { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.role-item { display: flex; align-items: center; gap: 7px; padding: 5px 8px; border: 1px solid rgba(58, 138, 214, .2); border-radius: 5px; background: rgba(20, 52, 92, .3); font-size: 13px; }
.role-item i { width: 6px; height: 6px; border-radius: 50%; flex: 0 0 auto; }
.role-item span { color: var(--sk-ink-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.role-item b { margin-left: auto; color: #fff; }

/* 极矮视口（<620px）：用户面板与角色列表再收紧 */
@media (max-height: 620px) {
  .role-list { gap: 4px; }
  .role-item { padding: 3px 7px; font-size: 12px; }
}

.maint-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
.maint-item { display: flex; flex-direction: column; gap: 5px; }
.maint-head { display: flex; align-items: center; justify-content: space-between; font-size: 13.5px; color: var(--sk-ink-2); }
.maint-head b { color: var(--sk-cyan); }
</style>
