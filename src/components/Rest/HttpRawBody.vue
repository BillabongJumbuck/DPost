<template>
  <div class="flex flex-1 flex-col">
    <div
      class="sticky top-upperMobileStickyFold z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-dividerLight bg-primary pl-4 sm:top-upperMobileTertiaryStickyFold"
    >
      <label class="truncate font-semibold text-secondaryLight"> 原始请求体 </label>
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
    <div class="relative flex-1">
      <div ref="editorEl" class="absolute inset-0"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SparklesIcon as IconSparkles,
  Trash2Icon as IconTrash2,
  Wand2Icon as IconWand2,
  WrapTextIcon as IconWrapText,
} from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { useVModel } from '@vueuse/core'
import { HoppButtonSecondary } from '@/components/Hopp'
import { useCodemirror } from '@/utility/helper/useCodemirror'
import xmlFormat from 'xml-formatter'
import type { DHttpBody } from '@/utility/model'
import { prettifyJSONC } from '@/utility/helper/jsoncPretty.ts'

const props = defineProps<{
  modelValue: DHttpBody
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: DHttpBody): void
}>()

const body = useVModel(props, 'modelValue', emit, {
  passive: true,
  deep: true,
})

const editorEl = ref<HTMLElement>()
const lineWrapping = ref(true)
const rawContent = ref(body.value.bodyContent ?? '')

// Editor initialization
const { view } = useCodemirror(editorEl, rawContent, {
  langMime: body.value.contentType!,
  lineWrapping: lineWrapping.value,
  placeholder: '请输入请求体',
})

// Sync local state to parent
watch(rawContent, (newVal) => {
  // Directly update bodyContent
  body.value.bodyContent = newVal
  // Ensure the parent is notified
  emit('update:modelValue', { ...body.value, bodyContent: newVal })
  console.log('Updated bodyContent:', newVal)
})

// Sync parent data to local state and editor
watch(
  () => props.modelValue.bodyContent,
  (newVal) => {
    const contentToSet = newVal ?? ''
    if (contentToSet !== rawContent.value) {
      rawContent.value = contentToSet
      view.value?.dispatch({
        changes: {
          from: 0,
          to: view.value.state.doc.length,
          insert: contentToSet,
        },
      })
    }
  },
)

const WRAP_LINES = ref(true)

const prettifyXML = (xml: string) => {
  return xmlFormat(xml, {
    indentation: '  ',
    collapseContent: true,
    lineSeparator: '\n',
  })
}

const clearContent = () => {
  rawContent.value = ''
}

const prettifyRequestBody = () => {
  let prettifyBody = ''
  try {
    if (body.value.contentType?.endsWith('json')) {
      prettifyBody = prettifyJSONC(rawContent.value as string)
    } else if (body.value.contentType === 'application/xml') {
      prettifyBody = prettifyXML(rawContent.value as string)
    }
    rawContent.value = prettifyBody
  } catch (e) {
    console.error(e)
    // toast.error(`json_prettify_invalid_body`)
  }
}

const shouldEnableAIFeatures = ref(true)

const showModifyBodyModal = () => {}
</script>

<style scoped>
/* Ensure the editor fills the container */
.editor-container {
  height: 100%;
  width: 100%;
}

/* Style CodeMirror to fill its parent */
:deep(.cm-editor) {
  height: 100%;
  width: 100%;
}

:deep(.cm-scroller) {
  height: 100%;
  width: 100%;
  overflow: auto;
}

:deep(.cm-content) {
  height: 100%;
  width: 100%;
}
</style>
