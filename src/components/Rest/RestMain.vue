<template>
  <HoppWindows
    v-model="selectedTabId"
    @add-tab="openNewTab"
    @remove-tab="removeTab"
    @sort="sortTabs"
  >
    <HoppWindow
      v-for="tab in tabs"
      :id="tab.id"
      :key="'tab_' + tab.id"
      :label="tab.name"
      :is-removable="tabs.length > 1"
    >
      <template #tabhead>
        <HttpTabHead
          :tab="tab"
          :is-removable="tabs.length > 1"
          @close-tab="removeTab(tab.id)"
        />
      </template>
      <template #suffix>
        <span
          v-if="tab.isDirty"
          class="flex w-4 items-center justify-center text-secondary group-hover:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            width="1.2em"
            height="1.2em"
            class="h-1.5 w-1.5"
          >
            <circle cx="12" cy="12" r="12" fill="currentColor"></circle>
          </svg>
        </span>
      </template>
    </HoppWindow>
    <RequestTab :tab="currentTab"></RequestTab>
  </HoppWindows>
</template>

<script setup lang="ts">
import { HoppWindow, HoppWindows } from '../Hopp'
import HttpTabHead from '@/components/Rest/TabHead.vue'
import { ref, watch } from 'vue'
import { ReqDocs } from '@/test/ReqDocs.ts'
import { DHttpRequest, type DHttpRequestDoc } from '@/utility/model'
import RequestTab from '@/components/Rest/RequestTab.vue'

type tabType = DHttpRequestDoc;
const tabs = ref<tabType[]>( ReqDocs );
const selectedTabId = ref(tabs.value[0].id)

// 获取当前选中标签页的ID
const currentTabId = selectedTabId.value

// 通过ID找到对应的tab对象
const currentTab : tabType = tabs.value.find(tab => tab.id === currentTabId)!

watch(selectedTabId, (newVal) => {
  const currentTab = tabs.value.find(tab => tab.id === newVal)
  console.log('当前选中标签页变化为:', currentTab)
  // 这里可以触发请求加载等操作
})

const openNewTab = () => {
  const newTab : tabType = {
    id: Date.now().toString(),
    type: "request",
    name: "获取用户列表",
    request: new DHttpRequest({
      url: "https://api.example.com/users",
      queryParams: { page: "1" }
    }),
    isDirty: false
  }
  tabs.value = [...tabs.value, { ...newTab }]
  selectedTabId.value = newTab.id
}

const removeTab = (tabID: string) => {
  // 过滤要关闭的标签页
  tabs.value = tabs.value.filter(tab => {
    const isClosingCurrent = tab.id === tabID && tab.id === selectedTabId.value

    if (isClosingCurrent) {
      // 智能选择新选中的标签页（优先前一个，否则后一个）
      const closedIndex = tabs.value.findIndex(t => t.id === tabID)
      const newSelected =
        tabs.value[closedIndex - 1] ||
        tabs.value[closedIndex + 1]

      selectedTabId.value = newSelected.id
    }

    return tab.id !== tabID
  })
}

const sortTabs = (e: { oldIndex: number; newIndex: number }) => {
  const newTabs = [...tabs.value]
  newTabs.splice(e.newIndex, 0, newTabs.splice(e.oldIndex, 1)[0])
  tabs.value = newTabs
}
</script>

<style scoped>

</style>
