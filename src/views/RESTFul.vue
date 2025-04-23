<script lang="ts">
import { defineComponent } from 'vue'
import MainLayout from '@/Layout/MainLayout.vue'
import RestMain from '@/components/Rest/RestMain.vue'
import RestSidebar from '@/components/RestRightSideBar/SidebarIndex.vue'

export default defineComponent({
  name: 'RESTFul',
  components: { RestSidebar, RestMain, MainLayout },
})
</script>

<template>
  <MainLayout layout-id="rest" class="h-full w-full p-0 m-0" :horizontal="false">
    <template #primary>
      <RestMain class="h-full w-full p-0 m-0" />
    </template>
    <template #secondary>
      <RestSidebar/>
    </template>
  </MainLayout>
</template>

<style scoped></style>
