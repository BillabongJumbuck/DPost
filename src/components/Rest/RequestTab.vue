<template>
  <MainLayout layout-id="rest-primary" :horizontal="true">
    <template #primary>
      <HttpRequest :tab="tab"/>
      <RequestOptions></RequestOptions>
    </template>
    <template #secondary>
<!--      <HttpResponse v-model:document="tab.document" :is-embed="false" />-->
      <div>响应内容</div>
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/Layout/MainLayout.vue'
import type { DHttpRequestDoc } from '@/utility/model'
import HttpRequest from '@/components/Rest/HttpRequest.vue'
import RequestOptions from '@/components/Rest/RequestOptions.vue'


const props = defineProps<{
  tab: DHttpRequestDoc
}>()
</script>

<style scoped>

</style>
