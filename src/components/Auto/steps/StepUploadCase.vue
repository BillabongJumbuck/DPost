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
      <div class="el-upload__text">将测试用例 JSON 拖拽到此处，或 <em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">仅支持 .json；需符合测试用例格式规范（包含 tests 字段）</div>
      </template>
    </el-upload>

    <div v-if="fileName" class="file-name">已选择：{{ fileName }}</div>
    <div v-if="errorMsg" class="error-text">{{ errorMsg }}</div>

    <div class="actions">
      <el-button class="ml-2" @click="emit('prev')">上一步</el-button>
      <el-button type="primary" :disabled="!isValid" @click="proceed">下一步</el-button>
    </div>

    <div class="spec-info">
      <div class="spec-title">测试用例格式简介</div>
      <p>
        上传的文件需符合 API 自动化测试用例格式规范，必须包含
        <code>tests</code> 字段（测试集数组），每个测试集包含多个测试步骤。
      </p>
      <div class="spec-example">
        <div class="spec-example-title">示例结构</div>
        <pre><code>{
  "config": {
    "baseUrl": "http://localhost:3000",
    "timeout": 5000
  },
  "variables": {
    "username": "alice"
  },
  "tests": [
    {
      "name": "User Workflow",
      "steps": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "/login",
            "body": {
              "username": "{{username}}"
            }
          },
          "expect": {
            "status": 200
          }
        }
      ]
    }
  ]
}</code></pre>
      </div>
      <ul class="spec-tips">
        <li>详细格式说明请参考 <code>src/schema/TESTCASE_FORMAT.md</code> 文档。</li>
        <li>推荐只上传与测试相关的用例，避免包含敏感信息。</li>
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
import { createValidator } from '@/schema/jsonSchemaValidator'
import testCaseSchema from '@/schema/schema.json'

const emit = defineEmits<{
  (event: 'next'): void
  (event: 'prev'): void
  (event: 'uploaded', spec: unknown): void
}>()

const isValid = ref(false)
const errorMsg = ref('')
const fileName = ref('')
let parsedSpec: unknown = null

const validateTestCase = createValidator(testCaseSchema)

function validateTestCaseFormat(spec: unknown): string | null {
  if (!spec || typeof spec !== 'object') return '文件内容不是有效的 JSON 对象'
  
  const valid = validateTestCase(spec)
  if (!valid) {
    const errors = validateTestCase.errors || []
    if (errors.length > 0) {
      const firstError = errors[0]
      const path = firstError.instancePath || firstError.schemaPath
      return `格式验证失败：${path} ${firstError.message || '不符合规范'}`
    }
    return '格式验证失败：文件不符合测试用例格式规范'
  }
  
  const s = spec as { tests?: unknown }
  if (!s.tests || !Array.isArray(s.tests) || s.tests.length === 0) {
    return '缺少 tests 字段或 tests 为空数组'
  }
  
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
    const err = validateTestCaseFormat(json)
    if (err) {
      errorMsg.value = err
      return
    }
    parsedSpec = json
    isValid.value = true
    ElMessage.success('用例文件校验通过')
  } catch (error) {
    if (error instanceof SyntaxError) {
      errorMsg.value = 'JSON 解析失败，请检查文件内容格式'
    } else {
      errorMsg.value = error instanceof Error ? error.message : '文件校验失败，请检查文件内容'
    }
  }
}

function proceed() {
  if (!isValid.value || !parsedSpec) {
    errorMsg.value = errorMsg.value || '请先上传并通过校验的测试用例 JSON 文件'
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
