<template>
  <div class="flex flex-col">
    <tippy interactive trigger="click" theme="popover" placement="bottom" :on-shown="() => {}">
      <HoppSelectWrapper>
        <HoppButtonSecondary
          :label="CodegenDefinitions.find((x) => x.name === codegenType)!.caption"
          outline
          class="flex-1 pr-8"
        />
      </HoppSelectWrapper>
      <template #content="{ hide }">
        <div class="flex flex-col space-y-2">
          <div
            ref="tippyActions"
            class="flex flex-col focus:outline-none"
            tabindex="0"
            @keyup.escape="hide()"
          >
            <HoppItem
              v-for="codegen in CodegenDefinitions"
              :key="codegen.name"
              :label="codegen.caption"
              :info-icon="codegen.name === codegenType ? IconCheck : undefined"
              :active-info-icon="codegen.name === codegenType"
              @click="
                () => {
                  codegenType = codegen.name
                  hide()
                }
              "
            />
          </div>
        </div>
      </template>
    </tippy>
    <div
      v-if="errorState"
      class="mt-4 w-full overflow-auto whitespace-normal rounded bg-primaryLight px-4 py-2 font-mono text-red-400"
    >
      出错了
    </div>
    <div v-else-if="codegenType" class="mt-4 rounded border border-dividerLight">
      <div class="flex items-center justify-between pl-4">
        <label class="truncate font-semibold text-secondaryLight"> 已生成代码 </label>
        <div class="flex items-center">
          <HoppButtonSecondary
            v-tippy="{ theme: 'tooltip', allowHTML: true }"
            :title="'复制'"
            :icon="copyIcon"
            @click="copyResponse"
          />
        </div>
      </div>
      <div ref="generatedCode" class="rounded-b border-t border-dividerLight"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { HoppSelectWrapper, HoppButtonSecondary, HoppItem } from '@/components/Hopp'
import { Tippy } from 'vue-tippy'
import { CodegenDefinitions, type CodegenName } from '@/utility/helper/codegen'
import { useCodemirror } from '@/utility/helper/useCodemirror'
import { CopyIcon as IconCopy, CheckIcon as IconCheck } from 'lucide-vue-next'
import { copyToClipboard } from '@/utility/helper/clipboards'
import type { DHttpRequestDoc } from '@/utility/model'

const props = defineProps<{
  request: DHttpRequestDoc | null
}>()

const codegenType = ref<CodegenName>('shell-curl')
const generatedCode = ref<HTMLElement>()
const generatedContent = ref('')
const copyIcon = ref(IconCopy)
const errorState = ref(false)

// 组件挂载时触发一次代码生成
onMounted(() => {
  console.log('Codegen 组件已挂载')
  console.log('当前请求:', props.request)
  if (props.request) {
    console.log('初始化代码生成')
    const generator = CodegenDefinitions.find((x) => x.name === codegenType.value)
    console.log('找到的生成器:', generator)
    if (generator) {
      generatedContent.value = `// 代码生成类型: ${codegenType.value}\n// 请求URL: ${props.request.url}\n// 请求方法: ${props.request.method}`
    }
  } else {
    console.log('没有选中的请求，跳过初始化代码生成')
  }
})

// 使用 CodeMirror 展示生成的代码
const { view } = useCodemirror(generatedCode, generatedContent, {
  langMime: 'text/plain',
  readOnly: true,
  lineWrapping: true,
})

// 监听代码生成类型变化
watch(codegenType, async (newType) => {
  console.log('代码生成类型变化:', newType)
  const generator = CodegenDefinitions.find((x) => x.name === newType)
  if (!generator) return

  try {
    if (!props.request) {
      console.log('当前没有选中的请求')
      generatedContent.value = '// 请先选择一个请求'
      return
    }
    console.log('当前选中的请求:', props.request)
    // 临时使用一个简单的字符串作为生成的代码
    generatedContent.value = `// 代码生成类型: ${newType}\n// 请求URL: ${props.request.url}\n// 请求方法: ${props.request.method}`
  } catch (err) {
    console.error('代码生成失败:', err)
    generatedContent.value = '// Code generation failed'
  }
})

// 监听请求变化
watch(
  () => props.request,
  (newRequest) => {
    console.log('当前选中的请求变化:', newRequest)
    if (codegenType.value) {
      const generator = CodegenDefinitions.find((x) => x.name === codegenType.value)
      console.log('找到的生成器:', generator)
      if (generator && newRequest) {
        // 临时使用一个简单的字符串作为生成的代码
        generatedContent.value = `// 代码生成类型: ${codegenType.value}\n// 请求URL: ${newRequest.url}\n// 请求方法: ${newRequest.method}`
      }
    }
  },
  { deep: true, immediate: true },
) // 添加 immediate: true 确保立即执行一次

// 复制生成的代码
const copyResponse = async () => {
  const success = await copyToClipboard(generatedContent.value)
  if (success) {
    copyIcon.value = IconCheck
    setTimeout(() => {
      copyIcon.value = IconCopy
    }, 2000)
  }
}
</script>
