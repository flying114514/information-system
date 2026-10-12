<template>
  <ScreenShell
    subtitle="应急调度与方案推荐大屏"
    active="/screen/dispatch"
    :kpi-count="6"
    columns="minmax(0, 1.05fr) minmax(0, 1.82fr) minmax(0, 1.12fr)"
  >
    <template #kpis>
      <KpiTile label="待调度方案" :value="stat.draft" unit="个" icon="Document" tone="gold" delta="较昨日 +2" dir="up" />
      <KpiTile label="应急调拨总量" :value="stat.qty" unit="吨" icon="Box" tone="blue" delta="较昨日 +1,200" dir="up" />
      <KpiTile label="可用调度车辆" :value="stat.availVehicles" unit="辆" icon="Van" tone="green" delta="较昨日 +3" dir="up" />
      <KpiTile label="平均运输距离" :value="stat.dist" unit="km" icon="Guide" tone="blue" delta="较昨日 -6km" dir="down" />
      <KpiTile label="方案执行率" :value="stat.execRate" unit="%" icon="Odometer" tone="gold" :decimals="1" delta="较昨日 +4.2%" dir="up" />
      <KpiTile label="平均响应时长" :value="26" unit="分钟" icon="Timer" tone="orange" delta="较昨日 -8min" dir="down" />
    </template>

    <!-- 左栏 -->
    <div class="sk-col">
      <ScreenPanel title="风险影响分析" icon="DataAnalysis" extra="更多" style="flex:1.55">
        <BaseChart :option="impactBar" />
      </ScreenPanel>

      <ScreenPanel title="备选粮库筛选" icon="Management" extra="智能排序" style="flex:1.05" body-class="sk-panel__body--flush">
        <ScreenTable :columns="candCols" :rows="candidates" center>
          <template #name="{ row }">
            <span class="cand-name">
              <el-icon v-if="row.best" class="cand-star"><StarFilled /></el-icon>
              {{ row.name }}
            </span>
          </template>
          <template #available="{ row }"><span class="sk-num c-cyan">{{ row.available.toLocaleString('zh-CN') }}</span></template>
          <template #distance="{ row }"><span class="sk-num">{{ row.distance }}</span></template>
          <template #score="{ row }">
            <span class="sk-tag" :class="`sk-tag--${row.score >= 90 ? 'green' : row.score >= 75 ? 'gold' : 'blue'}`">{{ row.score }}</span>
          </template>
        </ScreenTable>
      </ScreenPanel>

      <ScreenPanel title="推荐理由" icon="Promotion" style="flex:0.75">
        <div class="reason-box">
          <p class="reason-main">{{ reason.main }}</p>
          <ul class="reason-list">
            <li v-for="(r, i) in reason.items.slice(0, 1)" :key="i">
              <i class="sk-dot sk-dot--green"></i><span>{{ r }}</span>
            </li>
          </ul>
        </div>
      </ScreenPanel>
    </div>

    <!-- 中栏 -->
    <div class="sk-col">
      <ScreenPanel title="武汉市应急调度路线规划" icon="MapLocation" style="flex:1" body-class="sk-panel__body--flush">
        <DarkMap
          :nodes="nodes"
          :routes="routes"
          :alerts="alerts"
          :highlight-routes="hlRoutes"
          :recommend-path="recommendPoints"
          :show-legend="true"
        />
        <div class="map-tip" v-if="activePlan">
          <i class="sk-dot sk-dot--green"></i>
          <span>推荐路径：{{ activePlan.sourceNodeName }} → {{ activePlan.routePath || activePlan.targetNodeName }}</span>
          <b class="sk-num">{{ activePlan.distanceKm }} km</b>
        </div>
      </ScreenPanel>

      <ScreenPanel title="调度任务执行进度" icon="Odometer" style="flex:0 0 auto">
        <div class="prog-list">
          <div v-for="p in taskProgress" :key="p.label" class="prog-item">
            <span class="prog-label">{{ p.label }}</span>
            <div class="sk-meter" style="flex:1"><i :style="{ width: p.value + '%', background: p.color }"></i></div>
            <b class="sk-num" :style="{ color: p.color }">{{ p.value }}%</b>
          </div>
        </div>
      </ScreenPanel>
    </div>

    <!-- 右栏 -->
    <div class="sk-col">
      <ScreenPanel title="可行路线对比" icon="Sort" extra="更多" style="flex:1.25" body-class="sk-panel__body--flush">
        <ScreenTable :columns="routeCols" :rows="routeCandidates" center>
          <template #name="{ row }">
            <span class="route-name">
              <i v-if="row.best" class="sk-dot sk-dot--green"></i>{{ row.name }}
            </span>
          </template>
          <template #distanceKm="{ row }"><span class="sk-num">{{ row.distanceKm }}</span></template>
          <template #hours="{ row }"><span class="sk-num">{{ row.hours }}</span></template>
          <template #status="{ row }">
            <span class="sk-tag" :class="`sk-tag--${routeTone(row.status)}`">{{ row.statusLabel }}</span>
          </template>
          <template #score="{ row }">
            <span class="sk-tag" :class="`sk-tag--${row.score >= 90 ? 'green' : row.score >= 65 ? 'gold' : 'red'}`">{{ row.score }}</span>
          </template>
        </ScreenTable>
      </ScreenPanel>

      <ScreenPanel title="调度建议详情" icon="Document" extra="更多" style="flex:1.6" body-class="sk-panel__body--flush">
        <div class="plan-box" v-if="activePlan">
          <div class="plan-head">
            <span class="sk-tag sk-tag--gold">{{ activePlan.code }}</span>
            <b>{{ activePlan.sourceNodeName }} <el-icon class="arrow"><Right /></el-icon> {{ activePlan.targetNodeName }}</b>
          </div>
          <div class="plan-grid">
            <div><span class="sk-label--sm">粮食品种</span><b>{{ activePlan.grainType }}</b></div>
            <div><span class="sk-label--sm">运输车辆</span><b class="sk-num">{{ activePlan.plateNumber || '待指派' }}</b></div>
            <div><span class="sk-label--sm">建议调拨量</span><b class="c-gold sk-num">{{ (activePlan.suggestedQuantity || 0).toLocaleString('zh-CN') }} 吨</b></div>
            <div><span class="sk-label--sm">运输距离</span><b class="sk-num">{{ activePlan.distanceKm }} km</b></div>
          </div>
          <div class="plan-actions">
            <button class="sk-btn sk-btn--gray" @click="toast('已调整方案参数')">修改参数</button>
            <button class="sk-btn sk-btn--gold" @click="toast('调度方案已重新生成')">生成方案</button>
            <button class="sk-btn sk-btn--blue" @click="toast('调度指令已下发至执行节点')">下发指令</button>
          </div>
        </div>
        <div v-else class="sk-empty">暂无调度方案</div>
      </ScreenPanel>

      <ScreenPanel title="车辆与执行反馈" icon="Connection" extra="更多" style="flex:1.5" body-class="sk-panel__body--flush">
        <div class="veh-wrap">
          <div class="veh-chips">
            <div v-for="v in vehicleStat" :key="v.key" class="veh-chip">
              <span class="sk-tag" :class="`sk-tag--${v.tone}`">{{ v.label }}</span>
              <b class="sk-num">{{ v.value }}</b>
            </div>
          </div>
          <div class="sk-list">
            <div v-for="f in feedbacks.slice(0, 2)" :key="f.id" class="sk-list__item fb-item">
              <span class="sk-tag" :class="`sk-tag--${f.tone}`">{{ f.type }}</span>
              <span class="fb-text">{{ f.text }}</span>
              <span class="sk-label--sm fb-time">{{ f.time }}</span>
            </div>
          </div>
        </div>
      </ScreenPanel>
    </div>

    <template #footer>
      <div class="sk-footer-grid">
        <ScreenPanel title="应急调度方案流程" icon="SetUp" style="flex:1.35">
          <div class="steps">
            <template v-for="(s, i) in steps" :key="s">
              <div class="step" :class="{ 'is-done': i < currentStep, 'is-active': i === currentStep }">
                <span class="step-dot"><el-icon v-if="i < currentStep"><Select /></el-icon><template v-else>{{ i + 1 }}</template></span>
                <span class="step-label">{{ s }}</span>
              </div>
              <span v-if="i < steps.length - 1" class="step-line" :class="{ 'is-done': i < currentStep }"></span>
            </template>
          </div>
        </ScreenPanel>

        <ScreenPanel title="今日调度统计" icon="DataBoard" style="flex:1">
          <div class="task-strip">
            <div v-for="t in taskStat" :key="t.label" class="task-item">
              <b class="sk-big" :style="{ color: t.color, fontSize: '24px' }">{{ t.value }}</b>
              <span class="sk-label--sm">{{ t.label }}</span>
            </div>
          </div>
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
import { useScreenData, loadScreenData, LABEL } from '../useScreenData'
import { skToast } from '../toast'

const D = useScreenData()
onMounted(() => loadScreenData())

const nodes = computed(() => D.nodes.value)
const routes = computed(() => D.routes.value)
const alerts = computed(() => D.alerts.value)
const plans = computed(() => D.plans.value)
const activePlan = computed(() => plans.value.find(p => p.status === 'DRAFT') || plans.value[0] || null)

function toast(msg) { skToast(msg) }

/* ---------------- KPI ---------------- */
const stat = computed(() => {
  const list = plans.value
  const qty = list.reduce((a, p) => a + (Number(p.suggestedQuantity) || 0), 0)
  const dist = list.length ? Math.round(list.reduce((a, p) => a + (Number(p.distanceKm) || 0), 0) / list.length) : 0
  const completed = list.filter(p => p.status === 'COMPLETED').length
  return {
    draft: list.filter(p => p.status === 'DRAFT').length,
    qty,
    dist,
    execRate: list.length ? (completed / list.length * 100).toFixed(1) : '0.0',
    availVehicles: D.vehicles.value.filter(v => v.status === 'AVAILABLE').length
  }
})

/* ---------------- 地图路径 ---------------- */
const targetRegion = computed(() => {
  const t = activePlan.value && activePlan.value.targetNodeName
  return t && /区$/.test(t) ? t : '洪山区'
})

const recommendPoints = computed(() => {
  const pts = []
  const src = activePlan.value && D.nodes.value.find(n => n.name === activePlan.value.sourceNodeName)
  const start = src || D.nodes.value.find(n => n.type === 'WAREHOUSE')
  if (start) pts.push(start)
  const mid = D.nodes.value.find(n => n.type === 'DISTRIBUTION' && (n.region || '').includes(targetRegion.value.slice(0, 2)))
    || D.nodes.value.find(n => n.type === 'DISTRIBUTION')
  if (mid && !pts.includes(mid)) pts.push(mid)
  pts.push({ region: targetRegion.value })
  return pts
})

const hlRoutes = computed(() => {
  const ids = recommendPoints.value.filter(p => p && p.id).map(p => p.id)
  return D.routes.value
    .filter(r => ids.includes(r.startNodeId) && ids.includes(r.endNodeId))
    .map(r => r.id)
})

/* ---------------- 风险影响分析 ---------------- */
const impactBar = computed(() => {
  const regs = ['洪山区', '新洲区', '江夏区', '武昌区']
  const arr = regs.map((r, i) => ({ name: r, value: Math.round(3400 - i * 560) }))
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(5,18,34,.94)', borderColor: 'rgba(74,165,255,.5)', textStyle: { color: '#dceaff' } },
    grid: { left: 58, right: 62, top: 8, bottom: 8 },
    xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
    yAxis: { type: 'category', inverse: true, data: arr.map(x => x.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#93b6d8', fontSize: 12 } },
    series: [{
      type: 'bar', barWidth: 14,
      data: arr.map((x, i) => ({
        value: x.value,
        itemStyle: { borderRadius: 4, color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: i < 2 ? '#ff4d5e' : '#ffc53d' }, { offset: 1, color: i < 2 ? '#ff9a3d' : '#25d0e8' }] } }
      })),
      label: { show: true, position: 'right', color: '#dceaff', fontSize: 12, formatter: p => `${p.value} 吨` }
    }]
  }
})

/* ---------------- 备选粮库 ---------------- */
const candCols = [
  { prop: 'name', label: '备选粮库', width: '37%' },
  { prop: 'available', label: '可用库存', width: '25%' },
  { prop: 'distance', label: '距目标', width: '18%' },
  { prop: 'score', label: '评分', width: '20%' }
]
const candidates = computed(() => {
  const wh = D.nodes.value.filter(n => n.type === 'WAREHOUSE').slice(0, 3)
  return wh.map((n, i) => {
    const invs = D.inventories.value.filter(v => v.nodeId === n.id)
    const avail = invs.reduce((a, v) => a + (Number(v.availableStock) || 0), 0)
    return {
      id: n.id,
      name: n.name,
      available: avail || (n.capacity ? Math.round(n.capacity * 0.55) : 20000),
      distance: 34 + i * 8,
      score: Math.max(60, 96 - i * 6),
      best: i === 0
    }
  })
})

const reason = computed(() => {
  const p = activePlan.value
  const src = p ? p.sourceNodeName : '东西湖中心粮库'
  return {
    main: `${src}库存充足、距离近，成本最优，为首选。`,
    items: [
      `目标区域「${targetRegion.value}」存在供给缺口，需优先补足。`,
      `${src}可用库存高于安全库存线，具备应急调出能力。`,
      '所选车辆状态良好，主干道通行正常，时效达标。',
      '方案满足「就近调拨、成本最优、时效优先」原则。'
    ]
  }
})

/* ---------------- 可行路线 ---------------- */
const routeCols = [
  { prop: 'name', label: '候选路线', width: '40%' },
  { prop: 'distanceKm', label: '距离', width: '15%' },
  { prop: 'hours', label: '耗时', width: '15%' },
  { prop: 'status', label: '通行状态', width: '30%' }
]
const routeTone = (s) => ({ NORMAL: 'green', CONGESTED: 'gold', CLOSED: 'red' }[s] || 'blue')
const routeCandidates = computed(() => {
  const rs = D.routes.value.slice(0, 3)
  const rows = rs.map((r, i) => {
    const km = Number(r.distanceKm) || 30
    const speed = r.status === 'CONGESTED' ? 26 : r.status === 'CLOSED' ? 7 : 46
    const score = r.status === 'NORMAL' ? 94 - i * 3 : r.status === 'CONGESTED' ? 70 - i * 3 : 32
    return {
      id: r.id, name: r.name, distanceKm: km,
      hours: Number((km / speed).toFixed(1)),
      status: r.status, statusLabel: LABEL.routeStatus[r.status],
      score: Math.max(20, score)
    }
  }).sort((a, b) => b.score - a.score)
  if (rows.length) rows[0].best = true
  return rows
})

/* ---------------- 任务进度 ---------------- */
const taskProgress = computed(() => [
  { label: '方案生成', value: 100, color: '#38d996' },
  { label: '车辆派遣', value: 100, color: '#38d996' },
  { label: '在途运输', value: 62, color: '#25d0e8' },
  { label: '到货入库', value: 38, color: '#ffc53d' }
])

/* ---------------- 车辆与反馈 ---------------- */
const vehicleStat = computed(() => {
  const v = D.vehicles.value
  return [
    { key: 'AVAILABLE', label: '可调度', tone: 'green', value: v.filter(x => x.status === 'AVAILABLE').length },
    { key: 'IN_TRANSIT', label: '在途', tone: 'blue', value: v.filter(x => x.status === 'IN_TRANSIT').length },
    { key: 'MAINTENANCE', label: '检修', tone: 'orange', value: v.filter(x => x.status === 'MAINTENANCE').length },
    { key: 'OFFLINE', label: '离线', tone: 'gray', value: v.filter(x => x.status === 'OFFLINE').length }
  ]
})

const feedbacks = computed(() => {
  const p = activePlan.value
  const qty = (p?.suggestedQuantity || 8000).toLocaleString('zh-CN')
  const hours = ((p?.distanceKm || 68) / 45).toFixed(1)
  return [
    { id: 1, type: '出库', tone: 'green', text: `${qty} 吨出库交接完成`, time: '15:30' },
    { id: 2, type: '运输', tone: 'blue', text: `已发车，预计 ${hours}h 抵达`, time: '16:10' },
    { id: 3, type: '到达', tone: 'gold', text: '接收点已就绪待核验', time: '待确认' }
  ]
})

/* ---------------- 页脚 ---------------- */
const steps = ['风险研判', '方案生成', '车辆派遣', '在途监控', '到货入库']
const currentStep = 3
const taskStat = computed(() => [
  { label: '调度任务', value: 12, color: '#fff' },
  { label: '已完成', value: 7, color: '#38d996' },
  { label: '进行中', value: 4, color: '#25d0e8' },
  { label: '待执行', value: 1, color: '#ffc53d' }
])
</script>

<style scoped>
.c-cyan { color: var(--sk-cyan) !important; }
.c-gold { color: #ffc53d !important; }

/* 地图提示条 */
.map-tip {
  position: absolute;
  left: 14px;
  bottom: 12px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border: 1px solid rgba(56, 217, 150, .4);
  border-radius: 999px;
  background: rgba(6, 24, 30, .82);
  font-size: 13.5px;
  color: var(--sk-ink-2);
}
.map-tip b { color: var(--sk-green); }

/* 备选粮库 */
.cand-name { display: inline-flex; align-items: center; gap: 4px; color: #dceaff; }
.cand-star { color: var(--sk-gold); font-size: 14px; }

/* 推荐理由 */
.reason-box { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; gap: 6px; overflow: auto; }
.reason-main { margin: 0; font-size: 13px; line-height: 1.5; color: #cfe6ff; }
.reason-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 5px; }
.reason-list li { display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; line-height: 1.45; color: var(--sk-ink-2); }
.reason-list li .sk-dot { margin-top: 5px; flex: 0 0 auto; }

/* 调度任务执行进度 */
.prog-list { display: flex; flex-direction: column; gap: 9px; }
.prog-item { display: flex; align-items: center; gap: 10px; }
.prog-label { width: 62px; font-size: 13.5px; color: var(--sk-ink-2); flex: 0 0 auto; }
.prog-item b { width: 42px; text-align: right; font-size: 13.5px; }

/* 可行路线 */
.route-name { display: inline-flex; align-items: center; gap: 6px; color: #dceaff; }

/* 调度建议详情 */
.plan-box { flex: 1 1 auto; min-height: 0; padding: 6px 9px; display: flex; flex-direction: column; gap: 6px; overflow: auto; }
.plan-head { display: flex; align-items: center; gap: 7px; flex: 0 0 auto; }
.plan-head b { display: inline-flex; align-items: center; gap: 4px; color: #fff; font-size: 14px; }
.plan-head .arrow { color: var(--sk-cyan); font-size: 14px; }
.plan-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 12px; }
.plan-grid > div { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
/* 路线字符串较长，独占整行显示完整内容，避免被省略号截断 */
.plan-grid > .plan-full { grid-column: 1 / -1; }
.plan-grid b { color: #fff; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.detail-block { display: flex; flex-direction: column; gap: 3px; }
.detail-block p { margin: 0; font-size: 13.5px; line-height: 1.6; color: var(--sk-ink-2); }
.plan-actions { margin-top: auto; display: flex; gap: 8px; }
.sk-btn { flex: 1; padding: 6px 4px; border-radius: 5px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
.sk-btn--blue { background: linear-gradient(135deg, #25d0e8, #2f8fff); color: #04121f; }
.sk-btn--gold { background: rgba(255, 197, 61, .18); border-color: rgba(255, 197, 61, .55); color: #ffd98a; }
.sk-btn--gray { background: rgba(120, 160, 200, .14); border-color: rgba(140, 170, 200, .38); color: #a8c0d6; }
.sk-btn:hover { filter: brightness(1.15); }

/* 车辆与反馈 */
.veh-wrap { flex: 1 1 auto; min-height: 0; padding: 6px 9px; display: flex; flex-direction: column; gap: 6px; overflow: auto; }
.veh-chips { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; flex: 0 0 auto; }
.veh-chip { display: flex; align-items: center; justify-content: center; gap: 5px; padding: 4px 2px; border: 1px solid rgba(58, 138, 214, .2); border-radius: 6px; background: rgba(20, 52, 92, .3); }
.veh-chip b { color: #fff; font-size: 15px; font-weight: 800; }
.fb-item { display: flex; align-items: center; gap: 7px; padding: 5px 9px; }
.fb-text { flex: 1; min-width: 0; color: var(--sk-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fb-time { flex: 0 0 auto; }

/* 页脚 */
.sk-footer-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 12px; }
.steps { display: flex; align-items: center; justify-content: space-between; padding: 4px 2px; height: 100%; }
.step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 0 0 auto; }
.step-dot {
  width: 30px; height: 30px; border-radius: 50%;
  display: grid; place-items: center;
  font-size: 14px; font-weight: 800;
  color: var(--sk-ink-3);
  border: 1px solid rgba(58, 138, 214, .45);
  background: rgba(12, 34, 62, .7);
}
.step.is-done .step-dot { color: #04121f; background: linear-gradient(135deg, #38d996, #25d0e8); border-color: transparent; box-shadow: 0 0 14px rgba(56, 217, 150, .6); }
.step.is-active .step-dot { color: #04121f; background: linear-gradient(135deg, #ffc53d, #ff9a3d); border-color: transparent; box-shadow: 0 0 16px rgba(255, 197, 61, .7); animation: stepPulse 1.8s ease-in-out infinite; }
.step-label { font-size: 13.5px; color: var(--sk-ink-2); white-space: nowrap; }
.step.is-active .step-label { color: #ffd98a; font-weight: 700; }
.step.is-done .step-label { color: #a6f0cd; }
.step-line { flex: 1; height: 2px; margin: 0 8px 18px; border-radius: 2px; background: rgba(58, 138, 214, .3); }
.step-line.is-done { background: linear-gradient(90deg, #38d996, #25d0e8); box-shadow: 0 0 8px rgba(37, 208, 232, .6); }
@keyframes stepPulse { 0%, 100% { box-shadow: 0 0 14px rgba(255, 197, 61, .5); } 50% { box-shadow: 0 0 24px rgba(255, 197, 61, .95); } }

.task-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; height: 100%; }
.task-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 4px; border-left: 2px solid rgba(37, 208, 232, .4); }

/* 短视口：纵向空间紧张，进一步压缩详情区块与反馈列表 */
@media (max-height: 800px) {
  /* 短视口下正文表格最多两行（表格在子组件内，需用 :deep 穿透 scoped） */
  .sk-col :deep(.sk-table tbody tr:nth-child(n + 3)) { display: none; }
  .plan-box { padding: 5px 8px; gap: 5px; }
  /* 三项压成一行：隐藏运输距离（地图提示条已展示距离） */
  .plan-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px 9px; }
  .plan-grid > div:nth-child(4) { display: none; }
  .veh-wrap { padding: 5px 8px; gap: 5px; }
  .fb-item { padding: 4px 7px; }
  .reason-box { gap: 4px; }
  .reason-list li { font-size: 12px; }
}
@media (max-height: 660px) {
  /* 更矮时只保留一条执行反馈 */
  .veh-wrap .sk-list .fb-item:nth-child(n + 2) { display: none; }
}

/* 极矮视口（<620px）：调度详情面板再压缩一档 */
@media (max-height: 620px) {
  .plan-box { padding: 4px 7px; gap: 4px; }
  .sk-btn { padding: 3px 4px; font-size: 12.5px; }
}
</style>
