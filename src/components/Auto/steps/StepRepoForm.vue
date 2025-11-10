<template>
  <el-form ref="form" :model="data" label-width="auto">
    <el-form-item label="GitHub 仓库 URL">
      <el-input v-model="data.repoURL"></el-input>
    </el-form-item>
    <el-form-item label="后端技术栈">
      <el-select v-model="data.techStack" placeholder="请选择您的后端框架">
        <el-option label="Spring Boot (Maven)" value="springboot_maven" />
        <el-option label="Node.js (Express)" value="nodejs_express" />
        <el-option label="Python (Flask)" value="python_flask" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="emit('next')">下一步</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: {
    name?: string
    repoURL: string
    techStack: string
  }
}>()

const emit = defineEmits<{
  (event: 'next'): void
}>()

const data = props.data
</script>

<style scoped>
</style>

