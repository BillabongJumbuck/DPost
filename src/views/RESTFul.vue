<script lang="ts">
import { defineComponent } from 'vue'
import MainLayout from '@/Layout/MainLayout.vue'

export default defineComponent({
  name: 'RESTFul',
  components: { MainLayout }
})
</script>

<template>
  <MainLayout layout-id="http" class="h-full w-full p-0 m-0">
    <template #primary>
      <div>primary</div>
    </template>
    <template #secondary>
      <div>secondary</div>
    </template>
  </MainLayout>
</template>

<style scoped>
* {
  border: 1px black solid;
}
</style>
