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
import { ref, watch } from 'vue'
import { HoppSelectWrapper, HoppButtonSecondary, HoppItem } from '@/components/Hopp'
import { Tippy } from 'vue-tippy'
import { CodegenDefinitions, type CodegenName } from '@/utility/helper/codegen'
import { useCodemirror } from '@/utility/helper/useCodemirror'
import { CopyIcon as IconCopy, CheckIcon as IconCheck } from 'lucide-vue-next'
import { copyToClipboard } from '@/utility/helper/clipboards'
import type { DHttpRequestDoc } from '@/utility/model'

// const props = defineProps<{
//   request: DHttpRequestDoc
// }>()

const codegenType = ref<CodegenName>("shell-curl")
const generatedCode = ref<HTMLElement>()
const generatedContent = ref('')
const copyIcon = ref(IconCopy)
const errorState = ref(false)

// 使用 CodeMirror 展示生成的代码
const { view } = useCodemirror(generatedCode, generatedContent, {
  langMime: 'text/plain',
  readOnly: true,
  lineWrapping: true,
})

// 监听代码生成类型变化
watch(codegenType, async (newType) => {
  const generator = CodegenDefinitions.find((x) => x.name === newType)
  if (!generator) return

  try {
    const code = "hello"
    generatedContent.value = code
  } catch (err) {
    console.error('Code generation failed:', err)
    generatedContent.value = '// Code generation failed'
  }
})

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
