<template>
  <div class="flex flex-1 flex-col">
    <div
      class="sticky top-lowerSecondaryStickyFold z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-dividerLight bg-primary pl-4"
      :class="{ 'py-2': !responseBodyText }"
    >
      <label class="truncate font-semibold text-secondaryLight"> 响应体 </label>
      <div class="flex">
        <HoppButtonSecondary
          v-if="responseBodyText && !previewEnabled"
          v-tippy="{ theme: 'tooltip' }"
          :title="'换行'"
          :class="{ '!text-accent': lineWrapping }"
          :icon="IconWrapText"
          @click.prevent="toggleWrapLines"
        />
        <HoppButtonSecondary
          v-if="responseBodyText"
          v-tippy="{ theme: 'tooltip', allowHTML: true }"
          :title="previewEnabled ? '隐藏预览' : '预览HTML'"
          :icon="!previewEnabled ? IconEye : IconEyeOff"
          @click.prevent="togglePreview"
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
    <div v-show="!previewEnabled" class="h-full relative flex flex-col flex-1">
      <div ref="htmlResponse" class="absolute inset-0"></div>
    </div>
    <iframe
      v-show="previewEnabled"
      ref="previewFrame"
      class="covers-response"
      src="about:blank"
      loading="lazy"
      sandbox=""
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import {
  WrapTextIcon as IconWrapText,
  CopyIcon as IconCopy,
  EyeIcon as IconEye,
  EyeOffIcon as IconEyeOff,
} from 'lucide-vue-next'
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

// 预览功能
const previewEnabled = ref(false)
const previewFrame = ref<HTMLIFrameElement>()
const togglePreview = () => {
  previewEnabled.value = !previewEnabled.value
  if (previewEnabled.value && previewFrame.value) {
    previewFrame.value.srcdoc = responseBodyText.value
  }
}

// CodeMirror 集成
const htmlResponse = ref<HTMLElement>()
const { view } = useCodemirror(htmlResponse, responseBodyText, {
  langMime: 'text/html',
  lineWrapping: lineWrapping.value,
  readOnly: !props.isEditable,
})
</script>

<style lang="scss" scoped>
.covers-response {
  @apply bg-white;
  @apply h-full;
  @apply w-full;
  @apply border;
  @apply border-dividerLight;
  @apply z-10;
}
</style>
