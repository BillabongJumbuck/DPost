<template>
  <el-dialog
    v-model="dialogVisible"
    title="测试结果"
    width="90%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="loading" class="test-results-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div v-else-if="error" class="test-results-error">
      <el-alert :title="error" type="error" :closable="false" />
    </div>
    <div v-else-if="testResultsData" class="test-results-content">
      <!-- 头部信息 -->
      <div class="test-results-header">
        <div class="header-item">
          <span class="label">仓库:</span>
          <span class="value">{{ testResultsData.data.repo_full_name }}</span>
        </div>
        <div class="header-item">
          <span class="label">组织:</span>
          <span class="value">{{ testResultsData.data.org || '未指定' }}</span>
        </div>
        <div class="header-item">
          <span class="label">Workflow Run ID:</span>
          <el-link
            :href="testResultsData.data.workflow_run_url"
            target="_blank"
            type="primary"
          >
            {{ testResultsData.data.workflow_run_id }}
          </el-link>
        </div>
        <div class="header-item">
          <span class="label">接收时间:</span>
          <span class="value">{{ formatDateTime(testResultsData.data.received_at) }}</span>
        </div>
      </div>

      <el-divider />

      <!-- 统计信息 -->
      <div class="test-results-stats">
        <div class="stat-card">
          <div class="stat-label">总测试数</div>
          <div class="stat-value">{{ testResultsData.data.test_results.total }}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">通过</div>
          <div class="stat-value">{{ testResultsData.data.test_results.passed }}</div>
        </div>
        <div class="stat-card failed">
          <div class="stat-label">失败</div>
          <div class="stat-value">{{ testResultsData.data.test_results.failed }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">成功率</div>
          <div class="stat-value">{{ testResultsData.data.test_results.successRate.toFixed(2) }}%</div>
        </div>
      </div>

      <el-divider />

      <!-- 测试用例列表 -->
      <div class="test-results-details">
        <h4>测试用例详情</h4>
        <div v-for="(testCase, index) in testResultsData.data.test_results.tests" :key="index" class="test-case-item">
          <el-card :shadow="testCase.passed ? 'never' : 'hover'" class="test-case-card">
            <template #header>
              <div class="test-case-header">
                <div class="test-case-title">
                  <el-icon :class="testCase.passed ? 'success-icon' : 'failed-icon'">
                    <component :is="testCase.passed ? 'Check' : 'Close'" />
                  </el-icon>
                  <span class="test-case-name">{{ testCase.name }}</span>
                </div>
                <el-tag :type="testCase.passed ? 'success' : 'danger'" size="large">
                  {{ testCase.passed ? '通过' : '失败' }}
                </el-tag>
              </div>
            </template>

            <!-- 测试步骤 -->
            <el-collapse v-model="activeSteps[index]" class="test-steps-collapse">
              <el-collapse-item :name="stepIndex" v-for="(step, stepIndex) in testCase.steps" :key="stepIndex">
                <template #title>
                  <div class="step-header">
                    <el-icon :class="step.success ? 'step-success-icon' : 'step-failed-icon'">
                      <component :is="step.success ? 'Check' : 'Close'" />
                    </el-icon>
                    <span class="step-name">{{ step.name }}</span>
                    <el-tag
                      :type="step.success ? 'success' : 'danger'"
                      size="small"
                      class="step-status-tag"
                    >
                      {{ step.success ? '成功' : '失败' }}
                    </el-tag>
                    <el-tag
                      :type="getStatusTagType(step.response.status)"
                      size="small"
                      class="step-status-code"
                    >
                      {{ step.response.status }}
                    </el-tag>
                  </div>
                </template>

                <div class="step-details">
                  <!-- 错误信息 -->
                  <div v-if="step.error" class="step-error">
                    <el-alert :title="step.error" type="error" :closable="false" />
                  </div>

                  <!-- 响应信息 -->
                  <div class="step-response">
                    <el-tabs :model-value="activeTab[`${index}-${stepIndex}`] || 'body'" @update:model-value="activeTab[`${index}-${stepIndex}`] = $event">
                      <el-tab-pane label="响应体" name="body">
                        <div class="response-content">
                          <pre v-if="typeof step.response.body === 'object'">{{
                            JSON.stringify(step.response.body, null, 2)
                          }}</pre>
                          <pre v-else>{{ step.response.body || '(空)' }}</pre>
                        </div>
                      </el-tab-pane>
                      <el-tab-pane label="原始响应" name="raw">
                        <div class="response-content">
                          <pre>{{ step.response.rawBody || '(空)' }}</pre>
                        </div>
                      </el-tab-pane>
                      <el-tab-pane label="响应头" name="headers">
                        <div class="response-content">
                          <pre>{{ JSON.stringify(step.response.headers, null, 2) }}</pre>
                        </div>
                      </el-tab-pane>
                    </el-tabs>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loading, Check, Close } from '@element-plus/icons-vue'
import type { GetLatestTestResultsResponse } from '@/services/auto'

defineOptions({
  name: 'TestResultsDialog',
})

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
  error?: string | null
  testResultsData?: GetLatestTestResultsResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = ref(props.modelValue)
const activeSteps = ref<Record<number, number[]>>({})
const activeTab = ref<Record<string, string>>({})

const initializeTestResults = () => {
  if (props.testResultsData?.data.test_results.tests) {
    props.testResultsData.data.test_results.tests.forEach((testCase, index) => {
      if (!testCase.passed) {
        activeSteps.value[index] = testCase.steps.map((_, i) => i)
      }
      // 初始化每个步骤的 tab
      testCase.steps.forEach((_, stepIndex) => {
        const tabKey = `${index}-${stepIndex}`
        if (!activeTab.value[tabKey]) {
          activeTab.value[tabKey] = 'body'
        }
      })
    })
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal
    if (newVal && props.testResultsData) {
      initializeTestResults()
    }
  },
)

watch(
  () => props.testResultsData,
  () => {
    if (props.modelValue && props.testResultsData) {
      initializeTestResults()
    }
  },
  { deep: true },
)

watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleClose = () => {
  activeSteps.value = {}
  activeTab.value = {}
}

const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return dateString
  }
}

const getStatusTagType = (status: number): 'success' | 'warning' | 'danger' | 'info' => {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'info'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'danger'
  return 'info'
}
</script>

<style scoped>
.test-results-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: var(--el-text-color-secondary);
}

.test-results-error {
  padding: 20px;
}

.test-results-content {
  padding: 0;
}

.test-results-header {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.header-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-item .label {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.header-item .value {
  color: var(--el-text-color-primary);
}

.test-results-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  background: var(--el-bg-color-page);
  text-align: center;
  border: 1px solid var(--el-border-color-light);
}

.stat-card.success {
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-7);
}

.stat-card.failed {
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-7);
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.test-results-details {
  margin-top: 16px;
}

.test-results-details h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.test-case-item {
  margin-bottom: 16px;
}

.test-case-card {
  border: 1px solid var(--el-border-color-light);
}

.test-case-card :deep(.el-card__header) {
  padding: 12px 16px;
  background: var(--el-bg-color-page);
}

.test-case-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.test-case-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.test-case-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.success-icon {
  color: var(--el-color-success);
  font-size: 20px;
}

.failed-icon {
  color: var(--el-color-danger);
  font-size: 20px;
}

.test-steps-collapse {
  border: none;
}

.test-steps-collapse :deep(.el-collapse-item__header) {
  padding: 8px 0;
  font-size: 14px;
}

.test-steps-collapse :deep(.el-collapse-item__content) {
  padding: 12px 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.step-name {
  flex: 1;
  font-weight: 500;
}

.step-success-icon {
  color: var(--el-color-success);
  font-size: 16px;
}

.step-failed-icon {
  color: var(--el-color-danger);
  font-size: 16px;
}

.step-status-tag {
  margin-left: auto;
}

.step-status-code {
  margin-left: 8px;
}

.step-details {
  padding: 12px 0;
}

.step-error {
  margin-bottom: 12px;
}

.step-response {
  margin-top: 12px;
}

.response-content {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 12px;
  max-height: 400px;
  overflow: auto;
}

.response-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

