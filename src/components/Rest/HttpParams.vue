<template>
  <div class="flex flex-1 flex-col">
    <div
      class="sticky top-upperMobileSecondaryStickyFold z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-dividerLight bg-primary pl-4 sm:top-upperSecondaryStickyFold"
    >
      <label class="truncate font-semibold text-secondaryLight">
        查询参数
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
        v-model="workingParams"
        item-key="id"
        animation="250"
        handle=".draggable-handle"
        draggable=".draggable-content"
        ghost-class="cursor-move"
        chosen-class="bg-primaryLight"
        drag-class="cursor-grabbing"
      >
        <template #item="{ element: param, index }">
          <HttpKeyValue
            :total="workingParams.length"
            :index="index"
            :entity-id=param.id
            v-model:entity-active="param.active"
            v-model:name="param.key"
            v-model:value="param.value"
            v-model:description="param.description"
            @delete="handleDeleteParam(index)"
            @update:key="val => updateParamKey(index, val)"
            @update:value="val => updateParamValue(index, val)"
            @update:description="val => updateParamDescription(index, val)"
            @update:entityActive="val => updateParamActive(index, 'active', val)">
          </HttpKeyValue>
        </template>
      </draggable>
      <HoppPlaceholder
        v-if="workingParams.length === 0"
        :src="`/images/add_files.svg`"
        :alt="'该请求没有任何参数'"
        :text="'该请求没有任何参数'"
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
import { HoppButtonSecondary, HoppPlaceholder } from '@/components/Hopp'
import draggable from 'vuedraggable-es'
import { PlusIcon as IconPlus, Trash2Icon as IconTrash2 } from 'lucide-vue-next'
import HttpKeyValue from './KeyValue.vue'
import { ref, watch } from 'vue'
import type { DHttpKeyValueDoc } from '@/utility/model'

const props = defineProps<{
  modelValue: DHttpKeyValueDoc[]
}>()

const idTicker = ref(0)

type WorkingParam = DHttpKeyValueDoc;

const workingParams = ref<WorkingParam[]>([
  {
    id: (idTicker.value++).toString(),
    key: '',
    value: '',
    active: true,
    description: ''
  }
])

const addParam = () => {
  workingParams.value.push({
    id: (idTicker.value++).toString(),
    key: '',
    value: '',
    active: true,
    description: ''
  })
}

const clearContent = () => {
  workingParams.value = []
  emit('update:params', [])
}

const emit = defineEmits<{
  (e: 'update:params', params: DHttpKeyValueDoc[]): void
}>()

watch(() => props.modelValue, (newVal) => {
  // 父组件同步
  const existingIds = new Set(workingParams.value.map(p => p.id))

  workingParams.value = [
    ...workingParams.value.filter(p => newVal.some(np => np.key === p.key)),
    ...newVal.filter(np => !existingIds.has(np.id))
  ]
}, { deep: true, immediate: true })


watch(workingParams, (newVal) => {
  // 数据变化时回传父组件（去除临时id）
  emit('update:params', newVal)
}, { deep: true })

const updateParamKey = (index: number, value: string) => {
  if (index >= 0 && index < workingParams.value.length) {
    workingParams.value[index].key = value
  }
}

const updateParamValue = (index: number, value: string) => {
  if (index >= 0 && index < workingParams.value.length) {
    workingParams.value[index].value = value
  }
}

const updateParamDescription = (index: number, value: string) => {
  if (index >= 0 && index < workingParams.value.length) {
    workingParams.value[index].description = value
  }
  emit("update:params", workingParams.value)
}

const updateParamActive = (index: number, value: boolean) => {
  if (index >= 0 && index < workingParams.value.length) {
    workingParams.value[index].active = value
  }
  emit("update:params", workingParams.value)
}

const handleDeleteParam = (index: number) => {
  if (index >= 0 && index < workingParams.value.length) {
    workingParams.value.splice(index, 1)
  }
  emit("update:params", workingParams.value)
}

</script>

<style scoped>

</style>
