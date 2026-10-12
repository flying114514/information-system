<template>
  <section class="sk-panel" :style="style">
    <header class="sk-panel__head">
      <span class="sk-panel__bar"></span>
      <el-icon class="sk-panel__icon" v-if="icon"><component :is="icon" /></el-icon>
      <h3 class="sk-panel__title">{{ title }}</h3>
      <slot name="head-extra" />
      <span class="sk-panel__extra" v-if="extra" @click="$emit('more')">{{ extra }}<el-icon><ArrowRight /></el-icon></span>
    </header>
    <div class="sk-panel__body" :class="bodyClass">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  extra: { type: String, default: '' },
  bodyClass: { type: [String, Array, Object], default: '' },
  style: { type: [String, Object], default: '' }
})
defineEmits(['more'])
</script>
