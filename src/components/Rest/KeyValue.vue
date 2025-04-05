<template>
  <div
    class="flex border-b divide-x draggable-content group divide-dividerLight border-dividerLight"
  >
    <span>
      <HoppButtonSecondary
        v-tippy="{
          theme: 'tooltip',
          delay: [500, 20],
          content: index !== total - 1 ? '拖曳以重新排序' : null,
        }"
        :icon="IconGripVertical"
        class="opacity-0"
        :class="{
          'draggable-handle cursor-grab group-hover:opacity-100':
            index !== total - 1,
        }"
        tabindex="-1"
      />
    </span>
    <Hoppinput
      :class="{ 'opacity-50': !entityActive }"
      :model-value="name"
      :placeholder="'key'"
      :auto-complete-source="keyAutoCompleteSource"
      :auto-complete-env="true"
      @update:model-value="() => { }"
      @change="() => { }"
    />
    <Hoppinput
      :class="{ 'opacity-50': !entityActive }"
      :model-value="value"
      :placeholder="'value'"
      :auto-complete-source="keyAutoCompleteSource"
      :auto-complete-env="true"
      @update:model-value="() => { }"
      @change="() => { }"
    />
    <input
      :value="description"
      :placeholder="'参数描述'"
      class="flex flex-1 px-4 bg-transparent"
      type="text"
      :class="{ 'opacity-50': !entityActive }"
      @update:value="() => { }"
      @input="() => { }"
    />
    <span>
      <HoppButtonSecondary
        v-tippy="{ theme: 'tooltip' }"
        :title="
          isActive
            ? entityActive
              ? '关闭'
              : '开启'
            : '关闭'
        "
        :icon="
          isActive
            ? entityActive
              ? IconCheckCircle
              : IconCircle
            : IconCheckCircle
        "
        color="green"
        @click="() => { entityActive = !entityActive }"
      />
    </span>
    <span>
      <HoppButtonSecondary
        v-tippy="{ theme: 'tooltip' }"
        :title="'移除'"
        :icon="IconTrash"
        color="red"
        @click="deleteEntity(index)"
      />
    </span>
  </div>

</template>

<script setup lang="ts">
import { HoppButtonSecondary, Hoppinput } from '@/components/Hopp'
import { GripVerticalIcon as IconGripVertical } from 'lucide-vue-next'
import { CheckCircleIcon as IconCheckCircle } from 'lucide-vue-next'
import { CircleIcon as IconCircle } from 'lucide-vue-next'
import { TrashIcon as IconTrash } from 'lucide-vue-next'

defineProps<{
  total: number
  index: number
  entityId: number
  isActive: boolean
  entityActive: boolean
  name: string
  value: string
  description: string
  keyAutoCompleteSource?: string[]
}>()

const deleteEntity = (index: number) => {

}
</script>


<style scoped>

</style>
