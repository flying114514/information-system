/* 大屏演示数据兜底：当后端数据不足时用于补足展示规模（武汉 13 区） */

const C = {
  江岸区: [114.303, 30.595], 江汉区: [114.283, 30.579], 硚口区: [114.265, 30.571],
  汉阳区: [114.266, 30.549], 武昌区: [114.307, 30.547], 青山区: [114.397, 30.634],
  洪山区: [114.401, 30.504], 东西湖区: [114.142, 30.622], 汉南区: [114.081, 30.310],
  蔡甸区: [114.029, 30.582], 江夏区: [114.314, 30.349], 黄陂区: [114.374, 30.874],
  新洲区: [114.802, 30.842]
}

function pt(region, dx = 0, dy = 0) {
  const c = C[region] || [114.3, 30.6]
  return [Number((c[0] + dx).toFixed(5)), Number((c[1] + dy).toFixed(5))]
}

let nid = 0
function node(code, name, type, region, capacity, dx, dy, status = 'NORMAL') {
  nid += 1
  const [lng, lat] = pt(region, dx, dy)
  return { id: nid, code, name, type, region, address: `${region}${name}`, capacity, longitude: lng, latitude: lat, managerName: '张伟', phone: '138****' + (1000 + nid), status }
}

export const demoNodes = [
  node('WH-01', '东西湖中心粮库', 'WAREHOUSE', '东西湖区', 86000, -0.03, 0.02),
  node('WH-02', '黄陂前川粮库', 'WAREHOUSE', '黄陂区', 52000, 0.01, -0.02),
  node('WH-03', '新洲邾城粮库', 'WAREHOUSE', '新洲区', 48000, -0.02, 0.015),
  node('WH-04', '蔡甸永安粮库', 'WAREHOUSE', '蔡甸区', 41000, 0.02, -0.01),
  node('WH-05', '江夏纸坊粮库', 'WAREHOUSE', '江夏区', 45000, 0.015, 0.02),
  node('WH-06', '汉南粮库', 'WAREHOUSE', '汉南区', 28000, -0.01, 0.01),
  node('WH-07', '青山工业港粮库', 'WAREHOUSE', '青山区', 36000, 0.02, -0.02),
  node('WH-08', '汉阳四新粮库', 'WAREHOUSE', '汉阳区', 33000, -0.02, 0.015),
  node('JG-01', '东西湖粮食加工园', 'PROCESSING', '东西湖区', 62000, 0.025, -0.01),
  node('JG-02', '蔡甸粮食物流园', 'PROCESSING', '蔡甸区', 38000, -0.025, 0.02),
  node('JG-03', '江汉米面加工中心', 'PROCESSING', '江汉区', 26000, 0.008, 0.006),
  node('JG-04', '洪山粮食精加工基地', 'PROCESSING', '洪山区', 30000, -0.02, 0.02),
  node('PS-01', '黄陂配送中心', 'DISTRIBUTION', '黄陂区', 12000, -0.02, 0.02),
  node('PS-02', '新洲配送中心', 'DISTRIBUTION', '新洲区', 11000, 0.02, -0.015),
  node('PS-03', '江夏配送中心', 'DISTRIBUTION', '江夏区', 10000, -0.02, -0.02),
  node('PS-04', '武昌配送中心', 'DISTRIBUTION', '武昌区', 14000, 0.012, -0.012),
  node('PS-05', '江岸配送中心', 'DISTRIBUTION', '江岸区', 13000, -0.012, 0.012),
  node('PS-06', '硚口配送点', 'DISTRIBUTION', '硚口区', 8000, 0.01, -0.008),
  node('PS-07', '汉阳配送中心', 'DISTRIBUTION', '汉阳区', 12000, 0.012, 0.012),
  node('PS-08', '青山配送点', 'DISTRIBUTION', '青山区', 9000, -0.015, -0.01),
  node('PS-09', '洪山配送中心', 'DISTRIBUTION', '洪山区', 11000, 0.02, -0.01),
  node('PS-10', '东西湖配送中心', 'DISTRIBUTION', '东西湖区', 13000, 0.012, 0.02)
]

const link = (id, code, name, s, e, km, status = 'NORMAL', risk = 'LOW') => {
  const sn = demoNodes.find(n => n.code === s), en = demoNodes.find(n => n.code === e)
  return { id, code, name, startNodeId: sn.id, startNodeName: sn.name, endNodeId: en.id, endNodeName: en.name, distanceKm: km, status, riskLevel: risk, remark: '' }
}

export const demoRoutes = [
  link(1, 'XL-01', '东西湖—黄陂主通道', 'WH-01', 'WH-02', 52, 'NORMAL'),
  link(2, 'XL-02', '东西湖—新洲干线', 'WH-01', 'WH-03', 68, 'NORMAL'),
  link(3, 'XL-03', '黄陂—新洲联络线', 'WH-02', 'WH-03', 40, 'NORMAL'),
  link(4, 'XL-04', '东西湖—蔡甸通道', 'WH-01', 'WH-04', 46, 'CONGESTED', 'MEDIUM'),
  link(5, 'XL-05', '蔡甸—汉南支线', 'WH-04', 'WH-06', 38, 'NORMAL'),
  link(6, 'XL-06', '江夏—洪山干线', 'WH-05', 'JG-04', 36, 'NORMAL'),
  link(7, 'XL-07', '洪山—市区配送线', 'JG-04', 'PS-09', 22, 'CONGESTED', 'MEDIUM'),
  link(8, 'XL-08', '青山—武昌通道', 'WH-07', 'PS-04', 18, 'NORMAL'),
  link(9, 'XL-09', '汉阳—硚口配送线', 'WH-08', 'PS-06', 14, 'NORMAL'),
  link(10, 'XL-10', '江岸—江汉联络线', 'PS-05', 'PS-04', 9, 'NORMAL'),
  link(11, 'XL-11', '东西湖加工—配送', 'JG-01', 'PS-10', 11, 'NORMAL'),
  link(12, 'XL-12', '黄陂—东西湖加工', 'WH-02', 'JG-01', 44, 'NORMAL'),
  link(13, 'XL-13', '新洲—青山通道', 'WH-03', 'WH-07', 62, 'CLOSED', 'HIGH'),
  link(14, 'XL-14', '江夏—蔡甸联络线', 'WH-05', 'JG-02', 40, 'NORMAL'),
  link(15, 'XL-15', '洪山—江夏配送', 'PS-09', 'PS-03', 26, 'NORMAL'),
  link(16, 'XL-16', '青山—新洲支线', 'PS-08', 'PS-02', 56, 'CONGESTED', 'MEDIUM'),
  link(17, 'XL-17', '汉阳—江夏通道', 'WH-08', 'PS-03', 32, 'NORMAL'),
  link(18, 'XL-18', '硚口—江汉支线', 'PS-06', 'JG-03', 8, 'NORMAL')
]

let vid = 0
export const demoVehicles = [
  ['鄂A·R8721', 30, '东西湖区', 'AVAILABLE'],
  ['鄂A·R3658', 30, '东西湖区', 'AVAILABLE'],
  ['鄂A·F9030', 30, '东西湖区', 'IN_TRANSIT'],
  ['鄂A·R7429', 28, '黄陂区', 'AVAILABLE'],
  ['鄂A·K2218', 26, '新洲区', 'MAINTENANCE'],
  ['鄂A·M5541', 24, '蔡甸区', 'IN_TRANSIT'],
  ['鄂A·L3387', 32, '东西湖区', 'AVAILABLE'],
  ['鄂A·G7216', 30, '江夏区', 'AVAILABLE'],
  ['鄂A·T1180', 22, '洪山区', 'AVAILABLE'],
  ['鄂A·B4420', 28, '青山区', 'IN_TRANSIT'],
  ['鄂A·W9963', 20, '汉阳区', 'AVAILABLE'],
  ['鄂A·Q5527', 26, '江岸区', 'AVAILABLE'],
  ['鄂A·N7741', 30, '黄陂区', 'AVAILABLE'],
  ['鄂A·H2205', 24, '江夏区', 'IN_TRANSIT'],
  ['鄂A·A3390', 18, '武昌区', 'AVAILABLE'],
  ['鄂A·U6614', 30, '东西湖区', 'AVAILABLE'],
  ['鄂A·P8830', 22, '硚口区', 'AVAILABLE'],
  ['鄂A·C4402', 28, '江汉区', 'IN_TRANSIT']
].map(([plateNumber, loadCapacity, currentLocation, status]) => {
  vid += 1
  const n = demoNodes.find(x => x.region === currentLocation)
  return { id: vid, plateNumber, loadCapacity, currentNodeId: n ? n.id : null, currentNodeName: n ? n.name : currentLocation, currentLocation, status }
})

const RISK_LABEL = { INVENTORY: '库存不足', TEMPERATURE: '仓储高温', HUMIDITY: '仓储高湿', TRAFFIC: '道路阻断', WEATHER: '气象灾害', REGIONAL_SUPPLY: '区域供给风险' }
const LEVEL_LABEL = { CRITICAL: 'I级(重大)', HIGH: 'II级(较大)', MEDIUM: 'III级(一般)', LOW: 'IV级(低)' }

let aid = 0
export const demoAlerts = [
  ['WH-03', null, 'TRAFFIC', 'HIGH', '新洲邾城粮库', 'G318新洲段道路施工封闭，运输通道中断', 'NEW'],
  ['WH-01', null, 'INVENTORY', 'MEDIUM', '东西湖中心粮库', '当前库存低于安全库存阈值 8%', 'NEW'],
  ['JG-04', null, 'WEATHER', 'HIGH', '洪山粮食精加工基地', '未来24h累计降雨量超 100mm，运输受限', 'CONFIRMED'],
  ['WH-05', null, 'TEMPERATURE', 'MEDIUM', '江夏纸坊粮库', '仓内温度 32.6℃，超过预警阈值 30℃', 'NEW'],
  ['WH-07', 'XL-13', 'TRAFFIC', 'CRITICAL', '青山工业港粮库', '新洲—青山通道封闭，主线运输中断', 'ANALYZING'],
  ['WH-04', null, 'REGIONAL_SUPPLY', 'HIGH', '蔡甸永安粮库', '区域可调度供货量不足，存在供应缺口', 'CONFIRMED'],
  ['WH-06', null, 'HUMIDITY', 'LOW', '汉南粮库', '仓内湿度 78%，接近上限 80%', 'IGNORED'],
  ['PS-02', 'XL-16', 'TRAFFIC', 'MEDIUM', '新洲配送中心', '青山—新洲支线拥堵，通行时间增加', 'CONFIRMED'],
  ['PS-03', null, 'INVENTORY', 'HIGH', '江夏配送中心', '大米与面粉库存告急，持续时间超 2 日', 'NEW'],
  ['WH-02', null, 'WEATHER', 'MEDIUM', '黄陂前川粮库', '强降雨橙色预警，需加强仓房防潮', 'NEW'],
  ['JG-02', null, 'TEMPERATURE', 'HIGH', '蔡甸粮食物流园', '烘干车间温度 38℃，存在安全隐患', 'ANALYZING'],
  ['PS-04', null, 'REGIONAL_SUPPLY', 'MEDIUM', '武昌配送中心', '配送需求增长，库存周转压力上升', 'CLOSED'],
  ['WH-08', null, 'HUMIDITY', 'MEDIUM', '汉阳四新粮库', '连续阴雨，库内湿度升至 76%', 'CLOSED'],
  ['PS-07', null, 'TRAFFIC', 'LOW', '汉阳配送中心', '早高峰通行缓慢，影响配送时效', 'CLOSED']
].map(([nodeCode, routeCode, riskType, level, nodeName, detail, status]) => {
  aid += 1
  const node = demoNodes.find(n => n.code === nodeCode)
  const route = routeCode ? demoRoutes.find(r => r.code === routeCode) : null
  return {
    id: aid,
    code: 'A' + (20241025001 + aid),
    ruleName: RISK_LABEL[riskType],
    nodeId: node ? node.id : null,
    nodeName,
    routeId: route ? route.id : null,
    routeName: route ? route.name : null,
    riskType,
    riskTypeLabel: RISK_LABEL[riskType],
    level,
    levelLabel: LEVEL_LABEL[level],
    detail,
    suggestion: riskType === 'TRAFFIC' ? '启用备用运输线路，绕行周边互通，协调属地交管部门加快疏通。'
      : riskType === 'INVENTORY' ? '启动应急调拨，从周边富余粮库补足缺口，优先保障民生供应。'
      : riskType === 'WEATHER' ? '加固仓房防潮设施，调整运输计划，避开强降雨时段。'
      : '加强仓储环境监测，采取降温除湿措施，必要时转移部分库存。',
    status,
    statusLabel: { NEW: '待处理', CONFIRMED: '处理中', ANALYZING: '分析中', CLOSED: '已关闭', IGNORED: '已忽略' }[status],
    handledBy: status === 'CLOSED' ? '李静' : null,
    alarmTime: `2024-10-${String(19 + aid).padStart(2, '0')} ${String(8 + aid).padStart(2, '0')}:2${aid % 10}`
  }
})

export const demoWeather = [
  { id: 1, region: '武汉市', disasterType: '暴雨', warningLevel: '橙色', rainfall: 86, windLevel: '东风4级', publishedAt: '2024-10-25 08:00' }
]

export const demoTraffic = [
  { id: 1, routeId: null, routeName: 'G318国道新洲段', roadName: 'G318', status: 'CLOSED', congestionLevel: '严重', recordedAt: '2024-10-25 09:10' },
  { id: 2, routeId: null, routeName: 'S111省道', roadName: 'S111', status: 'CONGESTED', congestionLevel: '中度', recordedAt: '2024-10-25 08:45' },
  { id: 3, routeId: null, routeName: 'G107国道', roadName: 'G107', status: 'NORMAL', congestionLevel: '畅通', recordedAt: '2024-10-25 07:30' },
  { id: 4, routeId: null, routeName: '三环线', roadName: '三环', status: 'NORMAL', congestionLevel: '畅通', recordedAt: '2024-10-25 07:20' }
]

const GRAIN = ['稻谷', '小麦', '大米', '面粉', '玉米', '成品粮']
export const demoInventories = []
demoNodes.filter(n => n.type === 'WAREHOUSE').forEach((n, i) => {
  GRAIN.slice(0, 3 + (i % 3)).forEach((g, j) => {
    const cur = 12000 + i * 1800 + j * 2600
    demoInventories.push({
      id: demoInventories.length + 1, nodeId: n.id, nodeName: n.name, grainType: g, unit: '吨',
      currentStock: cur, availableStock: Math.round(cur * 0.82), safetyStock: Math.round(cur * 0.35),
      dailyConsumption: 220 + i * 12, bufferDays: Number((cur / (220 + i * 12)).toFixed(1)),
      updatedAt: '2024-10-25 09:20'
    })
  })
})

export const demoRules = [
  { id: 1, name: '库存不足', riskType: 'INVENTORY', metric: '库存量', operator: '<', thresholdValue: null, thresholdText: '安全库存的80%', alarmLevel: 'HIGH', suggestion: '启动应急调拨，补足库存缺口', enabled: true },
  { id: 2, name: '温度异常', riskType: 'TEMPERATURE', metric: '仓内温度', operator: '>', thresholdValue: 30, thresholdText: '≥30℃ 或 ≤0℃', alarmLevel: 'HIGH', suggestion: '启动温控设备，调整通风', enabled: true },
  { id: 3, name: '湿度异常', riskType: 'HUMIDITY', metric: '仓内湿度', operator: '>', thresholdValue: 75, thresholdText: '>75%', alarmLevel: 'MEDIUM', suggestion: '开启除湿设备，加强监测', enabled: true },
  { id: 4, name: '道路阻断', riskType: 'TRAFFIC', metric: '通行状态', operator: '=', thresholdValue: null, thresholdText: '封闭 / 严重拥堵', alarmLevel: 'CRITICAL', suggestion: '启用备用线路，协调交管疏通', enabled: true },
  { id: 5, name: '气象灾害', riskType: 'WEATHER', metric: '预警等级', operator: '>=', thresholdValue: null, thresholdText: '橙色及以上', alarmLevel: 'HIGH', suggestion: '启动防潮防汛预案', enabled: true },
  { id: 6, name: '区域供给', riskType: 'REGIONAL_SUPPLY', metric: '供需缺口', operator: '>', thresholdValue: 5000, thresholdText: '>5000吨', alarmLevel: 'MEDIUM', suggestion: '跨区调拨，平衡供需', enabled: true }
]

export const demoUsers = [
  { id: 1, username: 'admin', realName: '系统管理员', role: 'ADMIN', enabled: true, managedNodeIds: [] },
  { id: 2, username: 'dispatcher', realName: '市级调度指挥员', role: 'DISPATCHER', enabled: true, managedNodeIds: [] },
  { id: 3, username: 'node', realName: '节点管理员', role: 'NODE_MANAGER', enabled: true, managedNodeIds: [1, 2] }
]

export const demoLogs = [
  { id: 1, username: 'admin', module: '库存管理', action: '新增', detail: '新增东西湖中心粮库稻谷库存记录', ip: '10.10.24.15', createdAt: '2024-10-25 14:26' },
  { id: 2, username: 'dispatcher', module: '调度方案', action: '调整', detail: '调整调度方案 #53，变更运输车辆', ip: '10.10.24.18', createdAt: '2024-10-25 14:15' },
  { id: 3, username: 'dispatcher', module: '风险告警', action: '确认', detail: '确认新洲邾城粮库道路阻断告警', ip: '10.10.24.18', createdAt: '2024-10-25 13:58' },
  { id: 4, username: 'admin', module: '用户权限', action: '修改', detail: '修改节点管理员授权的节点范围', ip: '10.10.24.15', createdAt: '2024-10-25 13:40' },
  { id: 5, username: 'node', module: '粮情数据', action: '录入', detail: '录入江夏纸坊粮库温湿度数据', ip: '10.10.24.22', createdAt: '2024-10-25 13:26' },
  { id: 6, username: 'admin', module: '系统配置', action: '更新', detail: '更新风险扫描定时任务参数', ip: '10.10.24.15', createdAt: '2024-10-25 12:50' }
]

export const demoDispatchPlans = [
  {
    id: 53, code: 'FA-20241025001', alertCode: 'A20241025005',
    sourceNodeId: 1, sourceNodeName: '东西湖中心粮库', targetNodeId: 7, targetNodeName: '洪山区',
    grainType: '大米', suggestedQuantity: 8000, routePath: 'G107 → 三环线 → 珞喻路 → 洪山区',
    distanceKm: 68, vehicleId: 3, plateNumber: '鄂A·K2218',
    recommendReason: '东西湖中心粮库可用库存 28,600 吨，满足本次调拨需求。', status: 'DRAFT', createdBy: 'dispatcher', createdAt: '2024-10-25 14:20'
  },
  {
    id: 54, code: 'FA-20241024017', alertCode: 'A20241024012',
    sourceNodeId: 2, sourceNodeName: '黄陂前川粮库', targetNodeId: 3, targetNodeName: '新洲区',
    grainType: '稻谷', suggestedQuantity: 4200, routePath: '黄陂 → 新洲', distanceKm: 40,
    vehicleId: 4, plateNumber: '鄂A·R7429', status: 'CONFIRMED', createdBy: 'dispatcher', createdAt: '2024-10-24 16:05'
  },
  {
    id: 55, code: 'FA-20241023008', alertCode: 'A20241023004',
    sourceNodeId: 5, sourceNodeName: '江夏纸坊粮库', targetNodeId: 16, targetNodeName: '江夏配送中心',
    grainType: '大米', suggestedQuantity: 2600, routePath: '江夏 → 纸坊 → 配送中心', distanceKm: 26,
    vehicleId: 14, plateNumber: '鄂A·H2205', status: 'COMPLETED', createdBy: 'dispatcher', createdAt: '2024-10-23 10:32'
  }
]

export const demoFeedbacks = [
  { id: 1, planId: 53, feedbackType: '出库', content: '东西湖中心粮库已完成 8,000 吨大米出库交接', executionStatus: '已完成', feedbackBy: 'dispatcher', feedbackTime: '2024-10-25 15:30' },
  { id: 2, planId: 53, feedbackType: '运输', content: '车辆 鄂A·K2218 已发车，预计 26h 抵达', executionStatus: '运输中', feedbackBy: 'dispatcher', feedbackTime: '2024-10-25 16:10' },
  { id: 3, planId: 54, feedbackType: '到达', content: '货物已抵达新洲配送中心并完成入库', executionStatus: '已完成', feedbackBy: 'node', feedbackTime: '2024-10-24 20:45' }
]

export const demoIot = demoNodes.filter(n => n.type === 'WAREHOUSE').map((n, i) => ({
  id: i + 1, nodeId: n.id, nodeName: n.name,
  temperature: Number((22 + i * 1.4).toFixed(1)),
  humidity: Number((58 + i * 2.6).toFixed(1)),
  collectedAt: '2024-10-25 ' + String(9 + i).padStart(2, '0') + ':20'
}))

export const HAZARD_TYPES = demoWeather
