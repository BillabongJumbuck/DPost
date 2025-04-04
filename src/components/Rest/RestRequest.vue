<template>
  <HoppWindows
    v-model="selectedWindow"
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
  </HoppWindows>
</template>

<script setup lang="ts">
import { HoppWindow, HoppWindows } from '../Hopp'
import HttpTabHead from '@/components/Rest/TabHead.vue'
import { ref } from 'vue'
import { ReqDocs } from '@/test/ReqDocs.ts'
import { DHttpRequest, type DHttpRequestDoc } from '@/utility/model'

const selectedWindow = ref('window1')

type tabType = DHttpRequestDoc;
const tabs = ref<tabType[]>( ReqDocs );


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
  selectedWindow.value = newTab.id
}

const removeTab = (tabID: string) => {
  tabs.value = tabs.value.filter((tab) => tab.id !== tabID)
}

const sortTabs = (e: { oldIndex: number; newIndex: number }) => {
  const newTabs = [...tabs.value]
  newTabs.splice(e.newIndex, 0, newTabs.splice(e.oldIndex, 1)[0])
  tabs.value = newTabs
}
</script>

<style scoped>

</style>
