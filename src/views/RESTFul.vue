<template>
  <MainLayout layout-id="rest" class="h-full w-full p-0 m-0" :horizontal="false">
    <template #primary>
      <RestMain ref="restMainRef" class="h-full w-full p-0 m-0" v-model:current-tab="currentTab" />
    </template>
    <template #secondary>
      <RestSidebar :current-tab="currentTab" @create-new-tab="handleCreateNewTab" />
    </template>
  </MainLayout>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import MainLayout from '@/Layout/MainLayout.vue'
import RestMain from '@/components/Rest/RestMain.vue'
import RestSidebar from '@/components/RestRightSideBar/SidebarIndex.vue'
import type { DHttpRequestDoc } from '@/utility/model'
import type { generateApiTest } from '@/utility/helper/testgen'

export default defineComponent({
  name: 'RESTFul',
  components: { RestSidebar, RestMain, MainLayout },
  setup() {
    const currentTab = ref<DHttpRequestDoc | null>(null)
    const restMainRef = ref<InstanceType<typeof RestMain> | null>(null)

    // 监听 currentTab 的变化
    watch(
      currentTab,
      (newVal) => {
        console.log('RESTFul 中的 currentTab 变化:', newVal)
      },
      { deep: true },
    )

    // 处理创建新标签页的事件
    const handleCreateNewTab = (
      tabData: ReturnType<typeof generateApiTest> extends Promise<infer T> ? T : never,
    ) => {
      console.log('RESTFul: 收到 create-new-tab 事件，数据:', tabData)
      if (restMainRef.value) {
        console.log('RESTFul: 调用 RestMain 的 handleCreateNewTab 方法')
        restMainRef.value.handleCreateNewTab(tabData)
        console.log('RESTFul: handleCreateNewTab 方法调用完成')
      } else {
        console.error('RESTFul: restMainRef 为空，无法创建新标签页')
      }
    }

    return {
      currentTab,
      restMainRef,
      handleCreateNewTab,
    }
  },
})
</script>
