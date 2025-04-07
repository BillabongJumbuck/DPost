<template>
  <div
    v-tippy="{ theme: 'tooltip', delay: [500, 20] }"
    :title="tabState.name"
    class="flex items-center truncate px-2"
    @dblclick="emit('open-rename-modal')"
    @click.middle="emit('close-tab')"
  >
    <span
      class="text-tiny font-semibold mr-2 p-1 rounded-sm relative"
      :class="{
        'border border-dashed border-primaryDark grayscale': false,
      }"
      :style="{ color: getMethodLabelColorClassOf(tabState.method) }"
    >
      {{ tabState.method }}
    </span>
    <tippy
      trigger="manual"
      interactive
      theme="popover"
    >
      <span class="truncate">
        {{ tabState.name }}
      </span>
    </tippy>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { Tippy } from 'vue-tippy'
import { getMethodLabelColorClassOf } from "@/utility/helper/labelColoring.ts"
import type { DHttpRequestDoc } from '@/utility/model'

const props = defineProps<{
  tab: DHttpRequestDoc
  isRemovable: boolean
}>()

const tabState = computed(() => {
  return {
    name: props.tab.name,
    method: props.tab.method,
  }
})

const emit = defineEmits<{
  (event: "open-rename-modal"): void
  (event: "close-tab"): void
}>()
</script>
