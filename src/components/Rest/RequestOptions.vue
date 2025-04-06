<template>
  <HoppTabs
    v-model="selectedOptionTab"
    styles="sticky overflow-x-auto flex-shrink-0 bg-primary top-upperMobilePrimaryStickyFold sm:top-upperPrimaryStickyFold z-10"
    render-inactive-tabs
  >
    <HoppTab id="'params'" label="参数">
      <HttpParams></HttpParams>
    </HoppTab>
    <HoppTab id="'bodyParams'" label="请求体">请求体</HoppTab>
    <HoppTab id="'headers'" label="请求头">
      <HttpHeaders></HttpHeaders>
    </HoppTab>
  </HoppTabs>
</template>

<script setup lang="ts">
import { HoppTabs, HoppTab } from '@/components/Hopp'
import { ref } from 'vue'
import HttpParams from '@/components/Rest/HttpParams.vue'
import HttpHeaders from '@/components/Rest/HttpHeaders.vue'
const selectedOptionTab = ref<"params" | "bodyParams" | "headers" >("params")
</script>


<style scoped>

</style>
