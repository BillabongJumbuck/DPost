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

    <div class="spec-info">
      <div class="spec-title">OpenAPI 用例简介</div>
      <p>
        上传的文件需符合 OpenAPI 3.0/Swagger 2.0 规范，并至少包含
        <code>openapi</code>/<code>swagger</code> 版本声明和
        <code>paths</code> 节点，我们会基于这些信息生成自动化测试。
      </p>
      <div class="spec-example">
        <div class="spec-example-title">示例结构</div>
        <pre><code>{
  "openapi": "3.0.1",
  "info": {
    "title": "Weather API",
    "version": "1.0.0"
  },
  "paths": {
    "/weather": {
      "get": {
        "summary": "获取天气信息",
        "responses": {
          "200": {
            "description": "成功响应"
          }
        }
      }
    }
  }
}</code></pre>
      </div>
      <ul class="spec-tips">
        <li>推荐只上传与测试相关的子集，避免包含敏感信息。</li>
        <li>若有多环境配置，可通过不同文件分别上传。</li>
        <li>解析失败时，可对照示例检查字段命名及 JSON 格式。</li>
      </ul>
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

.spec-info {
  margin-top: 16px;
  padding: 12px 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background-color: var(--el-fill-color-light);
  font-size: 13px;
  color: var(--el-text-color-regular);
  max-height: 220px;
  overflow-y: auto;
}

.spec-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.spec-example {
  margin-top: 8px;
  padding: 8px 10px;
  background-color: var(--el-fill-color-extra-light);
  border-radius: 6px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  line-height: 1.45;
  overflow-x: auto;
}

.spec-example-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.spec-tips {
  margin-top: 8px;
  padding-left: 18px;
  list-style: disc;
}

.spec-tips li {
  margin-bottom: 4px;
}
</style>
