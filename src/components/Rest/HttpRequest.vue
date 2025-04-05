<template>
  <div
    class="sticky top-0 z-20 flex-none flex-shrink-0 bg-primary p-4 sm:flex sm:flex-shrink-0 sm:space-x-2"
  >
    <div
      class="min-w-[12rem] flex flex-1 whitespace-nowrap rounded border border-divider"
    >
      <div class="relative flex">
        <label for="method">
          <tippy
            interactive
            trigger="click"
            theme="popover"
            :on-shown ="() => {}"
          >
            <HoppSelectWrapper>
              <input
                id="method"
                class="flex w-26 cursor-pointer rounded-l bg-primaryLight px-4 py-2 font-semibold text-secondaryDark transition"
                :value="tab.request.method"
                :readonly="false"
                :placeholder="'请求方法'"
                @input="onSelectMethod($event)"
              />
            </HoppSelectWrapper>
            <template #content="{ hide }">
              <div
                ref="methodTippyActions"
                class="flex flex-col focus:outline-none"
                tabindex="0"
                @keyup.escape="hide()"
              >
                <HoppItem
                  v-for="(method, index) in methods"
                  :key="`method-${index}`"
                  :label="method"
                  :style="{
                    color: getMethodLabelColor(method),
                  }"
                  @click="
                    () => {
                      updateMethod(method)
                      hide()
                    }
                  "
                />
              </div>
            </template>
          </tippy>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { Tippy } from 'vue-tippy'
import { HoppSelectWrapper, HoppItem } from '@/components/Hopp'
import type { DHttpRequestDoc } from '@/utility/model'
import { getMethodLabelColor } from "@/utility/helper/labelColoring.ts"

const props = defineProps<{ tab: DHttpRequestDoc }>()

const methods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "CONNECT",
]

const updateMethod = (method: string) => {
  // tab.value.document.request.method = method
}

const onSelectMethod = (e: Event | any) => {
  // type any because of value property not being recognized by TS in the event.target object. It is a valid property though.
  updateMethod(e.target.value)
}
</script>
