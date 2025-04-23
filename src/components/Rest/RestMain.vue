<template>
  <HoppWindows
    v-model="selectedTabId"
    @add-tab="openNewTab"
    @remove-tab="removeTab"
    @sort="sortTabs"
  >
    <HoppWindow
      :selected="true"
      :close-visibility="'hover'"
      v-for="tab in tabs"
      :id="tab.id"
      :key="'tab_' + tab.id"
      :label="tab.name"
      :is-removable="tabs.length > 1"
    >
      <template #tabhead>
        <HttpTabHead :tab="tab" :is-removable="tabs.length > 1" @close-tab="removeTab(tab.id)" />
      </template>
      <template #suffix>
        <span
          v-if="tab.isDirty"
          class="flex w-4 items-center justify-center text-secondary group-hover:hidden"
        >
          <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" class="h-1.5 w-1.5">
            <circle cx="12" cy="12" r="12" fill="currentColor"></circle>
          </svg>
        </span>
      </template>
    </HoppWindow>
    <RequestTab
      :tab="currentTab"
      @update:method="handleMethodUpdate"
      @update:url="handleUrlUpdate"
      @update:params="handleQueryParamsUpdate"
      @update:headers="handleHeadersUpdate"
      @request:send="handleRequestSend"
    />
  </HoppWindows>
</template>

<script setup lang="ts">
import { HoppWindow, HoppWindows } from '@/components/Hopp'
import HttpTabHead from '@/components/Rest/TabHead.vue'
import { computed, reactive, ref, watch } from 'vue'
import { ReqDocs } from '@/test/ReqDocs.ts'
import {
  type DHttpKeyValueDoc,
  DHttpMethodType,
  type DHttpRequestDoc,
  sendHttpRequest,
  toDHttpMethod,
} from '@/utility/model'
import RequestTab from '@/components/Rest/RequestTab.vue'

type tabType = DHttpRequestDoc
const tabs = ref<tabType[]>(ReqDocs)
const selectedTabId = ref(tabs.value[0].id)

// 通过ID找到对应的tab对象
const currentTab = computed(() => {
  const tab = tabs.value.find((t) => t.id === selectedTabId.value)
  if (!tab) throw new Error('当前标签页不存在')
  return reactive(tab)
})

// 添加 watch 来监听 currentTab 的变化
watch(
  currentTab,
  (newVal) => {
    emit('update:current-tab', newVal)
  },
  { deep: true },
)

const emit = defineEmits<{
  'update:current-tab': [tab: tabType]
}>()

watch(selectedTabId, (newVal) => {
  const currentTab = tabs.value.find((tab) => tab.id === newVal)
  console.log('当前选中标签页变化为:', currentTab)
})

const openNewTab = () => {
  const newTab: tabType = {
    id: Date.now().toString(),
    name: '获取用户列表',
    isDirty: false,
    url: 'https://api.example.com/users',
    method: DHttpMethodType.GET,
    body: {
      contentType: null,
      bodyContent: null,
    },
    response: null,
    headers: [],
    queryParams: [],
  }
  tabs.value = [...tabs.value, { ...newTab }]
  selectedTabId.value = newTab.id
}

const removeTab = (tabID: string) => {
  // 过滤要关闭的标签页
  tabs.value = tabs.value.filter((tab) => {
    const isClosingCurrent = tab.id === tabID && tab.id === selectedTabId.value

    if (isClosingCurrent) {
      // 智能选择新选中的标签页（优先前一个，否则后一个）
      const closedIndex = tabs.value.findIndex((t) => t.id === tabID)
      const newSelected = tabs.value[closedIndex - 1] || tabs.value[closedIndex + 1]

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

const handleMethodUpdate = (method: string) => {
  const targetTab = tabs.value.find((tab) => tab.id === selectedTabId.value)!
  targetTab.method = toDHttpMethod(method)
  targetTab.isDirty = true
}

const handleUrlUpdate = (url: string) => {
  const targetTab = tabs.value.find((tab) => tab.id === selectedTabId.value)!
  targetTab.url = url
  targetTab.isDirty = true
}

const handleQueryParamsUpdate = (params: DHttpKeyValueDoc[]) => {
  const targetTab = tabs.value.find((tab) => tab.id === selectedTabId.value)!
  targetTab.queryParams = params
  targetTab.isDirty = true
}

const handleHeadersUpdate = (headers: DHttpKeyValueDoc[]) => {
  const targetTab = tabs.value.find((tab) => tab.id === selectedTabId.value)!
  targetTab.headers = headers
  targetTab.isDirty = true
}

const handleRequestSend = () => {
  currentTab.value.response = {
    type: 'loading',
    req: currentTab.value,
  }
  sendHttpRequest(currentTab.value).then((response) => {
    console.log(response)
    currentTab.value.response = response
  })
}
</script>

<style scoped></style>
