<template>
  <div
    class="sticky top-0 z-20 flex-none flex-shrink-0 bg-primary p-4 sm:flex sm:flex-shrink-0 sm:space-x-2"
  >
    <div class="min-w-[12rem] flex flex-1 whitespace-nowrap rounded border border-divider">
      <div class="relative flex">
        <label for="method">
          <tippy interactive trigger="click" theme="popover" :on-shown="() => {}">
            <HoppSelectWrapper>
              <input
                id="method"
                class="flex w-26 cursor-pointer rounded-l bg-primaryLight px-4 py-2 font-semibold text-secondaryDark transition"
                :value="tab.method"
                :readonly="true"
                :placeholder="'请求方法'"
                @input="onSelectMethod($event)"
              />
            </HoppSelectWrapper>
            <template #content="{ hide }">
              <div class="flex flex-col focus:outline-none" tabindex="0" @keyup.escape="hide()">
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
      <div
        class="flex flex-1 whitespace-nowrap rounded-r border-l border-divider bg-primaryLight transition"
      >
        <el-input v-model="urlInput" class="w-full h-full border-0 color-inherit" />
      </div>
    </div>
    <div class="mt-2 flex sm:mt-0">
      <HoppButtonPrimary
        id="send"
        v-tippy="{ theme: 'tooltip', delay: [500, 20], allowHTML: true }"
        :title="'发送'"
        :label="`${!isTabResponseLoading ? '发送' : '取消'}`"
        class="min-w-[5rem] flex-1"
        @click="!isTabResponseLoading ? newSendRequest() : cancelRequest()"
      />
      <span class="ml-2 flex rounded border border-divider transition">
        <HoppButtonSecondary
          v-tippy="{ theme: 'tooltip', delay: [500, 20], allowHTML: true }"
          :title="'保存'"
          :label="'保存'"
          filled
          :icon="IconSave"
          class="flex-1 rounded rounded-r-none"
          @click="saveRequest()"
        />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Tippy } from 'vue-tippy'
import {
  HoppSelectWrapper,
  HoppItem,
  HoppButtonPrimary,
  HoppButtonSecondary,
} from '@/components/Hopp'
import type { DHttpRequestDoc } from '@/utility/model'
import { getMethodLabelColor } from '@/utility/helper/labelColoring.ts'
import { SaveIcon as IconSave } from 'lucide-vue-next'

const props = defineProps<{ tab: DHttpRequestDoc }>()

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

// 组件定义
const emit = defineEmits<{
  (e: 'update:method', method: string): void
  (e: 'update:url', url: string): void
  (e: 'request:send'):void
}>()

const urlInput = ref(props.tab.url) // 初始化URL值

watch(
  () => props.tab.url,
  (newUrl) => {
    urlInput.value = newUrl
  },
  { immediate: true },
)

// 方法实现
const updateMethod = (method: string) => {
  emit('update:method', method) // 通知父组件更新
}

watch(urlInput, (newUrl) => {
  emit('update:url', newUrl) // URL变更同步
})

const onSelectMethod = (e: Event) => {
  const target = e.target as HTMLInputElement
  updateMethod(target.value)
}

const isTabResponseLoading = ref(false)

const newSendRequest = async () => {
  isTabResponseLoading.value = true
  emit("request:send");
}

const cancelRequest = () => {
  isTabResponseLoading.value = false
}

const saveRequest = () => {}
</script>
