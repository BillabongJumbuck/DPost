<template>
  <el-form ref="form" :model="data" label-width="auto">
    <el-form-item label="GitHub 仓库 URL" :error="repoError">
      <el-input v-model="data.repoURL" placeholder="https://github.com/owner/repo"></el-input>
    </el-form-item>
    <el-form-item label="目标组织（可选）">
      <el-input v-model="org" placeholder="your-org（可留空）"></el-input>
    </el-form-item>
    <el-form-item label="后端技术栈">
      <el-select v-model="data.techStack" placeholder="请选择您的后端框架">
        <el-option label="Spring Boot (Maven)" value="springboot_maven" />
        <el-option label="Node.js (Express)" value="nodejs_express" />
        <el-option label="Python (Flask)" value="python_flask" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        :loading="isSubmitting"
        :disabled="!data.repoURL || isSubmitting"
        @click="onNext"
      >下一步</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

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
const isSubmitting = ref(false)
const repoError = ref('')
const org = ref('')

function isValidGithubUrl(url: string): boolean {
  try {
    const u = new URL(url)
    if (u.hostname !== 'github.com' && u.hostname !== 'www.github.com') return false
    const parts = u.pathname.split('/').filter(Boolean)
    return parts.length >= 2
  } catch {
    return false
  }
}

const onNext = async () => {
  repoError.value = ''
  if (!isValidGithubUrl(data.repoURL)) {
    repoError.value = '请输入合法的 GitHub 仓库 URL，如 https://github.com/owner/repo'
    return
  }
  isSubmitting.value = true
  try {
    const resp = await fetch('http://localhost:8000/repos/fork', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo_url: data.repoURL,
        org: org.value || undefined
      })
    })
    const json = await resp.json().catch(() => ({}))
    if (resp.ok && json?.status === 'ok') {
      ElMessage.success('Fork 请求已提交')
      emit('next')
    } else {
      const msg = json?.data?.message || json?.detail || '请求失败，请检查 URL 是否正确'
      repoError.value = msg
    }
  } catch (e) {
    repoError.value = '网络错误，请稍后再试'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
</style>
