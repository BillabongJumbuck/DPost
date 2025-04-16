<template>
  <div v-if="showResponse" class="flex flex-1 flex-col">
    <div
      class="sticky top-lowerSecondaryStickyFold z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-dividerLight bg-primary pl-4"
    >
      <label class="truncate font-semibold text-secondaryLight"> 响应体 </label>
      <div class="flex items-center">
        <HoppButtonSecondary
          v-tippy="{ theme: 'tooltip' }"
          :title="'换行'"
          :class="{ '!text-accent': lineWrapping }"
          :icon="IconWrapText"
          @click.prevent="toggleWrapLines"
        />
        <HoppButtonSecondary
          v-tippy="{ theme: 'tooltip' }"
          :title="'复制'"
          :icon="IconCopy"
          @click="copyResponse"
        />
      </div>
    </div>
    <div class="h-full relative overflow-auto flex flex-col flex-1">
      <div ref="jsonResponse" class="absolute inset-0 h-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HoppButtonSecondary } from '@/components/Hopp'
import { WrapTextIcon as IconWrapText, CopyIcon as IconCopy } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useCodemirror } from '@/utility/helper/useCodemirror'
import type { DHttpResponse } from '@/utility/model'

const props = defineProps<{
  response: DHttpResponse
  isEditable: boolean
}>()

const emit = defineEmits<{
  (e: 'update:response', val: DHttpResponse): void
}>()

// 显示响应内容的条件
const showResponse = computed(() => {
  return props.response.type === 'success' || props.response.type === 'failure'
})

// 获取响应体文本
const responseBodyText = computed(() => {
  if (props.response.type === 'success' || props.response.type === 'failure') {
    return new TextDecoder().decode(props.response.body)
  }
  return ''
})

// 复制功能
const copyResponse = async () => {
  try {
    await navigator.clipboard.writeText(responseBodyText.value)
  } catch (e) {
    console.error('复制失败:', e)
  }
}

// 换行功能
const lineWrapping = ref(true)
const toggleWrapLines = () => {
  lineWrapping.value = !lineWrapping.value
}

// CodeMirror 集成
const jsonResponse = ref<HTMLElement>()
const { view } = useCodemirror(jsonResponse, responseBodyText, {
  langMime: 'application/json',
  lineWrapping: lineWrapping.value,
  readOnly: !props.isEditable,
})
</script>

<style scoped></style>
