<template>
  <HoppTabs
    v-model="selectedOptionTab"
    styles="sticky overflow-x-auto flex-shrink-0 bg-primary top-upperMobilePrimaryStickyFold sm:top-upperPrimaryStickyFold z-10"
    render-inactive-tabs
    activeTabID="params"
  >
    <HoppTab id="params" label="参数" >
      <HttpParams
        :model-value="tab.queryParams"
        @update:params="(params:DHttpKeyValueDoc[]) => $emit('update:params', params)"
      />
    </HoppTab>
    <HoppTab id="bodyParams" label="请求体">请求体</HoppTab>
    <HoppTab id="headers" label="请求头">
      <HttpHeaders></HttpHeaders>
    </HoppTab>
  </HoppTabs>
</template>

<script setup lang="ts">
import { HoppTab, HoppTabs } from '@/components/Hopp'
import { ref } from 'vue'
import HttpHeaders from '@/components/Rest/HttpHeaders.vue'
import type { DHttpKeyValueDoc, DHttpRequestDoc } from '@/utility/model'
import HttpParams from '@/components/Rest/HttpParams.vue'

const selectedOptionTab = ref<'params' | 'bodyParams' | 'headers'>('params')

defineProps<{
  tab: DHttpRequestDoc
}>()

defineEmits<{
  (e: 'update:params', params: DHttpKeyValueDoc[]): void
}>()
</script>

<style scoped>

</style>
