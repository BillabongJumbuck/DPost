<template>
  <HoppTabs
    v-if="response"
    v-model="selectedLensTab"
    styles="sticky overflow-x-auto flex-shrink-0 z-10 bg-primary top-lowerPrimaryStickyFold"
  >
    <HoppTab
      v-for="(lens, index) in validLenses"
      :id="lens.renderer"
      :key="`lens-${index}`"
      :label="lens.lensName"
      class="flex h-full w-full flex-1 flex-col"
    >
      <component
        :is="lensRendererFor(lens.renderer)"
        :response="response"
        :is-editable="isEditable"
      />
    </HoppTab>
        <HoppTab
          v-if="maybeHeaders"
          id="headers"
          :label="'响应头'"
          :info="`${maybeHeaders.length}`"
          class="flex flex-1 flex-col"
        >
          <LensesHeadersRenderer v-model="maybeHeaders" :is-editable="false" />
        </HoppTab>
  </HoppTabs>
</template>

<script setup lang="ts">
import { HoppTabs, HoppTab } from '@/components/Hopp'
import type { DHttpResponse } from '@/utility/model'
import { ref, computed, watch } from 'vue'
import { getSuitableLenses, getLensRenderers } from '@/utility/helper/lenses/lenses'

const props = defineProps<{
  response: DHttpResponse | null
  isEditable: boolean
}>()

const validLenses = computed(() => {
  if (!props.response) return []
  return getSuitableLenses(props.response)
})

const allLensRenderers = getLensRenderers()

function lensRendererFor(name: string) {
  return allLensRenderers[name]
}

const selectedLensTab = ref('')

// 监听 validLenses 变化，设置默认选中的 tab
watch(
  validLenses,
  (newLenses) => {
    if (newLenses.length > 0) {
      selectedLensTab.value = newLenses[0].renderer
    }
  },
  { immediate: true },
)

const maybeHeaders = computed(() => {
  if (!props.response || !(props.response.type === "success" || props.response.type === "failure"))
    return null
  return props.response.headers
})
</script>

<style scoped></style>
