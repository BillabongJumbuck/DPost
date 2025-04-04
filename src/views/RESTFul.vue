<script lang="ts">
import { defineComponent } from 'vue'
import MainLayout from '@/Layout/MainLayout.vue'
import RestRequest from '@/components/Rest/RestRequest.vue'

export default defineComponent({
  name: 'RESTFul',
  components: { RestRequest, MainLayout }
})
</script>

<template>
  <MainLayout layout-id="rest" class="h-full w-full p-0 m-0" :horizontal="false">
    <template #primary>
      <MainLayout layout-id="rest-test" class="h-full w-full p-0 m-0" :horizontal="true">
        <template #primary>
          <RestRequest/>
        </template>
        <template #secondary>
          <div>Result</div>
        </template>
      </MainLayout>
    </template>
    <template #secondary>
      <div>secondary</div>
    </template>
  </MainLayout>
</template>

<style scoped>

</style>
