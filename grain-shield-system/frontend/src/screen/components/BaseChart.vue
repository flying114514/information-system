<template>
  <div ref="el" class="sk-chart"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  option: { type: Object, required: true }
})

const el = ref()
let chart
let ro

function render() {
  if (!chart) return
  chart.setOption(props.option, true)
}
function resize() { chart?.resize() }

onMounted(() => {
  chart = echarts.init(el.value)
  render()
  window.addEventListener('resize', resize)
  // 容器尺寸会随 flex 布局变化（页脚出现、媒体查询收紧等），
  // 只监听 window.resize 会导致画布尺寸滞后而溢出，必须跟随容器
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => resize())
    ro.observe(el.value)
  }
})

watch(() => props.option, () => nextTick(render), { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  ro?.disconnect()
  ro = undefined
  chart?.dispose()
})

defineExpose({ resize, getChart: () => chart })
</script>
