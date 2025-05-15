<template>
  <div class="ai-chat-container">
    <div class="input-area">
      <el-input
        v-model="apiDoc"
        type="textarea"
        :rows="6"
        placeholder="请输入后端代码或API文档..."
        resize="none"
      />
    </div>
    <div class="button-area">
      <el-button type="primary" @click="handleSend">生成API测试</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElInput, ElButton, ElMessage } from 'element-plus'
import { generateApiTest } from '@/utility/helper/testgen'

const apiDoc = ref('')
const loading = ref(false)

const emit = defineEmits<{
  'create-new-tab': [
    tabData: ReturnType<typeof generateApiTest> extends Promise<infer T> ? T : never,
  ]
}>()

const handleSend = async () => {
  if (!apiDoc.value.trim()) {
    // ElMessage.warning('请输入后端代码或API文档')
    return
  }

  loading.value = true
  try {
    console.log('开始生成API测试...')
    const newTabData = await generateApiTest(apiDoc.value)
    console.log('API测试生成成功，准备发送事件:', newTabData)
    emit('create-new-tab', newTabData)
    console.log('create-new-tab 事件已触发')
    // ElMessage.success('API测试生成成功')
    apiDoc.value = '' // 清空输入
  } catch (error) {
    console.error('生成API测试失败:', error)
    // ElMessage.error(error instanceof Error ? error.message : '生成API测试失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ai-chat-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.input-area {
  flex: 1;
}

.button-area {
  display: flex;
  justify-content: flex-end;
}
</style>
