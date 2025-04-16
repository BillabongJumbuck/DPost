<template>
  <div class="flex flex-1 flex-col">
    <div
      class="sticky top-lowerSecondaryStickyFold z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-dividerLight bg-primary pl-4"
    >
      <label class="truncate font-semibold text-secondaryLight"> 响应体 </label>
      <div class="flex">
        <HoppButtonSecondary
          v-if="responseBodyText"
          v-tippy="{ theme: 'tooltip' }"
          :title="'换行'"
          :class="{ '!text-accent': lineWrapping }"
          :icon="IconWrapText"
          @click.prevent="toggleWrapLines"
        />
        <HoppButtonSecondary
          v-if="responseBodyText"
          v-tippy="{ theme: 'tooltip', allowHTML: true }"
          :title="'复制'"
          :icon="IconCopy"
          @click="copyResponse"
        />
      </div>
    </div>
    <div class="h-full">
      <div ref="xmlResponse" class="flex flex-1 flex-col"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WrapTextIcon as IconWrapText, CopyIcon as IconCopy } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useCodemirror } from '@/utility/helper/useCodemirror'
import type { DHttpResponse } from '@/utility/model'
import { HoppButtonSecondary } from '@/components/Hopp'

const props = defineProps<{
  response: DHttpResponse
  isEditable: boolean
}>()

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
const xmlResponse = ref<HTMLElement>()
const { view } = useCodemirror(xmlResponse, responseBodyText, {
  langMime: 'application/xml',
  lineWrapping: lineWrapping.value,
  readOnly: !props.isEditable,
})
</script>

<style scoped></style>
