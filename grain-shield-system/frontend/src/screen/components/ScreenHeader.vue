<template>
  <header class="sk-header">
    <div class="sk-header__side">
      <el-icon class="sk-header__city-icon"><LocationFilled /></el-icon>
      <span class="sk-header__city">{{ city }}</span>
      <span class="sk-header__dot"></span>
      <span>{{ dateText }}</span>
      <span>{{ weekText }}</span>
      <span class="sk-header__clock sk-num">{{ clock }}</span>
    </div>

    <div class="sk-header__center">
      <h1 class="sk-header__title">
        <svg class="sk-header__wheat sk-header__wheat--l" viewBox="0 0 24 24" fill="none">
          <path d="M12 22V8M12 8c0-2 1-3.5 3-4.5C15 6 14 7.5 12 8zm0 0c0-2-1-3.5-3-4.5C9 6 10 7.5 12 8zm3 .2c1.6-.6 3.4-.3 4.8.8-1.5 1-3.2 1-4.6.2zM9 8.2c-1.6-.6-3.4-.3-4.8.8 1.5 1 3.2 1 4.6.2z" stroke="#ffc53d" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Grain Shield 粮食供应链网络风险预警与智能调度系统
        <svg class="sk-header__wheat sk-header__wheat--r" viewBox="0 0 24 24" fill="none">
          <path d="M12 22V8M12 8c0-2 1-3.5 3-4.5C15 6 14 7.5 12 8zm0 0c0-2-1-3.5-3-4.5C9 6 10 7.5 12 8zm3 .2c1.6-.6 3.4-.3 4.8.8-1.5 1-3.2 1-4.6.2zM9 8.2c-1.6-.6-3.4-.3-4.8.8 1.5 1 3.2 1 4.6.2z" stroke="#ffc53d" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </h1>
      <p class="sk-header__sub">{{ subtitle }}</p>
    </div>

    <div class="sk-header__side sk-header__side--right">
      <span class="sk-header__slogan">保障粮食安全 · 服务城市共生</span>
    </div>

    <nav class="sk-nav">
      <span
        v-for="item in navs"
        :key="item.path"
        class="sk-nav__item"
        :class="{ 'is-active': item.path === active }"
        @click="go(item.path)"
      >{{ item.label }}</span>
      <span class="sk-nav__item sk-nav__item--exit" @click="$emit('exit')">管理端</span>
    </nav>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

defineProps({
  subtitle: { type: String, default: '' },
  active: { type: String, default: '' }
})
const emit = defineEmits(['exit'])
const router = useRouter()

const navs = [
  { path: '/screen/overview', label: '网络总览' },
  { path: '/screen/basic', label: '基础数据' },
  { path: '/screen/alerts', label: '风险预警' },
  { path: '/screen/dispatch', label: '应急调度' }
]

const city = '武汉市'
const clock = ref(dayjs().format('HH:mm:ss'))
const dateText = computed(() => dayjs().format('YYYY-MM-DD'))
const weekText = computed(() => '周' + '日一二三四五六'[dayjs().day()])

let timer
onMounted(() => { timer = setInterval(() => (clock.value = dayjs().format('HH:mm:ss')), 1000) })
onBeforeUnmount(() => clearInterval(timer))

function go(path) { if (path !== router.currentRoute.value.path) router.push(path) }
</script>

<style scoped>
.sk-header__city-icon { color: var(--sk-gold); }
.sk-header__wheat { width: 40px; height: 40px; vertical-align: middle; }
.sk-header__wheat--l { margin-right: 6px; }
.sk-header__wheat--r { margin-left: 6px; transform: scaleX(-1); }
.sk-nav__item--exit {
  border-left: 1px solid rgba(64, 150, 232, .3);
  margin-left: 2px;
  color: var(--sk-gold);
}
</style>
