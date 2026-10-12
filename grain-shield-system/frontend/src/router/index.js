import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  {
    path: '/', component: () => import('../layout/MainLayout.vue'), redirect: '/screen/overview',
    children: [
      { path: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: '全局态势' } },
      { path: 'basic-data', component: () => import('../views/BasicDataView.vue'), meta: { title: '基础数据' } },
      { path: 'rules', component: () => import('../views/RulesView.vue'), meta: { title: '风险规则' } },
      { path: 'state-data', component: () => import('../views/StateDataView.vue'), meta: { title: '模拟状态数据' } },
      { path: 'alerts', component: () => import('../views/AlertsView.vue'), meta: { title: '风险告警' } },
      { path: 'dispatch', component: () => import('../views/DispatchView.vue'), meta: { title: '应急调度' } },
      { path: 'users', component: () => import('../views/UsersView.vue'), meta: { title: '用户权限', roles: ['ADMIN'] } },
      { path: 'configs', component: () => import('../views/ConfigsView.vue'), meta: { title: '系统配置', roles: ['ADMIN'] } },
      { path: 'logs', component: () => import('../views/LogsView.vue'), meta: { title: '操作日志', roles: ['ADMIN'] } }
    ]
  },
  /* ------- 深色大屏（全屏，无侧边栏） -------
     大屏作为系统主界面，可直接访问（便于演示/大屏投放）；
     如需强制登录，去掉各路由的 meta.public 即可。 */
  { path: '/screen/overview', component: () => import('../screen/pages/NetworkOverview.vue'), meta: { title: '网络总览大屏', public: true } },
  { path: '/screen/basic', component: () => import('../screen/pages/BasicDataScreen.vue'), meta: { title: '基础数据大屏', public: true } },
  { path: '/screen/alerts', component: () => import('../screen/pages/AlertScreen.vue'), meta: { title: '风险预警大屏', public: true } },
  { path: '/screen/dispatch', component: () => import('../screen/pages/DispatchScreen.vue'), meta: { title: '应急调度大屏', public: true } },

  { path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') }
]

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) return '/login'
  if (to.path === '/login' && auth.isLoggedIn) return '/screen/overview'
  if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) return '/dashboard'
})
export default router
