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

        <el-empty v-if="!configs.length" description="暂无配置，点击右上角“新建配置”开始创建。" />

        <el-table v-else :data="configs" border class="configs-table">
          <el-table-column prop="repoDetails.repoName" label="配置名称" min-width="200">
            <template #default="scope">
              <div class="repo-cell">
                <span class="repo-name">{{ scope.row.repoDetails.repoName }}</span>
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

      <!-- 更新测试用例对话框 -->
      <el-dialog v-model="updateDialogVisible" title="更新测试用例" width="600px">
        <div v-if="updatingConfig">
          <div class="update-info">
            <p><strong>仓库：</strong>{{ updatingConfig.repoDetails.repoName }}</p>
            <p><strong>地址：</strong>{{ updatingConfig.repoDetails.repoURL }}</p>
          </div>
          <el-upload
            ref="uploadRef"
            class="update-upload"
            drag
            :auto-upload="false"
            :multiple="false"
            accept=".json,application/json"
            :show-file-list="true"
            :on-change="handleUpdateFileChange"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将新的 OpenAPI JSON 拖拽到此处，或 <em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">仅支持 .json；需包含 openapi/swagger 与 paths 字段</div>
            </template>
          </el-upload>
          <div v-if="updateErrorMsg" class="error-text">{{ updateErrorMsg }}</div>
        </div>
        <template #footer>
          <el-button @click="closeUpdateDialog">取消</el-button>
          <el-button
            type="primary"
            :loading="isUpdating"
            :disabled="!updateFile"
            @click="handleUpdate"
          >
            确认更新
          </el-button>
        </template>
      </el-dialog>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile, UploadRawFile } from 'element-plus'
import AutoCreate from './Create.vue'
import type { SummaryPayload } from './steps/StepSummary.vue'
import { deleteRepository, updateTestCase } from '@/services/auto'

defineOptions({
  name: 'AutoIndex',
})

type CreatedConfig = SummaryPayload & {
  id: string
  updatedAt: string
}

const STORAGE_KEY = 'posttest:auto-configs'
const SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE']

const normalizeConfigFromStorage = (raw: unknown): CreatedConfig | null => {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>

  if (typeof obj.id !== 'string' || typeof obj.updatedAt !== 'string') return null

  const repoInfoRaw = obj.repoInfo
  if (!repoInfoRaw || typeof repoInfoRaw !== 'object') return null
  const repoInfo = repoInfoRaw as Record<string, unknown>
  if (typeof repoInfo.repoURL !== 'string' || typeof repoInfo.techStack !== 'string') return null

  const repoDetailsRaw = obj.repoDetails
  if (!repoDetailsRaw || typeof repoDetailsRaw !== 'object') return null
  const repoDetails = repoDetailsRaw as Record<string, unknown>

  const testCasesRaw = Array.isArray(obj.testCases) ? (obj.testCases as unknown[]) : []
  const testCases = testCasesRaw
    .map((tc) => {
      if (!tc || typeof tc !== 'object') return null
      const caseObj = tc as Record<string, unknown>
      const method = typeof caseObj.method === 'string' ? caseObj.method : ''
      const path = typeof caseObj.path === 'string' ? caseObj.path : ''
      if (!method || !path) return null
      const summary = typeof caseObj.summary === 'string' ? caseObj.summary : ''
      const description = typeof caseObj.description === 'string' ? caseObj.description : undefined
      const result: SummaryPayload['testCases'][number] = {
        id: typeof caseObj.id === 'string' ? caseObj.id : `${method}-${path}`,
        method,
        path,
        summary,
      }
      if (description) result.description = description
      return result
    })
    .filter((tc): tc is SummaryPayload['testCases'][number] => tc !== null)

  const spec =
    obj.spec && typeof obj.spec === 'object' ? (obj.spec as Record<string, unknown>) : null

  return {
    repoInfo: {
      name: typeof repoInfo.name === 'string' ? repoInfo.name : undefined,
      repoURL: repoInfo.repoURL,
      org: typeof repoInfo.org === 'string' ? repoInfo.org : undefined,
      techStack: repoInfo.techStack,
    },
    repoDetails: {
      repoURL: typeof repoDetails.repoURL === 'string' ? repoDetails.repoURL : repoInfo.repoURL,
      org: typeof repoDetails.org === 'string' ? repoDetails.org : '未识别',
      repo: typeof repoDetails.repo === 'string' ? repoDetails.repo : '',
      repoName: typeof repoDetails.repoName === 'string' ? repoDetails.repoName : '',
      frameworkLabel:
        typeof repoDetails.frameworkLabel === 'string' ? repoDetails.frameworkLabel : '',
    },
    testCases,
    spec,
    id: obj.id,
    updatedAt: obj.updatedAt,
  }
}

const loadConfigsFromStorage = (): CreatedConfig[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => normalizeConfigFromStorage(item))
      .filter((item): item is CreatedConfig => !!item)
  } catch (error) {
    console.warn('加载本地配置失败:', error)
    return []
  }
}

const configs = ref<CreatedConfig[]>(loadConfigsFromStorage())

const persistConfigs = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs.value))
  } catch (error) {
    console.warn('保存本地配置失败:', error)
  }
}

const isCreating = ref(false)

// 更新对话框相关状态
const updateDialogVisible = ref(false)
const updatingConfig = ref<CreatedConfig | null>(null)
const updateFile = ref<File | null>(null)
const updateErrorMsg = ref('')
const isUpdating = ref(false)
const uploadRef = ref()
const updateParsedSpec = ref<Record<string, unknown> | null>(null)
const updateDerivedTestCases = ref<SummaryPayload['testCases']>([])
const deletingId = ref<string | null>(null)

const startCreate = () => {
  isCreating.value = true
}

const cancelCreate = () => {
  isCreating.value = false
}

const handleCreated = (payload: SummaryPayload) => {
  const sanitizedPayload: SummaryPayload = {
    repoInfo: { ...payload.repoInfo },
    repoDetails: { ...payload.repoDetails },
    testCases: payload.testCases.map((item) => ({ ...item })),
    spec: payload.spec ? JSON.parse(JSON.stringify(payload.spec)) : null,
  }

  const newConfig: CreatedConfig = {
    ...sanitizedPayload,
    id: Date.now().toString(),
    updatedAt: new Date().toISOString(),
  }
  configs.value = [newConfig, ...configs.value]
  persistConfigs()
  isCreating.value = false
  ElMessage.success('自动化测试配置创建成功')
}

const openUpdateDialog = (config: CreatedConfig) => {
  updatingConfig.value = config
  updateFile.value = null
  updateErrorMsg.value = ''
  updateParsedSpec.value = null
  updateDerivedTestCases.value = []
  updateDialogVisible.value = true
}

const closeUpdateDialog = () => {
  updateDialogVisible.value = false
  updatingConfig.value = null
  updateFile.value = null
  updateErrorMsg.value = ''
  updateParsedSpec.value = null
  updateDerivedTestCases.value = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

function validateOpenAPISpec(spec: unknown): string | null {
  if (!spec || typeof spec !== 'object') return '文件内容不是有效的 JSON 对象'
  const s = spec as { openapi?: unknown; swagger?: unknown; paths?: unknown }
  const hasVersion = !!(s.openapi || s.swagger)
  if (!hasVersion) return '缺少 openapi/swagger 字段'
  if (!s.paths || typeof s.paths !== 'object') return '缺少 paths 字段'
  return null
}

const deriveTestCasesFromSpec = (spec: Record<string, unknown>): SummaryPayload['testCases'] => {
  const paths = spec.paths
  if (!paths || typeof paths !== 'object') return []

  const list: SummaryPayload['testCases'] = []

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
}

const handleUpdateFileChange = async (file: UploadFile) => {
  updateErrorMsg.value = ''
  updateFile.value = null

  const raw = file.raw as UploadRawFile | undefined
  if (!raw) {
    updateErrorMsg.value = '无法读取文件'
    return
  }

  try {
    const text = await raw.text()
    const json = JSON.parse(text) as Record<string, unknown>
    const err = validateOpenAPISpec(json)
    if (err) {
      updateErrorMsg.value = err
      updateParsedSpec.value = null
      updateDerivedTestCases.value = []
      return
    }
    updateParsedSpec.value = json
    updateDerivedTestCases.value = deriveTestCasesFromSpec(json)
    updateFile.value = raw
  } catch {
    updateErrorMsg.value = 'JSON 解析失败，请检查文件内容'
    updateParsedSpec.value = null
    updateDerivedTestCases.value = []
  }
}

const handleUpdate = async () => {
  if (!updatingConfig.value || !updateFile.value || isUpdating.value) return

  isUpdating.value = true
  updateErrorMsg.value = ''

  try {
    await updateTestCase({
      repo_url: updatingConfig.value.repoInfo.repoURL.trim(),
      org: updatingConfig.value.repoInfo.org?.trim() || undefined,
      tech_stack: updatingConfig.value.repoInfo.techStack as
        | 'springboot_maven'
        | 'nodejs_express'
        | 'python_flask',
      test_case_file: updateFile.value,
    })

    ElMessage.success('测试用例更新成功')
    if (updateParsedSpec.value) {
      updatingConfig.value.spec = JSON.parse(JSON.stringify(updateParsedSpec.value))
    }
    updatingConfig.value.testCases = updateDerivedTestCases.value.map((item) => ({ ...item }))
    // 更新配置的更新时间
    updatingConfig.value.updatedAt = new Date().toISOString()
    configs.value = configs.value.slice()
    persistConfigs()
    closeUpdateDialog()
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新测试用例失败，请稍后重试'
    updateErrorMsg.value = message
    ElMessage.error(message)
  } finally {
    isUpdating.value = false
  }
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
    configs.value = configs.value.filter((item) => item.id !== config.id)
    persistConfigs()
    ElMessage.success('配置已删除')
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除配置失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    deletingId.value = null
  }
}

const formatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const formatDate = (iso: string) => formatter.format(new Date(iso))
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

.update-info {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.update-info p {
  margin: 4px 0;
  font-size: 13px;
}

.update-upload {
  margin-top: 12px;
}

.error-text {
  color: var(--el-color-danger);
  font-size: 13px;
  margin-top: 8px;
}
</style>
