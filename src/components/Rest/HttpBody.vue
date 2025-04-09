<template>
  <div class="flex flex-1 flex-col">
    <div
      class="sticky top-upperMobileSecondaryStickyFold z-10 flex flex-shrink-0 items-center justify-between overflow-x-visible border-b border-dividerLight bg-primary pl-4 sm:top-upperSecondaryStickyFold"
    >
      <span class="flex items-center">
        <label class="truncate font-semibold text-secondaryLight">
          内容类型
        </label>
        <tippy
          interactive
          trigger="click"
          theme="popover"
          :offset="[40, 0]"
        >
          <HoppSelectWrapper>
            <HoppButtonSecondary
              :label="body.contentType || '无'"
              class="ml-2 rounded-none pr-8"
            />
          </HoppSelectWrapper>
          <template #content="{ hide }">
            <div
              class="flex flex-col space-y-2 divide-y divide-dividerLight focus:outline-none"
              tabindex="0"
              @keyup.escape="hide()"
            >
              <HoppItem
                :label="'无'"
                :info-icon="(body.contentType === null ? IconDone : null) as any"
                :active-info-icon="body.contentType === null"
                @click="
                  () => {
                    body.contentType = null
                    body.bodyContent = null
                    hide()
                  }
                "
              />
              <div
                v-for="(
                  contentTypeItems, contentTypeItemsIndex
                ) in segmentedContentTypes"
                :key="`contentTypeItems-${contentTypeItemsIndex}`"
                class="flex flex-col text-left"
              >
                <div class="flex rounded px-4 py-2">
                  <span class="text-tiny font-bold text-secondaryLight">
                    {{ contentTypeItems.title }}
                  </span>
                </div>
                <div class="flex flex-col">
                  <HoppItem
                    v-for="(
                      contentTypeItem, contentTypeIndex
                    ) in contentTypeItems.contentTypes"
                    :key="`contentTypeItem-${contentTypeIndex}`"
                    :label="contentTypeItem"
                    :info-icon="
                      contentTypeItem === body.contentType
                        ? IconDone
                        : undefined
                    "
                    :active-info-icon="contentTypeItem === body.contentType"
                    @click="
                      () => {
                        body.contentType = contentTypeItem
                        hide()
                      }
                    "
                  />
                </div>
              </div>
            </div>
          </template>
        </tippy>
      </span>
    </div>
    <HttpRawBody v-if="body.contentType !== null" :model-value="body"/>
    <HoppPlaceholder
      v-if="body.contentType == null"
      :src="'/images/upload_single_file.svg'"
      :alt="`该请求没有任何请求体`"
      :text="'该请求没有任何请求体'"
    >
      <template #body>
      </template>
    </HoppPlaceholder>
  </div>
</template>

<script setup lang="ts">
import { Tippy } from 'vue-tippy'
import {
  HoppButtonSecondary,
  HoppItem,
  HoppPlaceholder,
  HoppSelectWrapper
} from '@/components/Hopp'
import { CheckIcon as IconDone } from 'lucide-vue-next'
import { segmentedContentTypes } from '@/utility/helper/contenttypes.ts'
import HttpRawBody from '@/components/Rest/HttpRawBody.vue'
import type { DHttpBody } from '@/utility/model'
import { useVModel } from "@vueuse/core"

const props = defineProps<{
  body:DHttpBody
}>()

const emit = defineEmits<{
  (e: "update:body", value: DHttpBody): void
}>()

const body = useVModel(props, "body", emit)

</script>

<style scoped>
</style>
