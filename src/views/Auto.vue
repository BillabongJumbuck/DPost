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
        </el-table>
      </el-card>
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
import { ElMessage } from 'element-plus'
import { AutoCreate } from '@/components/Auto'
import type { SummaryPayload } from '@/components/Auto/steps/StepSummary.vue'

defineOptions({
  name: 'AutoPage',
})

type CreatedConfig = SummaryPayload & {
  id: string
  updatedAt: string
}

const isCreating = ref(false)
const configs = ref<CreatedConfig[]>([])

const startCreate = () => {
  isCreating.value = true
}

const cancelCreate = () => {
  isCreating.value = false
}

const handleCreated = (payload: SummaryPayload) => {
  const newConfig: CreatedConfig = {
    ...payload,
    id: Date.now().toString(),
    updatedAt: new Date().toISOString(),
  }
  configs.value = [newConfig, ...configs.value]
  isCreating.value = false
  ElMessage.success('自动化测试配置创建成功')
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
</style>
