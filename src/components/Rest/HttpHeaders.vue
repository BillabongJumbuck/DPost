<template>
  <div class="flex flex-1 flex-col">
    <div
      class="sticky z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-dividerLight bg-primary pl-4"
      :class="['top-upperMobileSecondaryStickyFold sm:top-upperSecondaryStickyFold']"
    >
      <label class="truncate font-semibold text-secondaryLight">
        请求头列表
      </label>
      <div class="flex">
        <HoppButtonSecondary
          v-tippy="{ theme: 'tooltip' }"
          :title="'清除全部'"
          :icon="IconTrash2"
          @click="clearContent()"
        />
        <HoppButtonSecondary
          v-tippy="{ theme: 'tooltip' }"
          :title="'新增'"
          :icon="IconPlus"
          @click="addParam"
        />
      </div>
    </div>
    <div>
      <draggable
        v-model="workingHeaders"
        item-key="id"
        animation="250"
        handle=".draggable-handle"
        draggable=".draggable-content"
        ghost-class="cursor-move"
        chosen-class="bg-primaryLight"
        drag-class="cursor-grabbing"
      >
        <template #item="{ element: header, index }">
          <HttpKeyValue
            :total="workingHeaders.length"
            :index="index"
            :entity-id=header.id
            v-model:entity-active="header.active"
            v-model:name="header.key"
            v-model:value="header.value"
            v-model:description="header.description"
            :key-auto-complete-source="commonHeaders"
            @delete="handleDeleteHeader(index)"
            @update:key="val => updateHeaderKey(index, val)"
            @update:value="val => updateHeaderValue(index, val)"
            @update:description="val => updateHeaderDescription(index, val)"
            @update:entityActive="val => updateHeaderActive(index, val)">
          </HttpKeyValue>
        </template>
      </draggable>
      <HoppPlaceholder
        v-if="workingHeaders.length === 0"
        :src="`/images/add_category.svg`"
        :alt="'该请求没有任何请求头'"
        :text="'该请求没有任何请求头'"
      >
        <template #body>
          <HoppButtonSecondary
            :label="'新增'"
            :icon="IconPlus"
            filled
            @click="addParam"
          />
        </template>
      </HoppPlaceholder>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon as IconPlus, Trash2Icon as IconTrash2 } from 'lucide-vue-next'
import { HoppButtonSecondary, HoppPlaceholder } from '@/components/Hopp'
import HttpKeyValue from '@/components/Rest/KeyValue.vue'
import draggable from 'vuedraggable-es'
import { ref, watch } from 'vue'
import type { DHttpKeyValueDoc } from '@/utility/model'
import { commonHeaders } from '@/utility/helper/commonHeaders.ts'

const props = defineProps<{
  modelValue: DHttpKeyValueDoc[]
}>()

const idTicker = ref(0)

type WorkingHeader = DHttpKeyValueDoc;

const workingHeaders = ref<WorkingHeader[]>([
  {
    id: (idTicker.value++).toString(),
    key: '',
    value: '',
    active: true,
    description: ''
  }
])

const addParam = () => {
  workingHeaders.value.push({
    id: (idTicker.value++).toString(),
    key: '',
    value: '',
    active: true,
    description: ''
  })
}

const emit = defineEmits<{
  (e: 'update:headers', headers: DHttpKeyValueDoc[]): void
}>()

const clearContent = () => {
  workingHeaders.value = []
  emit('update:headers', [])
}

watch(() => props.modelValue, (newVal) => {
  // 父组件同步
  const existingIds = new Set(workingHeaders.value.map(p => p.id))

  workingHeaders.value = [
    ...workingHeaders.value.filter(p => newVal.some(np => np.key === p.key)),
    ...newVal.filter(np => !existingIds.has(np.id))
  ]
}, { deep: true, immediate: true })

const updateHeaderKey = (index: number, value: string) => {
  if (index >= 0 && index < workingHeaders.value.length) {
    workingHeaders.value[index].key = value
  }
  emit("update:headers", workingHeaders.value)
}

const updateHeaderValue = (index: number, value: string) => {
  if (index >= 0 && index < workingHeaders.value.length) {
    workingHeaders.value[index].value = value
  }
  emit("update:headers", workingHeaders.value)
}

const updateHeaderDescription = (index: number, value: string) => {
  if (index >= 0 && index < workingHeaders.value.length) {
    workingHeaders.value[index].description = value
  }
  emit("update:headers", workingHeaders.value)
}

const updateHeaderActive = (index: number, value: boolean) => {
  if (index >= 0 && index < workingHeaders.value.length) {
    workingHeaders.value[index].active = value
  }
  emit("update:headers", workingHeaders.value)
}

const handleDeleteHeader= (index: number) => {
  if (index >= 0 && index < workingHeaders.value.length) {
    workingHeaders.value.splice(index, 1)
  }
  emit("update:headers", workingHeaders.value)
}

</script>

<style scoped>

</style>
