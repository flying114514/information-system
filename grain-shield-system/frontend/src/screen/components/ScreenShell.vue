<template>
  <div class="sk-root">
    <div class="sk-stage">
      <ScreenHeader :subtitle="subtitle" :active="active" @exit="exit" />
      <div class="sk-kpis" :style="{ gridTemplateColumns: `repeat(${kpiCount}, minmax(0, 1fr))` }">
        <slot name="kpis" />
      </div>
      <div class="sk-main" :style="{ gridTemplateColumns: columns }">
        <slot />
      </div>
      <div v-if="$slots.footer" class="sk-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ScreenHeader from './ScreenHeader.vue'

defineProps({
  subtitle: { type: String, default: '' },
  active: { type: String, default: '' },
  kpiCount: { type: Number, default: 6 },
  columns: { type: String, default: 'minmax(0, 1.12fr) minmax(0, 1.72fr) minmax(0, 1.12fr)' }
})

const router = useRouter()
function exit() { router.push('/dashboard') }
</script>
