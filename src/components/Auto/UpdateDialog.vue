<template>
  <el-dialog v-model="visible" title="更新测试用例" width="600px" @close="handleClose">
    <div v-if="config">
      <div class="update-info">
        <p><strong>仓库：</strong>{{ config.repoDetails.repoName }}</p>
        <p><strong>地址：</strong>{{ config.repoDetails.repoURL }}</p>
      </div>
      <el-upload
        ref="uploadRef"
        class="update-upload"
        drag
        :auto-upload="false"
        :multiple="false"
        accept=".json,application/json"
        :show-file-list="true"
        :on-change="handleFileChange"
        :limit="1"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将新的 OpenAPI JSON 拖拽到此处，或 <em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .json；需包含 openapi/swagger 与 paths 字段</div>
        </template>
      </el-upload>
      <div v-if="errorMsg" class="error-text">{{ errorMsg }}</div>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="isUpdating" :disabled="!isValid" @click="handleConfirm">
        确认更新
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { updateTestCase } from '@/services/auto'
import type { CreatedConfig } from './composables/useAutoConfigs'
import { validateOpenAPISpec, deriveTestCasesFromSpec } from './utils/configUtils'

defineOptions({
  name: 'UpdateDialog',
})

const props = defineProps<{
  modelValue: boolean
  config: CreatedConfig | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  updated: [
    config: CreatedConfig,
    updates: { spec: Record<string, unknown> | null; testCases: CreatedConfig['testCases'] },
  ]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const uploadRef = ref()
const file = ref<File | null>(null)
const parsedSpec = ref<Record<string, unknown> | null>(null)
const errorMsg = ref('')
const isUpdating = ref(false)

const isValid = computed(() => !!file.value && !!parsedSpec.value)

const handleClose = () => {
  visible.value = false
  file.value = null
  parsedSpec.value = null
  errorMsg.value = ''
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const handleFileChange = async (uploadFile: UploadFile) => {
  errorMsg.value = ''
  file.value = null
  parsedSpec.value = null

  const raw = uploadFile.raw as UploadRawFile | undefined
  if (!raw) {
    errorMsg.value = '无法读取文件'
    return
  }

  try {
    const text = await raw.text()
    const json = JSON.parse(text) as Record<string, unknown>
    const err = validateOpenAPISpec(json)
    if (err) {
      errorMsg.value = err
      return
    }
    parsedSpec.value = json
    file.value = raw
  } catch {
    errorMsg.value = 'JSON 解析失败，请检查文件内容'
  }
}

const handleConfirm = async () => {
  if (!props.config || !file.value || !parsedSpec.value || isUpdating.value) return

  isUpdating.value = true
  errorMsg.value = ''

  try {
    await updateTestCase({
      repo_url: props.config.repoInfo.repoURL.trim(),
      org: props.config.repoInfo.org?.trim() || undefined,
      tech_stack: props.config.repoInfo.techStack as
        | 'springboot_maven'
        | 'nodejs_express'
        | 'python_flask',
      test_case_file: file.value,
    })

    ElMessage.success('测试用例更新成功')

    const testCases = deriveTestCasesFromSpec(parsedSpec.value)
    emit('updated', props.config, {
      spec: JSON.parse(JSON.stringify(parsedSpec.value)),
      testCases,
    })

    handleClose()
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新测试用例失败，请稍后重试'
    errorMsg.value = message
    ElMessage.error(message)
  } finally {
    isUpdating.value = false
  }
}
</script>

<style scoped>
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
