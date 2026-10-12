<template>
  <div class="sk-kpi" :class="`sk-kpi--${tone}`">
    <div class="sk-kpi__icon">
      <el-icon><component :is="icon" /></el-icon>
    </div>
    <div class="sk-kpi__body">
      <div class="sk-kpi__label">{{ label }}</div>
      <div class="sk-kpi__num">
        <span>{{ display }}</span>
        <span class="sk-kpi__unit" v-if="unit">{{ unit }}</span>
      </div>
      <div class="sk-kpi__delta" :class="dir" v-if="delta">
        <el-icon v-if="dir === 'up'"><Top /></el-icon>
        <el-icon v-else-if="dir === 'down'"><Bottom /></el-icon>
        <span>{{ delta }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  value: { type: [Number, String], default: 0 },
  unit: { type: String, default: '' },
  icon: { type: String, default: 'DataLine' },
  tone: { type: String, default: 'blue' },
  delta: { type: String, default: '' },
  dir: { type: String, default: 'flat' },
  decimals: { type: Number, default: 0 },
  animate: { type: Boolean, default: true }
})

const shown = ref(0)
let raf

function fmt(n) {
  const s = props.decimals > 0 ? Number(n).toFixed(props.decimals) : String(Math.round(Number(n)))
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const display = computed(() => {
  if (typeof props.value === 'number' || /^-?\d+(\.\d+)?$/.test(String(props.value))) {
    return fmt(shown.value)
  }
  return props.value
})

function run(target) {
  cancelAnimationFrame(raf)
  const from = Number(shown.value) || 0
  const to = Number(target) || 0
  const t0 = performance.now()
  const dur = 900
  const step = (now) => {
    const p = Math.min(1, (now - t0) / dur)
    const e = 1 - Math.pow(1 - p, 3)
    shown.value = from + (to - from) * e
    if (p < 1) raf = requestAnimationFrame(step)
    else shown.value = to
  }
  raf = requestAnimationFrame(step)
}

onMounted(() => { props.animate ? run(props.value) : (shown.value = Number(props.value) || 0) })
watch(() => props.value, (v) => { props.animate ? run(v) : (shown.value = Number(v) || 0) })
</script>
