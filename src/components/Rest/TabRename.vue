<template>
  <HoppModal v-if="show" dialog :title="'编辑请求'" @close="hideModal">
    <template #body>
      <div class="flex gap-1">
        <Hoppinput
          v-model="editingName"
          class="flex-grow"
          placeholder=" "
          :id="timestamp().toString()"
          type="text"
          :autofocus="true"
          :style="''"
          :label="'标签'"
          input-styles="floating-input"
          @submit="editRequest"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between items-center w-full">
        <div class="flex space-x-2">
          <HoppButtonPrimary :label="'保存'" :loading="loadingState" outline @click="editRequest" />
          <HoppButtonSecondary :label="'取消'" outline filled @click="hideModal" />
        </div>
      </div>
    </template>
  </HoppModal>
</template>

<script setup lang="ts">
import { HoppButtonSecondary, Hoppinput, HoppButtonPrimary } from '@/components/Hopp'
import { HoppModal } from '@/components/Hopp/modal/index.ts'
import { timestamp, useVModel } from '@vueuse/core'
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    loadingState?: boolean
    modelValue?: string
  }>(),
  {
    show: false,
    loadingState: false,
    modelValue: '',
  },
)

const emit = defineEmits<{
  (e: 'submit', name: string): void
  (e: 'hide-modal'): void
  (e: 'update:modelValue', value: string): void
}>()

const editingName = useVModel(props, 'modelValue')

watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      submittedFeedback.value = false
    }
  },
)

const submittedFeedback = ref(false)

const editRequest = () => {
  if (props.loadingState) {
    return
  }

  if (editingName.value.trim() === '') {
    // toast.error('非法名称')
    return
  }

  emit('submit', editingName.value)
}

const hideModal = () => {
  editingName.value = ''
  emit('hide-modal')
}
</script>
