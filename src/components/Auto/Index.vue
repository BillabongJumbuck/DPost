<template>
  <div class="auto-page">
    <template v-if="!isCreating">
      <el-card shadow="never" class="list-card">
        <div class="list-header">
          <div>
            <div class="title">自动化测试配置</div>
            <div class="subtitle">查看已生成的配置，或创建新的自动化测试流程。</div>
          </div>
          <el-button type="primary" @click="startCreate">新建配置</el-button>
        </div>

        <el-empty v-if="!configs.length" description="暂无配置，点击右上角「新建配置」开始创建。" />

        <el-table v-else :data="configs" border class="configs-table">
          <el-table-column prop="repoDetails.repoName" label="配置名称" min-width="200">
            <template #default="scope">
              <div class="repo-cell">
                <el-link
                  type="primary"
                  class="repo-name"
                  :underline="false"
                  @click="showTestResults(scope.row)"
                >
                  {{ scope.row.repoDetails.repoName }}
                </el-link>
                <el-tag
                  v-if="scope.row.repoDetails.frameworkLabel"
                  size="small"
                  type="info"
                  class="ml-1"
                >
                  {{ scope.row.repoDetails.frameworkLabel }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="仓库地址" min-width="220">
            <template #default="scope">
              <el-link :href="scope.row.repoDetails.repoURL" target="_blank" type="primary">
                {{ scope.row.repoDetails.repoURL }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="测试用例数量" width="140" align="center">
            <template #default="scope">
              <el-tag type="success">{{ scope.row.testCases.length }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="最后更新" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="openUpdateDialog(scope.row)">
                更新用例
              </el-button>
              <el-button
                link
                type="info"
                size="small"
                :loading="syncingId === scope.row.id"
                @click="handleSync(scope.row)"
              >
                刷新
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                :loading="deletingId === scope.row.id"
                @click="handleDelete(scope.row)"
              >
                删除配置
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <UpdateDialog
        v-model="updateDialogVisible"
        :config="updatingConfig"
        @updated="handleUpdated"
      />

      <TestResultsDialog
        v-model="testResultsDialogVisible"
        :loading="loadingTestResults"
        :error="testResultsError"
        :test-results-data="testResultsData"
      />
    </template>

    <template v-else>
      <div class="create-header">
        <el-button link type="primary" @click="cancelCreate"> ← 返回配置列表 </el-button>
        <div class="create-tip">完成向导后，新的配置将自动出现在列表中。</div>
      </div>
      <AutoCreate @created="handleCreated" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AutoCreate from './Create.vue'
import UpdateDialog from './UpdateDialog.vue'
import TestResultsDialog from './TestResultsDialog.vue'
import type { SummaryPayload } from './steps/StepSummary.vue'
import { deleteRepository, getLatestTestResults, syncUpstream } from '@/services/auto'
import type { GetLatestTestResultsResponse } from '@/services/auto'
import type { SyncUpstreamPayload } from '@/services/auto'
import { useAutoConfigs } from './composables/useAutoConfigs'
import type { CreatedConfig } from './composables/useAutoConfigs'
import { formatDate } from './utils/configUtils'

defineOptions({
  name: 'AutoIndex',
})

const { configs, addConfig, updateConfig, removeConfig } = useAutoConfigs()

const isCreating = ref(false)
const updateDialogVisible = ref(false)
const updatingConfig = ref<CreatedConfig | null>(null)
const deletingId = ref<string | null>(null)
const syncingId = ref<string | null>(null)
const testResultsDialogVisible = ref(false)
const loadingTestResults = ref(false)
const testResultsError = ref<string | null>(null)
const testResultsData = ref<GetLatestTestResultsResponse | null>(null)

const startCreate = () => {
  isCreating.value = true
}

const cancelCreate = () => {
  isCreating.value = false
}

const handleCreated = (payload: SummaryPayload) => {
  addConfig(payload)
  isCreating.value = false
  ElMessage.success('自动化测试配置创建成功')
}

const openUpdateDialog = (config: CreatedConfig) => {
  updatingConfig.value = config
  updateDialogVisible.value = true
}

const handleUpdated = (
  config: CreatedConfig,
  updates: { spec: Record<string, unknown> | null; testCases: CreatedConfig['testCases'] },
) => {
  updateConfig(config.id, {
    spec: updates.spec,
    testCases: updates.testCases,
  })
}

const handleDelete = async (config: CreatedConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除仓库「${config.repoDetails.repoName}」及其关联数据吗？该操作不可恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
      },
    )
  } catch {
    return
  }

  if (deletingId.value) return
  deletingId.value = config.id

  try {
    await deleteRepository({
      repo_url: config.repoInfo.repoURL.trim(),
      org: config.repoInfo.org?.trim() || undefined,
    })
    removeConfig(config.id)
    ElMessage.success('配置已删除')
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除配置失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    deletingId.value = null
  }
}

const handleSync = async (config: CreatedConfig) => {
  if (syncingId.value) return
  syncingId.value = config.id

  try {
    const payload: SyncUpstreamPayload = {
      repo_url: config.repoInfo.repoURL.trim(),
      org: config.repoInfo.org?.trim() || undefined,
      branch: 'main',
    }

    const res = await syncUpstream(payload)
    // GitHub may return 200 or 202. Show a friendly message.
    if (res && typeof res === 'object' && 'status' in (res as any)) {
      // if backend passes status through, handle it; otherwise just show success
    }
    ElMessage.success('已发起同步请求（请查看 GitHub 或稍后刷新）')
  } catch (error) {
    const message = error instanceof Error ? error.message : '同步失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    syncingId.value = null
  }
}

const showTestResults = async (config: CreatedConfig) => {
  testResultsDialogVisible.value = true
  loadingTestResults.value = true
  testResultsError.value = null
  testResultsData.value = null

  try {
    const response = await getLatestTestResults({
      repo_url: config.repoInfo.repoURL.trim(),
      org: config.repoInfo.org?.trim() || undefined,
    })
    testResultsData.value = response
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取测试结果失败，请稍后重试'
    testResultsError.value = message
    if (error instanceof Error && error.message.includes('404')) {
      testResultsError.value = '未找到该仓库的测试结果'
    }
  } finally {
    loadingTestResults.value = false
  }
}
</script>

<style scoped>
.auto-page {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.title {
  font-size: 20px;
  font-weight: 600;
}

.subtitle {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.configs-table {
  flex: 1;
}

.repo-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.repo-name {
  font-weight: 500;
}

.create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.create-tip {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
