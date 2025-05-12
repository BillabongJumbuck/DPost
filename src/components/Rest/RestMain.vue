<template>
  <HoppWindows
    v-model="selectedTabId"
    @add-tab="openNewTab"
    @remove-tab="removeTab"
    @sort="sortTabs"
    :styles="''"
    :render-inactive-tabs="false"
    :can-add-new-tab="true"
    :new-text="null"
    :close-text="null"       >
    <HoppWindow
      :selected="true"
      :close-visibility="'hover'"
      v-for="tab in tabs"
      :id="tab.id"
      :key="'tab_' + tab.id"
      :label="tab.name"
      :is-removable="tabs.length > 1"
      :info="null"
    >
      <template #tabhead>
        <HttpTabHead :tab="tab" :is-removable="tabs.length > 1" @close-tab="removeTab(tab.id)"
                     @open-rename-modal="openReqRenameModal(tab.id)"/>
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
  <TabRename
    v-model="reqName"
    :request-context="requestToRename"
    :show="showRenamingReqNameModal"
    @submit="renameReqName"
    @hide-modal="showRenamingReqNameModal = false"
  />
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
import TabRename from '@/components/Rest/TabRename.vue'

type tabType = DHttpRequestDoc
const tabs = ref<tabType[]>(ReqDocs)
const selectedTabId = ref(tabs.value[0].id)

const showRenamingReqNameModal = ref(false) // 控制模态框显示
const tabIdToRename = ref<string | null>(null) // 存储当前正在重命名的 tab 的 ID
const reqName = ref('') // 绑定到 TabRename 模态框输入框的值

const emit = defineEmits<{
  'update:current-tab': [tab: tabType]
}>()

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
  { deep: true, immediate: true },
)

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

// *** 完成 requestToRename computed 属性 ***
const requestToRename = computed(() => {
  // 返回 tabIdToRename 对应的 tab 对象
  return tabs.value.find(tab => tab.id === tabIdToRename.value) || null; // 返回找到的对象或 null
})

// *** 完成 openReqRenameModal 函数 ***
const openReqRenameModal = (tabID: string) => {
  // 存储要重命名的 tab 的 ID
  tabIdToRename.value = tabID;

  // 找到对应的 tab 对象，并将其当前名称赋值给 reqName
  const tabToRename = tabs.value.find(tab => tab.id === tabID);
  if (tabToRename) {
    reqName.value = tabToRename.name;
  } else {
    // 如果没找到，给个默认空值，并记录错误
    reqName.value = '';
    console.error('尝试打开重命名模态框的标签页不存在:', tabID);
  }

  // 显示模态框
  showRenamingReqNameModal.value = true;
}

// *** 完成 renameReqName 函数 ***
const renameReqName = (newName: string) => {
  // 使用 tabIdToRename 找到需要重命名的 tab 对象
  const tabToRename = tabs.value.find(tab => tab.id === tabIdToRename.value);

  // 简单的验证，TabRename 组件内部也做了，这里可以双重保障
  if (!newName.trim()) {
    console.warn('标签页名称不能为空');
    // 这里不关闭模态框，让用户继续编辑
    return;
  }


  if (tabToRename) {
    // 更新 tab 的 name 属性
    tabToRename.name = newName.trim();
    tabToRename.isDirty = true; // 名称改变也标记为 dirty
    console.log(`标签页 ${tabToRename.id} 已重命名为 "${tabToRename.name}"`);
  } else {
    console.error('尝试保存重命名的标签页不存在:', tabIdToRename.value);
  }

  // 隐藏模态框并重置状态 (TabRename 也 emit hide-modal，这里监听也可以)
  showRenamingReqNameModal.value = false;
  tabIdToRename.value = null; // 重置 ID
  reqName.value = ''; // 清空输入框，虽然 hideModal 也做了，但这里显式清空更清晰
}
</script>

<style scoped></style>
