<template>
  <div class="relative flex flex-1 flex-col">
    <div
      class="sticky top-0 z-10 flex flex-shrink-0 items-center justify-center overflow-auto overflow-x-auto whitespace-nowrap bg-primary p-4"
    >
      <ShortCutPrompt v-if="response == null" />

      <div v-else-if="response" class="flex flex-1 flex-col">
        <div v-if="response.type === 'loading'" class="flex flex-col items-center justify-center">
          <HoppSpinner class="my-4" />
          <span class="text-secondaryLight">Loading</span>
        </div>

        <HoppPlaceholder
          v-if="response!.type === 'network_fail'"
          :src="'/images/upload_error.svg'"
          :alt="`网络错误`"
          :heading="'网络错误'"
          :text="'请检查你的网络连接'"
        >
          <template #body> </template>
        </HoppPlaceholder>

        <div
          v-if="response!.type === 'success' || response!.type === 'failure'"
          class="flex items-center text-tiny font-semibold"
        >
          <div :class="statusCategory.className" class="inline-flex flex-1 space-x-4">
            <span v-if="response!.statusCode">
              <span class="text-secondary"> 状态: </span>
              {{ `${response.statusCode}\xA0 • \xA0`
              }}{{ getStatusCodeReasonPhrase(response.statusCode, response.statusText) }}
            </span>
            <span v-if="response!.meta && response!.meta.responseDuration">
              <span class="text-secondary"> 时间: </span>
              {{ `${response.meta.responseDuration} ms` }}
            </span>
            <span
              v-if="response!.meta && response!.meta.responseSize"
              v-tippy="readableResponseSize ? { theme: 'tooltip' } : { onShow: () => false }"
              :title="`${response!.meta.responseSize} B`"
            >
              <span class="text-secondary"> 大小: </span>
              {{ readableResponseSize ? readableResponseSize : `${response.meta.responseSize} B` }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <ResponseBody :is-editable="false" :response="response"> </ResponseBody>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DHttpResponse } from '@/utility/model'
import { HoppSpinner, HoppPlaceholder } from '@/components/Hopp'
import findStatusGroup from '@/utility/helper/findStatusGroup.ts'
import { getStatusCodeReasonPhrase } from '@/utility/helper/statusCode'
import ShortCutPrompt from '@/components/Rest/ShortCutPrompt.vue'
import ResponseBody from '@/components/Rest/ResponseBody.vue'

const props = defineProps<{
  response: DHttpResponse | null
}>()

const statusCategory = computed(() => {
  if (
    props.response === null ||
    props.response === undefined ||
    props.response.type === 'loading' ||
    props.response.type === 'network_fail' ||
    props.response.type === 'script_fail' ||
    props.response.type === 'failure'
  )
    return {
      name: 'error',
      className: 'text-red-500',
    }
  return findStatusGroup(props.response.statusCode)
})

/**
 * Gives the response size in a human readable format
 * (changes unit from B to MB/KB depending on the size)
 * If no changes (error res state) or value can be made (size < 1KB ?),
 * it returns undefined
 */
const readableResponseSize = computed(() => {
  if (
    props.response === null ||
    props.response === undefined ||
    props.response.type === 'loading' ||
    props.response.type === 'network_fail' ||
    props.response.type === 'script_fail' ||
    props.response.type === 'failure'
  )
    return undefined

  const size = props.response.meta.responseSize

  if (size >= 100000) return (size / 1000000).toFixed(2) + ' MB'
  if (size >= 1000) return (size / 1000).toFixed(2) + ' KB'

  return undefined
})
</script>

<style scoped></style>
