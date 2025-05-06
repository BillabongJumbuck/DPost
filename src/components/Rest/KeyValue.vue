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
          'draggable-handle cursor-grab group-hover:opacity-100': index !== total - 1,
        }"
        tabindex="-1"
      />
    </span>
    <span v-if="keyAutoCompleteSource?.length">
      <el-autocomplete
        :class="{ 'opacity-50': !entityActive }"
        v-model="currentName"
        :placeholder="'key'"
        :fetch-suggestions="handleAutocompleteQuery"
        clearable
        value-key="value"
        @select="handleAutocompleteSelect"
        class="flex-1"
      />
    </span>
    <span v-else>
      <el-input
        :id="props.index.toString()"
        :input-styles="''"
        :type="'text'"
        :label="''"
        :autofocus="false"
        :styles="{ 'opacity-50': !entityActive }" v-model="currentName"
        :placeholder="'key'"
        class="flex-1 bg-transparent"
        @input="handleRegularInput"
      />
    </span>
    <Hoppinput
      :id="valueInputId"
      :styles="computedValueStyles" :input-styles="''"
      :type="'text'"
      :label="''"
      :autofocus="false"
      :model-value="value"
      :disabled="false"
      :placeholder="'value'"
      @update:model-value="(val) => emit('update:value', val)"
    />
    <input
      :value="description"
      placeholder="Description"
      class="flex flex-1 px-4 bg-transparent"
      type="text"
      :class="{ 'opacity-50': !entityActive }"
      @input="(e) => emit('update:description', (e.target as HTMLInputElement).value)"
    />
    <span>
      <HoppButtonSecondary
        v-tippy="{ theme: 'tooltip' }"
        :title="isActive ? '关闭' : '开启'"
        :icon="isActive ? IconCheckCircle : IconCircle"
        color="green"
        @click="
          () => {
            isActive = !isActive
            emit('update:entityActive', isActive)
          }
        "
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
import { ref, computed } from 'vue'
import { HoppButtonSecondary, Hoppinput } from '@/components/Hopp'
import { GripVerticalIcon as IconGripVertical } from 'lucide-vue-next'
import { CheckCircleIcon as IconCheckCircle } from 'lucide-vue-next'
import { CircleIcon as IconCircle } from 'lucide-vue-next'
import { TrashIcon as IconTrash } from 'lucide-vue-next'

const props = defineProps<{
  total: number
  index: number
  name: string
  value: string
  description: string
  entityActive: boolean
  keyAutoCompleteSource?: string[]
}>()

const emit = defineEmits<{
  (e: 'delete', index: number): void
  (e: 'update:key', val: string): void
  (e: 'update:value', val: string): void
  (e: 'update:description', val: string): void
  (e: 'update:entityActive', val: boolean): void
}>()

const deleteEntity = (index: number) => {
  emit('delete', index)
}

const isActive = ref(props.entityActive)

// --- 计算 Hoppinput value 的样式字符串 ---
const computedValueStyles = computed(() => {
  // 可以添加其他静态 class，然后根据条件添加动态 class
  const classes = [];
  if (!props.entityActive) {
    classes.push('opacity-50');
  }
  // 将 class 数组转换为字符串
  return classes.join(' ');
});
// ---------------------------------------

const valueInputId = computed(() => `keyvalue-value-input-${props.index}`);

// 处理自动补全
interface SuggestionItem {
  value: string
}

const currentName = computed({
  get: () => props.name,
  set: (val) => emit('update:key', val),
})

// 自动补全处理函数
const handleAutocompleteQuery = (
  queryString: string,
  cb: (suggestions: SuggestionItem[]) => void,
) => {
  if (!props.keyAutoCompleteSource?.length) {
    return cb([])
  }
  const suggestions = props.keyAutoCompleteSource
    .filter((item) => item.toLowerCase().includes(queryString.toLowerCase()))
    .map((item) => ({ value: item }))
  cb(suggestions)
}
// 选中建议项时的处理
const handleAutocompleteSelect = (item: SuggestionItem) => {
  emit('update:key', item.value)
}
// 普通输入处理（非自动补全模式）
const handleRegularInput = (val: string) => {
  emit('update:key', val)
}
</script>

<style scoped></style>
