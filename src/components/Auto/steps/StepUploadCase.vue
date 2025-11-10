<template>
  <div class="upload-step">
    <p>这里是上传测试用例的占位内容。</p>
    <el-button type="primary" @click="emit('next')">下一步</el-button>
    <el-button class="ml-2" @click="emit('prev')">上一步</el-button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (event: 'next'): void
  (event: 'prev'): void
}>()
</script>

<style scoped>
.upload-step {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

