<template>
  <div class="sk-table__wrap">
    <table class="sk-table" :class="{ 'sk-table--center': center }">
      <thead>
        <tr>
          <th v-for="c in columns" :key="c.prop" :style="c.width ? { width: c.width } : null">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="row.id ?? i">
          <td v-for="c in columns" :key="c.prop">
            <slot :name="c.prop" :row="row" :value="row[c.prop]" :index="i">
              {{ format(row[c.prop]) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!rows.length" class="sk-empty">暂无数据</div>
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  center: { type: Boolean, default: false }
})

function format(v) {
  if (v == null || v === '') return '—'
  if (typeof v === 'number') return v.toLocaleString('zh-CN')
  return v
}
</script>

<style scoped>
.sk-empty {
  padding: 22px;
  text-align: center;
  color: var(--sk-ink-3);
  font-size: 12px;
}
</style>
