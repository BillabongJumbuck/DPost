<template>
  <el-form ref="form" :model="data" label-width="auto">
    <el-form-item label="GitHub 仓库 URL">
      <el-input v-model="data.repoURL"></el-input>
    </el-form-item>
    <el-form-item label="GitHub 组织 (可选)">
      <el-input v-model="data.org" placeholder="填写后端机器人将优先在该组织下创建 fork"></el-input>
    </el-form-item>
    <el-form-item label="后端技术栈">
      <el-select v-model="data.techStack" placeholder="请选择您的后端框架">
        <el-option label="Spring Boot (Maven)" value="springboot_maven" />
        <el-option label="Node.js (Express)" value="nodejs_express" />
        <el-option label="Python (Flask)" value="python_flask" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="loading" :disabled="loading" @click="emit('next')">
        下一步
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: {
    name?: string
    repoURL: string
    org?: string
    techStack: string
  }
  loading?: boolean
}>()

const emit = defineEmits<{
  (event: 'next'): void
}>()

const data = props.data
const loading = computed(() => props.loading ?? false)
</script>

<style scoped></style>
