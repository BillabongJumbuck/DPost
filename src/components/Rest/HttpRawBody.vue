<template>
  <div class="flex flex-1 flex-col">
    <div
      class="sticky top-upperMobileStickyFold z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-dividerLight bg-primary pl-4 sm:top-upperMobileTertiaryStickyFold"
    >
      <label class="truncate font-semibold text-secondaryLight">
        原始请求体
      </label>
      <div class="flex">

        <HoppButtonSecondary
          v-tippy="{ theme: 'tooltip' }"
          :title="'清楚'"
          :icon="IconTrash2"
          @click="clearContent"
        />
        <HoppButtonSecondary
          v-tippy="{ theme: 'tooltip' }"
          :title="'换行'"
          :class="{ '!text-accent': WRAP_LINES }"
          :icon="IconWrapText"
          @click.prevent="() => {}"
        />
        <HoppButtonSecondary
          v-if="
            [
              'application/json',
              'application/ld+json',
              'application/hal+json',
              'application/vnd.api+json',
              'application/xml',
            ].includes(body.contentType!)
          "
          v-tippy="{ theme: 'tooltip' }"
          :title="'美化'"
          :icon="IconWand2"
          @click="prettifyRequestBody"
        />
        <HoppButtonSecondary
          v-if="shouldEnableAIFeatures"
          v-tippy="{ theme: 'tooltip' }"
          :title="'使用AI修改'"
          :icon="IconSparkles"
          @click="showModifyBodyModal"
        />
      </div>
    </div>
    <div class="h-full relative flex flex-col flex-1">
      <div ref="editorEl" class="absolute inset-0"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SparklesIcon as IconSparkles,
  Trash2Icon as IconTrash2,
  Wand2Icon as IconWand2,
  WrapTextIcon as IconWrapText
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useVModel } from '@vueuse/core'
import { HoppButtonSecondary } from '@/components/Hopp'
import { useCodemirror } from '@/utility/helper/useCodemirror'
import xmlFormat from 'xml-formatter'
import type { DHttpBody } from '@/utility/model'
import { prettifyJSONC } from '@/utility/helper/jsoncPretty.ts'
import { isJSONContentType } from '@/utility/helper/contenttypes.ts'

const props = defineProps<{
  modelValue: DHttpBody
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: DHttpBody): void
}>()

const body = useVModel(props, 'modelValue', emit)

const editorEl = ref<HTMLElement>()
const lineWrapping = ref(true)

// 编辑器初始化
const { view } = useCodemirror(
  editorEl,
  computed(() => body.value.bodyContent || ''), // 确保传递字符串内容
  {
    language: isJSONContentType(body.value.contentType!) ? 'json' : 'xml', // 根据内容类型判断
    lineWrapping: lineWrapping.value
  }
)

// 内容更新处理
watch(
  () => view.value?.state.doc.toString(),
  (newVal) => {
    if (newVal !== undefined && newVal !== body.value.bodyContent) {
      body.value.bodyContent = newVal
    }
  },
  { deep: true }
)

const rawParamsBody = computed({
  get: () => body.value.bodyContent || '',
  set: (val) => (body.value.bodyContent = val)
})

const WRAP_LINES = ref(true)

const prettifyXML = (xml: string) => {
  return xmlFormat(xml, {
    indentation: '  ',
    collapseContent: true,
    lineSeparator: '\n'
  })
}

const clearContent = () => {
  rawParamsBody.value = ''
}

const prettifyRequestBody = () => {
  let prettifyBody = ''
  try {
    if (body.value.contentType?.endsWith('json')) {
      prettifyBody = prettifyJSONC(rawParamsBody.value as string)
    } else if (body.value.contentType === 'application/xml') {
      prettifyBody = prettifyXML(rawParamsBody.value as string)
    }
    rawParamsBody.value = prettifyBody

  } catch (e) {
    console.error(e)
    // toast.error(`json_prettify_invalid_body`)
  }
}

const shouldEnableAIFeatures = ref(true)

const showModifyBodyModal = () => {}

</script>

<style scoped>

</style>
