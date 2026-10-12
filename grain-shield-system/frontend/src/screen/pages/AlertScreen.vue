<template>
  <ScreenShell
    subtitle="风险预警与告警处置大屏"
    active="/screen/alerts"
    :kpi-count="6"
    columns="minmax(0, 1fr) minmax(0, 1.74fr) minmax(0, 1.16fr)"
  >
    <template #kpis>
      <KpiTile label="今日新增告警" :value="stat.todayNew" unit="条" icon="Bell" tone="red" delta="较昨日 +3" dir="up" />
      <KpiTile label="待处理告警" :value="stat.pending" unit="条" icon="Warning" tone="orange" delta="较昨日 -5" dir="down" />
      <KpiTile label="重大风险（I级）" :value="stat.critical" unit="条" icon="CircleCloseFilled" tone="red" delta="较昨日 -1" dir="down" />
      <KpiTile label="已关闭告警" :value="stat.closed" unit="条" icon="CircleCheckFilled" tone="green" delta="较昨日 +8" dir="up" />
      <KpiTile label="规则扫描次数" :value="12580" unit="次" icon="Refresh" tone="blue" delta="较昨日 +12%" dir="up" />
      <KpiTile label="风险命中率" :value="92.1" unit="%" icon="Aim" tone="gold" :decimals="1" delta="较昨日 +2.3%" dir="up" />
    </template>

    <!-- 左栏 -->
    <div class="sk-col">
      <ScreenPanel title="风险等级分布" icon="PieChart" style="flex:1.05" body-class="sk-panel__body--flush">
        <BaseChart :option="levelPie" />
      </ScreenPanel>

      <ScreenPanel title="风险类型占比" icon="Histogram" style="flex:1.1">
        <BaseChart :option="typeBar" />
      </ScreenPanel>

      <ScreenPanel title="近7日风险趋势" icon="TrendCharts" style="flex:1.1">
        <BaseChart :option="trendLine" />
      </ScreenPanel>
    </div>

    <!-- 中栏 -->
    <div class="sk-col">
      <ScreenPanel title="武汉市粮食供应链风险监测态势" icon="MapLocation" style="flex:1" body-class="sk-panel__body--flush">
        <DarkMap :nodes="nodes" :routes="routes" :alerts="openAlerts" :show-legend="true" />
      </ScreenPanel>

      <ScreenPanel title="气象交通态势" icon="Cloudy" style="flex:0 0 auto">
        <div class="wx-strip">
          <div class="wx-item">
            <span class="sk-label--sm">当前天气</span>
            <div class="wx-value"><el-icon><Drizzling /></el-icon><b>{{ weather.disasterType || '小雨' }}</b></div>
          </div>
          <div class="wx-item"><span class="sk-label--sm">气温</span><b>18℃</b></div>
          <div class="wx-item"><span class="sk-label--sm">风力</span><b>{{ weather.windLevel || '东风4级' }}</b></div>
          <div class="wx-item"><span class="sk-label--sm">未来24h降雨</span><b>{{ weather.rainfall || 0 }} mm</b></div>
          <div class="wx-item"><span class="sk-label--sm">预警等级</span><b class="c-gold">{{ weather.warningLevel || '无' }}预警</b></div>
          <div class="wx-item"><span class="sk-label--sm">交通受影响道路</span><b class="c-red">{{ blockedCount }} 条</b></div>
        </div>
      </ScreenPanel>
    </div>

    <!-- 右栏 -->
    <div class="sk-col">
      <ScreenPanel title="实时风险告警" icon="Warning" extra="更多" style="flex:1" body-class="sk-panel__body--flush">
        <ScreenTable :columns="alertCols" :rows="alertRows">
          <template #level="{ row }">
            <span class="sk-tag" :class="`sk-tag--${TONE[row.level]}`">{{ LABEL.level[row.level] }}</span>
          </template>
          <template #status="{ row }">
            <span class="sk-tag" :class="`sk-tag--${statusTone(row.status)}`">{{ row.statusLabel }}</span>
          </template>
        </ScreenTable>
      </ScreenPanel>

      <ScreenPanel title="告警详情" icon="Document" extra="更多" style="flex:1.45" body-class="sk-panel__body--flush">
        <div class="detail-box" v-if="current">
          <div class="detail-head">
            <span class="sk-tag" :class="`sk-tag--${TONE[current.level]}`">{{ current.levelLabel }}</span>
            <b>{{ current.nodeName }}</b>
            <span class="sk-tag" :class="`sk-tag--${statusTone(current.status)}`">{{ current.statusLabel }}</span>
          </div>
          <div class="detail-rows">
            <div><span class="sk-label--sm">告警编号</span><b class="sk-num">{{ current.code }}</b></div>
            <div><span class="sk-label--sm">告警类型</span><b>{{ current.riskTypeLabel }}</b></div>
            <div><span class="sk-label--sm">触发时间</span><b class="sk-num">{{ current.alarmTime }}</b></div>
          </div>
          <div class="detail-blocks">
            <div class="detail-block">
              <span class="sk-label--sm">风险原因</span>
              <p>{{ current.detail }}</p>
            </div>
            <div class="detail-block">
              <span class="sk-label--sm">处置建议</span>
              <p>{{ current.suggestion }}</p>
            </div>
          </div>
          <div class="detail-actions">
            <button class="sk-btn sk-btn--blue" @click="act('已确认')">确认</button>
            <button class="sk-btn sk-btn--gray" @click="act('已忽略')">忽略</button>
            <button class="sk-btn sk-btn--gold" @click="goDispatch">转入调度分析</button>
            <button class="sk-btn sk-btn--gray" @click="act('已关闭')">关闭</button>
          </div>
        </div>
      </ScreenPanel>
    </div>

    <template #footer>
      <div class="sk-footer-grid">
        <ScreenPanel title="规则扫描态势" icon="SetUp" style="flex:1">
          <div class="scan-box">
            <div class="scan-stats">
              <div><span class="sk-label--sm">今日扫描</span><b class="sk-big" style="font-size: 19px">12,580</b></div>
              <div><span class="sk-label--sm">命中告警</span><b class="sk-big" style="font-size: 19px;color:#ffc53d">86</b></div>
              <div><span class="sk-label--sm">命中率</span><b class="sk-big" style="font-size: 19px;color:#25d0e8">92.1%</b></div>
            </div>
            <div class="rule-chips">
              <span v-for="r in D.rules.value.slice(0, 4)" :key="r.id" class="rule-chip">
                <i class="sk-dot sk-dot--green"></i>{{ r.name }}
              </span>
            </div>
          </div>
        </ScreenPanel>

        <ScreenPanel title="风险处置进度" icon="DataLine" style="flex:1.15">
          <div class="proc-row">
            <div class="proc-ring">
              <span class="sk-big" style="font-size: 24px">{{ stat.total }}</span>
              <span class="sk-label--sm">告警总数</span>
            </div>
            <div class="proc-list">
              <div v-for="p in procRows" :key="p.label" class="proc-item">
                <span class="sk-tag" :class="`sk-tag--${p.tone}`">{{ p.label }}</span>
                <b class="sk-num">{{ p.value }}</b>
                <span class="sk-label--sm">{{ p.pct }}%</span>
                <div class="sk-meter" style="flex:1"><i :style="{ width: p.pct + '%', background: p.color }"></i></div>
              </div>
            </div>
          </div>
        </ScreenPanel>
      </div>
    </template>
  </ScreenShell>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import ScreenShell from '../components/ScreenShell.vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import KpiTile from '../components/KpiTile.vue'
import BaseChart from '../components/BaseChart.vue'
import DarkMap from '../components/DarkMap.vue'
import ScreenTable from '../components/ScreenTable.vue'
import { useScreenData, loadScreenData, LABEL, TONE } from '../useScreenData'
import { skToast } from '../toast'

const D = useScreenData()
const router = useRouter()
onMounted(() => loadScreenData())

const nodes = computed(() => D.nodes.value)
const routes = computed(() => D.routes.value)
const openAlerts = computed(() => D.alerts.value.filter(a => a.status !== 'CLOSED' && a.status !== 'IGNORED'))
const weather = computed(() => D.weather.value[0] || {})
const blockedCount = computed(() => D.traffic.value.filter(t => t.status !== 'NORMAL').length)

const stat = computed(() => ({
  total: D.alerts.value.length,
  todayNew: D.alerts.value.length,
  pending: D.alerts.value.filter(a => a.status === 'NEW').length,
  critical: D.alerts.value.filter(a => a.level === 'CRITICAL').length,
  closed: D.alerts.value.filter(a => a.status === 'CLOSED').length
}))

const statusTone = (s) => ({ NEW: 'red', CONFIRMED: 'orange', ANALYZING: 'gold', CLOSED: 'green', IGNORED: 'gray' }[s] || 'blue')

const alertCols = [
  { prop: 'code', label: '告警编号', width: '30%' },
  { prop: 'riskTypeLabel', label: '类型', width: '18%' },
  { prop: 'level', label: '等级', width: '15%' },
  { prop: 'nodeName', label: '影响节点', width: '37%' }
]
const alertRows = computed(() => D.alerts.value.slice(0, 4))

const current = computed(() => D.alerts.value.find(a => a.level === 'CRITICAL') || D.alerts.value[0] || null)

function act(label) { skToast(label) }
function goDispatch() { router.push('/screen/dispatch') }

/* ---------------- 图表 ---------------- */
const LEVEL_COLOR = { CRITICAL: '#ff4d5e', HIGH: '#ff9a3d', MEDIUM: '#ffc53d', LOW: '#2f8fff' }
const LEVEL_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

const levelPie = computed(() => {
  const total = D.alerts.value.length || 1
  const data = LEVEL_ORDER.map(k => ({
    name: LABEL.levelFull[k],
    value: D.alerts.value.filter(a => a.level === k).length,
    itemStyle: { color: LEVEL_COLOR[k] }
  })).filter(d => d.value > 0)
  return {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(5,18,34,.94)', borderColor: 'rgba(74,165,255,.5)', textStyle: { color: '#dceaff' } },
    legend: {
      orient: 'vertical', right: 6, top: 'center', itemWidth: 9, itemHeight: 9, textStyle: { color: '#93b6d8', fontSize: 11 },
      formatter: (n) => {
        const d = data.find(x => x.name === n)
        return `${n}  ${d ? (d.value / total * 100).toFixed(1) : 0}%`
      }
    },
    series: [{ type: 'pie', radius: ['52%', '76%'], center: ['32%', '50%'], label: { show: false }, labelLine: { show: false }, itemStyle: { borderColor: '#061223', borderWidth: 2 }, data }],
    graphic: [
      { type: 'text', left: '32%', top: '35%', style: { text: String(D.alerts.value.length), fill: '#fff', fontSize: 22, fontWeight: 700, textAlign: 'center' } },
      { type: 'text', left: '32%', top: '58%', style: { text: '总告警数', fill: '#8fb4d6', fontSize: 10, textAlign: 'center' } }
    ]
  }
})

const typeBar = computed(() => {
  const m = new Map()
  D.alerts.value.forEach(a => m.set(a.riskTypeLabel, (m.get(a.riskTypeLabel) || 0) + 1))
  let arr = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  if (!arr.length) arr = [['库存不足', 24], ['温度异常', 18], ['道路阻断', 16], ['区域供给风险', 12], ['其他风险', 16]]
  const total = arr.reduce((a, x) => a + x[1], 0) || 1
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(5,18,34,.94)', borderColor: 'rgba(74,165,255,.5)', textStyle: { color: '#dceaff' } },
    grid: { left: 66, right: 62, top: 6, bottom: 6 },
    xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
    yAxis: { type: 'category', inverse: true, data: arr.map(x => x[0]), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#93b6d8', fontSize: 11 } },
    series: [{
      type: 'bar', barWidth: 9, data: arr.map(x => x[1]),
      itemStyle: { borderRadius: 4, color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#c13584' }, { offset: 1, color: '#25d0e8' }] } },
      label: { show: true, position: 'right', color: '#dceaff', fontSize: 11, formatter: p => `${p.value}  ${(p.value / total * 100).toFixed(1)}%` }
    }]
  }
})

const trendLine = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) days.push(dayjs().subtract(i, 'day').format('MM-DD'))
  const series = LEVEL_ORDER.map(k => ({
    name: LABEL.level[k],
    type: 'line', smooth: true, symbol: 'circle', symbolSize: 4,
    lineStyle: { width: 2, color: LEVEL_COLOR[k] },
    itemStyle: { color: LEVEL_COLOR[k] },
    data: days.map((_, i) => Math.max(1, Math.round(({ CRITICAL: 2, HIGH: 6, MEDIUM: 12, LOW: 18 }[k]) * (0.6 + ((i * 7 + k.length) % 10) / 12))))
  }))
  return {
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(5,18,34,.94)', borderColor: 'rgba(74,165,255,.5)', textStyle: { color: '#dceaff' } },
    legend: { right: 0, top: 0, itemWidth: 9, itemHeight: 9, textStyle: { color: '#93b6d8', fontSize: 11 } },
    grid: { left: 32, right: 10, top: 26, bottom: 20 },
    xAxis: { type: 'category', boundaryGap: false, data: days, axisTick: { show: false }, axisLine: { lineStyle: { color: 'rgba(120,180,240,.3)' } }, axisLabel: { color: '#8fb4d6', fontSize: 11 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(120,180,240,.12)' } }, axisLabel: { color: '#8fb4d6', fontSize: 11 } },
    series
  }
})

/* ---------------- 处置进度 ---------------- */
const procRows = computed(() => {
  const total = D.alerts.value.length || 1
  const defs = [
    { key: 'NEW', label: '待处理', tone: 'red', color: '#ff4d5e' },
    { key: 'ANALYZING', label: '分析中', tone: 'gold', color: '#ffc53d' },
    { key: 'CONFIRMED', label: '处理中', tone: 'orange', color: '#ff9a3d' }
  ]
  return defs.map(d => {
    const value = D.alerts.value.filter(a => a.status === d.key).length
    return { label: d.label, tone: d.tone, color: d.color, value, pct: (value / total * 100).toFixed(1) }
  })
})
</script>

<style scoped>
.wx-strip { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.wx-item { display: flex; flex-direction: column; gap: 3px; padding-left: 10px; border-left: 2px solid rgba(37, 208, 232, .4); }
.wx-item b { color: #fff; font-size: 14px; }
.wx-value { display: flex; align-items: center; gap: 6px; color: var(--sk-cyan); font-size: 15px; }
.c-gold { color: #ffc53d !important; }
.c-red { color: #ff8a95 !important; }

.detail-box { flex: 1 1 auto; min-height: 0; padding: 7px 10px; display: flex; flex-direction: column; gap: 5px; overflow: auto; }
.detail-head { display: flex; align-items: center; gap: 7px; flex: 0 0 auto; }
.detail-head b { color: #fff; font-size: 14px; }
.detail-rows { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 9px; flex: 0 0 auto; }
.detail-rows > div { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.detail-rows b { color: #fff; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.detail-rows .sk-label--sm { font-size: 11px; }
.detail-block { display: flex; flex-direction: column; gap: 2px; flex: 0 0 auto; min-width: 0; }
.detail-blocks { display: grid; grid-template-columns: 1fr; gap: 5px; flex: 0 0 auto; }
.detail-block p { margin: 0; font-size: 13px; line-height: 1.45; color: var(--sk-ink-2); }
.detail-actions { margin-top: auto; display: flex; gap: 7px; flex: 0 0 auto; }
.sk-btn { flex: 1; padding: 5px 4px; border-radius: 5px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; }

/* 短视口：两块说明并排，显著压缩纵向占用 */
@media (max-height: 720px) {
  .detail-blocks { grid-template-columns: 1fr 1fr; gap: 4px 10px; }
  .detail-block p { font-size: 12.5px; line-height: 1.4; }
}

/* 极矮视口（<620px）：告警详情面板再压缩一档 */
@media (max-height: 620px) {
  .detail-box { gap: 4px; padding: 5px 8px; }
  .detail-head b { font-size: 13px; }
  .detail-block p { font-size: 12px; line-height: 1.35; }
  .sk-btn { padding: 3px 4px; font-size: 12.5px; }
}
.sk-btn--blue { background: linear-gradient(135deg, #25d0e8, #2f8fff); color: #04121f; }
.sk-btn--gold { background: rgba(255, 197, 61, .18); border-color: rgba(255, 197, 61, .55); color: #ffd98a; }
.sk-btn--gray { background: rgba(120, 160, 200, .14); border-color: rgba(140, 170, 200, .38); color: #a8c0d6; }
.sk-btn:hover { filter: brightness(1.15); }

.sk-footer-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: 12px; }
.scan-box { display: flex; flex-direction: column; gap: 6px; }
.scan-stats { display: flex; gap: 24px; }
.scan-stats > div { display: flex; flex-direction: column; gap: 1px; }
.rule-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.rule-chip { display: inline-flex; align-items: center; gap: 5px; padding: 1px 8px; border-radius: 999px; border: 1px solid rgba(58, 138, 214, .34); background: rgba(20, 52, 92, .4); font-size: 12px; color: var(--sk-ink-2); }

.proc-row { display: flex; align-items: center; gap: 14px; }
.proc-ring { display: flex; flex-direction: column; align-items: center; gap: 2px; padding-right: 14px; border-right: 1px solid rgba(58, 138, 214, .2); }
.proc-list { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.proc-item { display: flex; align-items: center; gap: 7px; font-size: 13px; }
.proc-item b { color: #fff; min-width: 26px; }
.proc-item .sk-label--sm { min-width: 40px; }
</style>
