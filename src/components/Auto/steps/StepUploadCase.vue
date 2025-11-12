<template>
  <div class="upload-step">
    <el-upload
      class="upload-box w-full"
      drag
      :auto-upload="false"
      :multiple="false"
      accept=".json,application/json"
      :show-file-list="false"
      :on-change="handleFileChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">将 OpenAPI JSON 拖拽到此处，或 <em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">仅支持 .json；需包含 openapi/swagger 与 paths 字段</div>
      </template>
    </el-upload>

    <div v-if="fileName" class="file-name">已选择：{{ fileName }}</div>
    <div v-if="errorMsg" class="error-text">{{ errorMsg }}</div>

    <div class="actions">
      <el-button class="ml-2" @click="emit('prev')">上一步</el-button>
      <el-button type="primary" :disabled="!isValid" @click="proceed">下一步</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile, UploadRawFile } from 'element-plus'

const emit = defineEmits<{
  (event: 'next'): void
  (event: 'prev'): void
  (event: 'uploaded', spec: unknown): void
}>()

const isValid = ref(false)
const errorMsg = ref('')
const fileName = ref('')
let parsedSpec: unknown = null

function validateOpenAPISpec(spec: unknown): string | null {
  if (!spec || typeof spec !== 'object') return '文件内容不是有效的 JSON 对象'
  const s = spec as { openapi?: unknown; swagger?: unknown; paths?: unknown }
  const hasVersion = !!(s.openapi || s.swagger)
  if (!hasVersion) return '缺少 openapi/swagger 字段'
  if (!s.paths || typeof s.paths !== 'object') return '缺少 paths 字段'
  return null
}

async function handleFileChange(file: UploadFile) {
  errorMsg.value = ''
  isValid.value = false
  parsedSpec = null
  fileName.value = file.name || ''
  const raw = file.raw as UploadRawFile | undefined
  if (!raw) {
    errorMsg.value = '无法读取文件'
    return
  }
  try {
    const text = await raw.text()
    const json = JSON.parse(text)
    const err = validateOpenAPISpec(json)
    if (err) {
      errorMsg.value = err
      return
    }
    parsedSpec = json
    isValid.value = true
    ElMessage.success('用例文件校验通过')
  } catch {
    errorMsg.value = 'JSON 解析失败，请检查文件内容'
  }
}

function proceed() {
  if (!isValid.value || !parsedSpec) {
    errorMsg.value = errorMsg.value || '请先上传并通过校验的 OpenAPI JSON 文件'
    return
  }
  emit('uploaded', parsedSpec)
  emit('next')
}
</script>

<style scoped>
.upload-step {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.upload-box {
  max-width: 520px;
  min-height: 140px;
  align-self: flex-start;
}
.file-name {
  color: var(--el-text-color-regular);
  font-size: 13px;
}
.error-text {
  color: var(--el-color-danger);
  font-size: 13px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
