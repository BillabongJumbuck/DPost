<template>
  <MainLayout layout-id="rest-primary" :horizontal="true">
    <template #primary>
      <HttpMethodAndUrl
        :key="tab.id"
        :tab="tab"
        @update:method="(method) => $emit('update:method', method)"
        @update:url="(url) => $emit('update:url', url)"
        @request:send="() => $emit('request:send')"
      />
      <RequestOptions
        :key="tab.id"
        :tab="tab"
        @update:params="(params) => $emit('update:params', params)"
        @update:headers="(headers) => $emit('update:headers', headers)"
      />
    </template>
    <template #secondary>
      <HttpReponse :response="tab.response" />
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/Layout/MainLayout.vue'
import type { DHttpKeyValueDoc, DHttpRequestDoc } from '@/utility/model'
import HttpMethodAndUrl from '@/components/Rest/HttpMethodAndUrl.vue'
import RequestOptions from '@/components/Rest/RequestOptions.vue'
import HttpReponse from '@/components/Rest/HttpReponse.vue'

defineProps<{
  tab: DHttpRequestDoc
}>()

defineEmits<{
  (e: 'update:method', method: string): void
  (e: 'update:url', url: string): void
  (e: 'update:params', params: DHttpKeyValueDoc[]): void
  (e: 'update:headers', headers: DHttpKeyValueDoc[]): void
  (e: 'request:send'): void
}>()
</script>

<style scoped></style>
