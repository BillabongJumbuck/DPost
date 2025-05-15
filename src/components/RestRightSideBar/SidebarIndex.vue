<template>
  <HoppTabs
    v-model="selectedNavigationTab"
    styles="sticky overflow-x-auto flex-shrink-0 bg-primary z-10 top-0"
    vertical
    render-inactive-tabs
  >
    <HoppTab :id="'collections'" :icon="IconFolder" :label="'集合'">
      <Collections />
    </HoppTab>
    <HoppTab :id="'share-request'" :icon="IconShare2" :label="'分享'">
      <Share />
    </HoppTab>
    <HoppTab :id="'codegen'" :icon="IconCode" :label="'代码生成'">
      <div
        class="flex items-center overflow-x-auto whitespace-nowrap border-b border-dividerLight px-4 py-2 text-tiny text-secondaryLight"
      >
        <span class="truncate"> 请求 </span>
        <ChevronRight class="mx-2 h-4 w-4"></ChevronRight>
        代码片段
      </div>
      <HttpCodegen
        v-if="selectedNavigationTab === 'codegen'"
        class="px-4 mt-4"
        :request="currentTab"
      />
    </HoppTab>
    <HoppTab id="document" label="文档" :icon="IconFileType2">
      <div
        class="flex items-center overflow-x-auto whitespace-nowrap border-b border-dividerLight px-4 py-2 text-tiny text-secondaryLight"
      >
        <span class="truncate"> 请求 </span>
        <ChevronRight class="mx-2 h-4 w-4"></ChevronRight>
        文档生成
      </div>
      <DocumentGen
        v-if="selectedNavigationTab === 'document'"
        class="px-4 mt-4"
        :request="currentTab"
      >
      </DocumentGen>
    </HoppTab>
    <HoppTab id="magic" label="使用AI" :icon="WandSparklesIcon">
      <AIChat @create-new-tab="handleCreateNewTab" />
    </HoppTab>
  </HoppTabs>
</template>

<script setup lang="ts">
import { HoppTabs, HoppTab } from '@/components/Hopp'
import { ChevronRight } from 'lucide-vue-next'
import { FolderIcon as IconFolder } from 'lucide-vue-next'
import { Share2Icon as IconShare2 } from 'lucide-vue-next'
import { CodeIcon as IconCode } from 'lucide-vue-next'
import { FileType2 as IconFileType2 } from 'lucide-vue-next'
import { WandSparklesIcon } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import HttpCodegen from './Codegen.vue'
import type { DHttpRequestDoc } from '@/utility/model'
import Collections from './Collections.vue'
import DocumentGen from '@/components/RestRightSideBar/DocumentGen.vue'
import AIChat from '@/components/RestRightSideBar/AIChat.vue'
import { generateApiTest } from '@/utility/helper/testgen'

type RequestOptionTabs = 'collections' | 'share-request' | 'codegen' | 'document'

const props = defineProps<{
  currentTab: DHttpRequestDoc | null
}>()

const selectedNavigationTab = ref<RequestOptionTabs>('collections')

const emit = defineEmits<{
  'create-new-tab': [
    tabData: ReturnType<typeof generateApiTest> extends Promise<infer T> ? T : never,
  ]
}>()

// 监听标签页切换
watch(selectedNavigationTab, (newTab) => {
  if (newTab === 'codegen') {
    console.log('切换到代码生成标签页')
    // 这里不需要做任何操作，因为 Codegen 组件会自动监听 currentTab 的变化
  }
})

// 处理 AIChat 组件的事件
const handleCreateNewTab = (
  tabData: ReturnType<typeof generateApiTest> extends Promise<infer T> ? T : never,
) => {
  console.log('SidebarIndex: 收到 create-new-tab 事件，数据:', tabData)
  emit('create-new-tab', tabData)
  console.log('SidebarIndex: 已转发 create-new-tab 事件')
}
</script>
