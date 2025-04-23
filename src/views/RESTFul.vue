<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import MainLayout from '@/Layout/MainLayout.vue'
import RestMain from '@/components/Rest/RestMain.vue'
import RestSidebar from '@/components/RestRightSideBar/SidebarIndex.vue'
import type { DHttpRequestDoc } from '@/utility/model'

export default defineComponent({
  name: 'RESTFul',
  components: { RestSidebar, RestMain, MainLayout },
  setup() {
    const currentTab = ref<DHttpRequestDoc | null>(null)

    // 监听 currentTab 的变化
    watch(
      currentTab,
      (newVal) => {
        console.log('RESTFul 中的 currentTab 变化:', newVal)
      },
      { deep: true },
    )

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
