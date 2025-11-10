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
import StepRepoForm from './steps/StepRepoForm.vue'
import StepUploadCase from './steps/StepUploadCase.vue'
import StepSummary from './steps/StepSummary.vue'

defineOptions({
  name: 'AutoCreate',
})

const data = reactive({
  name: '',
  repoURL: '',
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

const currentComponent = computed(() => steps[activeStep.value].component)

const stepProps = computed(() => {
  if (activeStep.value === 0) {
    return {
      data,
    }
  }
  return {}
})

const handleNext = () => {
  if (activeStep.value < steps.length - 1) {
    activeStep.value += 1
  }
}

const handlePrev = () => {
  if (activeStep.value > 0) {
    activeStep.value -= 1
  }
}

const handleFinish = () => {
  console.log('流程完成', data)
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
