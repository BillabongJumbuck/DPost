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
          :icon="copyIcon"
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
import {
  WrapTextIcon as IconWrapText,
  CopyIcon as IconCopy,
  CheckIcon as IconCheck,
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useCodemirror } from '@/utility/helper/useCodemirror'
import type { DHttpResponse } from '@/utility/model'
import { copyToClipboard } from '@/utility/helper/clipboards'
import { prettifyJSONC } from '@/utility/helper/jsoncPretty.ts'

const props = defineProps<{
  response: DHttpResponse
  isEditable: boolean
}>()

const emit = defineEmits<{
  (e: 'update:response', val: DHttpResponse): void
}>()

const copyIcon = ref(IconCopy)

// 显示响应内容的条件
const showResponse = computed(() => {
  return props.response.type === 'success' || props.response.type === 'failure'
})

// 使用 ref 存放编辑器要显示的内容，这个 ref 是可写的
const editorContent = ref('')

// 监听 props.response 对象的整体变化
// 将之前的 watch 代码块替换为以下代码块
watch(
  () => props.response,
  (newResponse) => {
    // <-- 监听整个 newResponse 对象
    // 在这里使用类型守卫检查类型
    if (newResponse.type === 'success' || newResponse.type === 'failure') {
      // 现在 TypeScript 知道 newResponse 是 DHttpSuccessResponse 或 DHttpFailureResponse，都有 body 属性
      editorContent.value = new TextDecoder().decode(newResponse.body)
    } else {
      // 处理其他类型，这些类型没有 body 属性
      editorContent.value = '' // 清空编辑器内容
    }
  },
  { deep: true, immediate: true },
) // deep: true 如果 response 对象内部深层属性变化也触发，immediate: true 初始执行

const copyResponse = async () => {
  const success = await copyToClipboard(editorContent.value)
  if (success) {
    copyIcon.value = IconCheck
    setTimeout(() => {
      copyIcon.value = IconCopy
    }, 2000)
  } else {
    console.error('复制失败')
  }
}
// 换行功能
const lineWrapping = ref(true)
const toggleWrapLines = () => {
  lineWrapping.value = !lineWrapping.value
  prettifyRequestBody()
}

const prettifyRequestBody = () => {
  let prettifyBody = ''
  try {
    // 对当前的 editorContent.value 进行格式化
    prettifyBody = prettifyJSONC(editorContent.value as string)
    // 更新 editorContent 的值为格式化后的文本
    editorContent.value = prettifyBody
  } catch (e) {
    console.error(e)
  }
}

// CodeMirror 集成
const jsonResponse = ref<HTMLElement>()
const { view } = useCodemirror(jsonResponse, editorContent, {
  langMime: 'application/json',
  lineWrapping: lineWrapping.value,
  readOnly: !props.isEditable,
})
</script>

<style scoped></style>
