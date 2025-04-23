<template>
  <HoppTabs
    v-model="selectedNavigationTab"
    styles="sticky overflow-x-auto flex-shrink-0 bg-primary z-10 top-0"
    vertical
    render-inactive-tabs
  >
    <HoppTab
      :id="'collections'"
      :icon="IconFolder"
      :label="'集合'"
    >
      <Collections />
    </HoppTab>
    <HoppTab
      :id="'share-request'"
      :icon="IconShare2"
      :label="'分享'"
    >
      <Share />
    </HoppTab>
    <HoppTab
      :id="'codegen'"
      :icon="IconCode"
      :label="'代码生成'"
    >
      <div
        class="flex items-center overflow-x-auto whitespace-nowrap border-b border-dividerLight px-4 py-2 text-tiny text-secondaryLight"
      >
        <span class="truncate"> 请求 </span>
        <ChevronRight class="mx-2 h-4 w-4" ></ChevronRight>
        代码片段
      </div>
      <HttpCodegen
        v-if="selectedNavigationTab === 'codegen'"
        class="px-4 mt-4"
      />
    </HoppTab>
  </HoppTabs>
</template>

<script setup lang="ts">
import { HoppTabs, HoppTab} from '@/components/Hopp'
import { ChevronRight } from 'lucide-vue-next'
import { FolderIcon as IconFolder } from 'lucide-vue-next'
import { Share2Icon as IconShare2 } from 'lucide-vue-next'
import { CodeIcon as IconCode } from 'lucide-vue-next'
import { ref } from "vue"
import  HttpCodegen  from './Codegen.vue'


type RequestOptionTabs =
  | "collections"
  | "share-request"
  | "codegen"

const selectedNavigationTab = ref<RequestOptionTabs>("collections")
</script>
