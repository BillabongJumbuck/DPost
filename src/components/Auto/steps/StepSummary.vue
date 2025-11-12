<template>
  <div class="summary-step">
    <div class="summary-section repo-info">
      <div class="repo-info-header">
        <div class="section-title">仓库信息确认</div>
        <el-tag v-if="repoDetails.frameworkLabel" size="small" type="info">
          {{ repoDetails.frameworkLabel }}
        </el-tag>
      </div>
      <div class="repo-row">
        <span class="repo-label">仓库 URL：</span>
        <el-link :href="repoDetails.repoURL" target="_blank" type="primary" class="repo-value">
          {{ repoDetails.repoURL }}
        </el-link>
      </div>
      <div class="repo-row">
        <span class="repo-label">组织 / 仓库：</span>
        <span class="repo-value">
          {{ repoDetails.org }} <span v-if="repoDetails.repo">/ {{ repoDetails.repo }}</span>
        </span>
      </div>
    </div>

    <el-card shadow="never" class="summary-section testcases-wrapper">
      <div class="section-header">
        <div class="section-title">
          测试用例预览
          <el-tag class="ml-2" size="small" type="success">总计 {{ testCases.length }} 条</el-tag>
        </div>
      </div>
      <el-empty
        v-if="!testCases.length"
        description="未解析到有效的测试用例，请返回检查上传的 OpenAPI 文件。"
      />
      <el-table v-else :data="testCases" border class="testcase-table">
        <el-table-column prop="method" label="方法" width="90">
          <template #default="scope">
            <el-tag :type="tagType(scope.row.method)">{{ scope.row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="220" />
        <el-table-column prop="summary" label="概要" min-width="220">
          <template #default="scope">
            <div class="summary-text">{{ scope.row.summary }}</div>
            <div v-if="scope.row.description" class="description-text">
              {{ scope.row.description }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="actions">
      <el-button @click="emit('prev')" :disabled="isSubmitting">返回修改</el-button>
      <el-button
        type="primary"
        :disabled="!testCases.length || isSubmitting"
        :loading="isSubmitting"
        @click="handleConfirm"
      >
        确认并提交
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { submitTestCase } from '@/services/auto'

type RepoInfo = {
  name?: string
  repoURL: string
  org?: string
  techStack: string
}

type RepoDetails = {
  repoURL: string
  org: string
  repo: string
  repoName: string
  frameworkLabel: string
}

const props = defineProps<{
  repoInfo: RepoInfo
  spec: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  (event: 'finish', payload: SummaryPayload): void
  (event: 'prev'): void
}>()

type TestCase = {
  id: string
  method: string
  path: string
  summary: string
  description?: string
}

const SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE']

const repoDetails = computed<RepoDetails>(() => {
  const repoURL = props.repoInfo.repoURL?.trim() || ''
  let org = '未识别'
  let repo = ''

  try {
    const url = new URL(repoURL)
    if (url.hostname.includes('github.com')) {
      const [maybeOrg, maybeRepo] = url.pathname.replace(/^\/|\/$/g, '').split('/')
      if (maybeOrg) org = maybeOrg
      if (maybeRepo) repo = maybeRepo
    }
  } catch {
    // ignore parse errors
  }

  const filledOrg = props.repoInfo.org?.trim()
  if (filledOrg) {
    org = filledOrg
  }

  const sanitizedRepo = repo.replace(/\.git$/i, '')
  const customName = props.repoInfo.name?.trim()
  const repoName = customName || sanitizedRepo || '未命名仓库'

  const frameworkLabel =
    props.repoInfo.techStack === 'springboot_maven'
      ? 'Spring Boot (Maven)'
      : props.repoInfo.techStack === 'nodejs_express'
        ? 'Node.js (Express)'
        : props.repoInfo.techStack === 'python_flask'
          ? 'Python (Flask)'
          : ''

  return {
    repoURL: repoURL || '未填写',
    org,
    repo: sanitizedRepo,
    repoName,
    frameworkLabel,
  }
})

const testCases = computed<TestCase[]>(() => {
  const spec = props.spec
  if (!spec || typeof spec !== 'object') return []
  const paths = (spec as Record<string, unknown>).paths
  if (!paths || typeof paths !== 'object') return []

  const list: TestCase[] = []

  Object.entries(paths as Record<string, unknown>).forEach(([path, operations]) => {
    if (!operations || typeof operations !== 'object') return
    Object.entries(operations as Record<string, unknown>).forEach(([method, config]) => {
      const upperMethod = method.toUpperCase()
      if (!SUPPORTED_METHODS.includes(upperMethod)) return
      const op = (config ?? {}) as { summary?: unknown; description?: unknown }
      const summary =
        (typeof op.summary === 'string' && op.summary.trim()) || '未提供概要，请检查 OpenAPI 文档'
      const description = typeof op.description === 'string' ? op.description.trim() : undefined
      list.push({
        id: `${upperMethod}-${path}`,
        method: upperMethod,
        path,
        summary,
        description,
      })
    })
  })

  return list
})

const tagType = (method: string) => {
  switch (method) {
    case 'GET':
      return 'success'
    case 'POST':
      return 'primary'
    case 'PUT':
      return 'warning'
    case 'DELETE':
      return 'danger'
    default:
      return 'info'
  }
}

export type SummaryPayload = {
  repoInfo: RepoInfo
  repoDetails: RepoDetails
  testCases: TestCase[]
  spec: Record<string, unknown> | null
}

const isSubmitting = ref(false)

const handleConfirm = async () => {
  if (!props.spec || isSubmitting.value) return

  isSubmitting.value = true
  try {
    // 将 JSON spec 转换为 Blob 文件
    const jsonString = JSON.stringify(props.spec, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })

    // 调用 API 提交测试用例
    await submitTestCase({
      repo_url: props.repoInfo.repoURL.trim(),
      org: props.repoInfo.org?.trim() || undefined,
      tech_stack: props.repoInfo.techStack as
        | 'springboot_maven'
        | 'nodejs_express'
        | 'python_flask',
      test_case_file: blob,
    })

    ElMessage.success('测试用例提交成功')

    // 成功后触发 finish 事件
    const payload: SummaryPayload = {
      repoInfo: { ...props.repoInfo },
      repoDetails: { ...repoDetails.value },
      testCases: [...testCases.value],
      spec: props.spec,
    }
    emit('finish', payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : '提交测试用例失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.summary-step {
  min-height: 200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-section {
  padding: 12px 16px;
}

.repo-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.repo-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.repo-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.repo-label {
  color: var(--el-text-color-secondary);
}

.repo-value {
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.testcases-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.testcase-table {
  flex: 1;
  margin-top: 12px;
}

.testcase-table :deep(.el-scrollbar__wrap) {
  max-height: 320px;
}

.section-title {
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.summary-text {
  font-weight: 500;
}

.description-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}
</style>
