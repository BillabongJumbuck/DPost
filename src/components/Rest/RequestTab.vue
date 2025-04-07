<template>
  <MainLayout layout-id="rest-primary" :horizontal="true">
    <template #primary>
      <HttpMethodAndUrl
        :key="tab.id"
        :tab="tab"
        @update:method="(method) => $emit('update:method', method)"
        @update:url="(url) => $emit('update:url', url)"
      />
      <RequestOptions
        :key="tab.id"
        :tab="tab"
        @update:params="(params:DHttpKeyValueDoc[]) => $emit('update:params', params)"
      />
    </template>
    <template #secondary>
<!--      <HttpResponse v-model:document="tab.document" :is-embed="false" />-->
      <div>响应内容</div>
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/Layout/MainLayout.vue'
import type { DHttpKeyValueDoc, DHttpRequestDoc } from '@/utility/model'
import HttpMethodAndUrl from '@/components/Rest/HttpMethodAndUrl.vue'
import RequestOptions from '@/components/Rest/RequestOptions.vue'


defineProps<{
  tab: DHttpRequestDoc
}>()

defineEmits<{
  (e: 'update:method', method: string): void
  (e: 'update:url', url: string): void
  (e: 'update:params', params: DHttpKeyValueDoc[]): void
}>()
</script>

<style scoped>

</style>
