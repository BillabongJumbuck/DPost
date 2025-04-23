<script lang="ts">
import { defineComponent, ref } from 'vue'
import MainLayout from '@/Layout/MainLayout.vue'
import RestMain from '@/components/Rest/RestMain.vue'
import RestSidebar from '@/components/RestRightSideBar/SidebarIndex.vue'
import type { DHttpRequestDoc } from '@/utility/model'

export default defineComponent({
  name: 'RESTFul',
  components: { RestSidebar, RestMain, MainLayout },
  setup() {
    const currentTab = ref<DHttpRequestDoc | null>(null)
    return { currentTab }
  },
})
</script>

<template>
  <MainLayout layout-id="rest" class="h-full w-full p-0 m-0" :horizontal="false">
    <template #primary>
      <RestMain class="h-full w-full p-0 m-0" v-model:current-tab="currentTab" />
    </template>
    <template #secondary>
      <RestSidebar :current-tab="currentTab" />
    </template>
  </MainLayout>
</template>

<style scoped></style>
