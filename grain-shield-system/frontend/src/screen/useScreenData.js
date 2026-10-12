import { ref } from 'vue'
import api from '../api/client'
import * as demo from './demoData'

const S = {
  nodes: ref([]), routes: ref([]), alerts: ref([]), plans: ref([]),
  vehicles: ref([]), inventories: ref([]), iot: ref([]), weather: ref([]),
  traffic: ref([]), rules: ref([]), users: ref([]), logs: ref([]),
  dashboard: ref(null), loading: ref(false), loaded: ref(false), online: ref(false)
}

function pick(real, fallback, min) {
  return Array.isArray(real) && real.length >= min ? real : fallback
}

async function fetchList(path) {
  try {
    const r = await api.get(path)
    return Array.isArray(r) ? r : []
  } catch {
    return []
  }
}

export async function loadScreenData(force = false) {
  if (S.loaded.value && !force) return
  S.loading.value = true
  const [nodes, routes, alerts, plans, vehicles, inventories, iot, weather, traffic, rules, users, logs, dashboard] =
    await Promise.all([
      fetchList('/nodes'), fetchList('/routes'), fetchList('/alerts'), fetchList('/dispatch'),
      fetchList('/vehicles'), fetchList('/inventories'), fetchList('/state/iot'),
      fetchList('/state/weather'), fetchList('/state/traffic'), fetchList('/rules'),
      fetchList('/users'), fetchList('/logs'),
      api.get('/dashboard').catch(() => null)
    ])

  S.nodes.value = pick(nodes, demo.demoNodes, 12)
  S.routes.value = pick(routes, demo.demoRoutes, 10)
  S.alerts.value = pick(alerts, demo.demoAlerts, 8)
  S.plans.value = pick(plans, demo.demoDispatchPlans, 1)
  S.vehicles.value = pick(vehicles, demo.demoVehicles, 8)
  S.inventories.value = pick(inventories, demo.demoInventories, 10)
  S.iot.value = pick(iot, demo.demoIot, 4)
  S.weather.value = pick(weather, demo.demoWeather, 1)
  S.traffic.value = pick(traffic, demo.demoTraffic, 3)
  S.rules.value = pick(rules, demo.demoRules, 5)
  S.users.value = pick(users, demo.demoUsers, 3)
  S.logs.value = pick(logs, demo.demoLogs, 5)
  S.dashboard.value = dashboard
  S.online.value = Array.isArray(nodes) && nodes.length > 0
  S.loaded.value = true
  S.loading.value = false
}

export function useScreenData() {
  return S
}

/* ---------------- 计算辅助 ---------------- */
export const LABEL = {
  nodeType: { WAREHOUSE: '粮库', PROCESSING: '加工企业', DISTRIBUTION: '配送点', LOGISTICS: '物流中心' },
  riskType: { INVENTORY: '库存不足', TEMPERATURE: '温度异常', HUMIDITY: '湿度异常', TRAFFIC: '道路阻断', WEATHER: '气象灾害', REGIONAL_SUPPLY: '区域供给风险' },
  level: { CRITICAL: 'Ⅰ级', HIGH: 'Ⅱ级', MEDIUM: 'Ⅲ级', LOW: 'Ⅳ级' },
  levelFull: { CRITICAL: 'Ⅰ级(重大)', HIGH: 'Ⅱ级(较大)', MEDIUM: 'Ⅲ级(一般)', LOW: 'Ⅳ级(低)' },
  alertStatus: { NEW: '待处理', CONFIRMED: '处理中', ANALYZING: '分析中', CLOSED: '已关闭', IGNORED: '已忽略' },
  routeStatus: { NORMAL: '正常', CONGESTED: '拥堵', CLOSED: '封闭' },
  vehicleStatus: { AVAILABLE: '可调度', IN_TRANSIT: '在途', MAINTENANCE: '检修', OFFLINE: '离线' },
  role: { ADMIN: '系统管理员', DISPATCHER: '市级调度指挥员', NODE_MANAGER: '节点管理员' }
}

export const TONE = {
  CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'gold', LOW: 'blue'
}

export function countBy(rows, key) {
  const m = new Map()
  rows.forEach(r => { const k = r[key]; m.set(k, (m.get(k) || 0) + 1) })
  return m
}

export function sumBy(rows, key) {
  return rows.reduce((a, r) => a + (Number(r[key]) || 0), 0)
}
