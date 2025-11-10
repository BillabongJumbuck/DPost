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
  </HoppTabs>
</template>

<script setup lang="ts">
import { HoppTabs, HoppTab } from '@/components/Hopp'
import { FolderIcon as IconFolder } from 'lucide-vue-next'
import { Share2Icon as IconShare2 } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import type { DHttpRequestDoc } from '@/utility/model'
import Collections from './Collections.vue'
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

</script>
