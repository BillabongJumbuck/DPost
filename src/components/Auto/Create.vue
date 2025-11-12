<template>
  <div class="h-full">
    <el-card class="main-card">
      <div style="font-size: 25px" class="justify-self-center">新建API 自动化测试配置</div>
      <el-divider></el-divider>

      <el-steps :active="activeStep">
        <el-step v-for="step in steps" :key="step.title" :title="step.title" :icon="step.icon" />
      </el-steps>

      <el-divider></el-divider>

      <div class="step-content">
        <component
          :is="currentComponent"
          v-bind="stepProps"
          @next="handleNext"
          @prev="handlePrev"
          @uploaded="handleUploaded"
          @finish="handleFinish"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed, reactive, ref } from 'vue'
import { Edit, Picture, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StepRepoForm from './steps/StepRepoForm.vue'
import StepUploadCase from './steps/StepUploadCase.vue'
import StepSummary, { type SummaryPayload } from './steps/StepSummary.vue'
import { forkRepository } from '@/services/auto'

defineOptions({
  name: 'AutoCreate',
})

const emit = defineEmits<{
  (event: 'created', payload: SummaryPayload): void
}>()

const data = reactive({
  name: '',
  repoURL: '',
  org: '',
  techStack: '',
})

type StepConfig = {
  title: string
  icon: Component
  component: Component
}

const steps: StepConfig[] = [
  {
    title: '填写仓库信息',
    icon: Edit,
    component: StepRepoForm,
  },
  {
    title: '上传测试用例',
    icon: Upload,
    component: StepUploadCase,
  },
  {
    title: 'Step 3',
    icon: Picture,
    component: StepSummary,
  },
]

const activeStep = ref(0)
const testSpec = ref<any | null>(null)
const isForking = ref(false)

const currentComponent = computed(() => steps[activeStep.value].component)

const stepProps = computed(() => {
  if (activeStep.value === 0) {
    return {
      data,
      loading: isForking.value,
    }
  }
  if (activeStep.value === 2) {
    return {
      repoInfo: data,
      spec: testSpec.value,
    }
  }
  return {}
})

const handleNext = async () => {
  if (activeStep.value === 0) {
    if (!data.repoURL.trim()) {
      ElMessage.warning('请先填写 GitHub 仓库 URL')
      return
    }
    if (isForking.value) return
    isForking.value = true
    try {
      await forkRepository({
        repo_url: data.repoURL.trim(),
        org: data.org?.trim() || undefined,
      })
      ElMessage.success('仓库 fork 请求已提交')
      activeStep.value += 1
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '仓库 fork 失败，请稍后重试'
      ElMessage.error(message)
    } finally {
      isForking.value = false
    }
    return
  }
  if (activeStep.value < steps.length - 1) {
    activeStep.value += 1
  }
}

const handlePrev = () => {
  if (activeStep.value > 0) {
    activeStep.value -= 1
  }
}

const resetFlow = () => {
  activeStep.value = 0
  data.name = ''
  data.repoURL = ''
  data.org = ''
  data.techStack = ''
  data.org = ''
  testSpec.value = null
}

const handleFinish = (payload: SummaryPayload) => {
  emit('created', payload)
  resetFlow()
}

const handleUploaded = (spec: unknown) => {
  testSpec.value = spec
  console.log('OpenAPI 规范已上传并解析', spec)
}
</script>

<style scoped>
.h-full {
  height: 100%;
  display: flex;
}

.main-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.step-content {
  flex: 1;
  min-height: 240px;
  padding: 12px 0;
}

.status-area {
  min-height: 120px;
}
</style>
