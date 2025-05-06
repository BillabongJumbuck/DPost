<template>
  <div>
    <div
      class="sticky top-lowerSecondaryStickyFold z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-dividerLight bg-primary pl-4"
    >
      <label class="truncate font-semibold text-secondaryLight">
        响应头
      </label>
      <div class="flex">
        <HoppButtonSecondary
          v-tippy="{ theme: 'tooltip' }"
          :title="'复制'"
          :icon="CopyIcon"
          @click="copyHeaders"
        />
      </div>
    </div>
    <ResponseHeadersEntry
      v-for="(header, index) in headers"
      :key="index"
      :header-key="header.key"
      :header-value="header.value"
    />
  </div>
</template>

<script setup lang="ts">
import { HoppButtonSecondary } from '@/components/Hopp'
import type { DHttpKeyValueDoc } from '@/utility/model'
import { CopyIcon } from 'lucide-vue-next'
import ResponseHeadersEntry from '@/components/Rest/ResponseHeadersEntry.vue'

const props = defineProps<{
  headers: DHttpKeyValueDoc[]
  isEditable: boolean
}>()

const copyHeaders = () => { }
</script>


<style scoped>

</style>
