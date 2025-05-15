<template>
  <div class="group flex divide-x divide-dividerLight border-b border-dividerLight">
    <span class="flex min-w-0 flex-1 transition group-hover:text-secondaryDark">
      <span class="select-all truncate rounded-sm py-2 pl-4">
        {{ headerKey }}
      </span>
    </span>
    <span class="flex min-w-0 flex-1 justify-between transition group-hover:text-secondaryDark">
      <span class="select-all truncate rounded-sm py-2 pl-4">
        {{ headerValue }}
      </span>
      <HoppButtonSecondary
        v-tippy="{ theme: 'tooltip' }"
        :title="'复制'"
        :icon="CopyIcon"
        class="hidden !py-0 group-hover:inline-flex"
        @click="copyHeader(headerValue)"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import { HoppButtonSecondary } from '@/components/Hopp'
import { CopyIcon } from 'lucide-vue-next'
import { copyToClipboard } from '@/utility/helper/clipboards.ts'

const props = defineProps<{
  headerKey: string
  headerValue: string
}>()

const copyHeader = (headerValue: string) => {
  copyToClipboard(headerValue)
  // CopyIcon.value = IconCheck
  // toast.success(`${t("state.copied_to_clipboard")}`)
}
</script>

<style scoped></style>
