<template>
  <MainLayout layout-id="rest-primary" :horizontal="true">
    <template #primary>
      <HttpRequest :tab="tab"/>
      <div>请求体内容</div>
<!--      <HttpRequestOptions-->
<!--        v-model="tab.document.request"-->
<!--        v-model:option-tab="tab.document.optionTabPreference"-->
<!--        v-model:inherited-properties="tab.document.inheritedProperties"-->
<!--      />-->
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


const props = defineProps<{
  tab: DHttpRequestDoc
}>()
</script>

<style scoped>

</style>
