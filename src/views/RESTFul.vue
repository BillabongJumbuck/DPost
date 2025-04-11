<script lang="ts">
import { defineComponent } from 'vue'
import MainLayout from '@/Layout/MainLayout.vue'
import RestMain from '@/components/Rest/RestMain.vue'

export default defineComponent({
  name: 'RESTFul',
  components: { RestMain, MainLayout },
})
</script>

<template>
  <MainLayout layout-id="rest" class="h-full w-full p-0 m-0" :horizontal="false">
    <template #primary>
      <RestMain class="h-full w-full p-0 m-0" />
    </template>
    <template #secondary>
      <div>secondary</div>
    </template>
  </MainLayout>
</template>

<style scoped></style>
