<template>
  <div class="summary-step">
    <p>配置完成。后续流程可在此展示执行状态。</p>
    <el-button type="primary" @click="emit('finish')">完成</el-button>
    <el-button class="ml-2" @click="emit('prev')">上一步</el-button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (event: 'finish'): void
  (event: 'prev'): void
}>()
</script>

<style scoped>
.summary-step {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

