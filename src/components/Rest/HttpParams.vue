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
          <HttpKeyValue :total="workingParams.length" :index="index" :entity-id=param.id
                        :entity-active="param.active" :is-active="true" v-model:name="param.key"
                        v-model:value="param.value" v-model:description="param.description">

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
import { ref } from 'vue'

const idTicker = ref(0)

type tempHttpParam = {
  key: string,
  value: string,
  active: boolean,
  description: ''
}

const workingParams = ref<Array<tempHttpParam & { id: number }>>([
  {
    id: idTicker.value++,
    key: '',
    value: '',
    active: true,
    description: ''
  }
])

const addParam = () => {
  workingParams.value.push({
    id: idTicker.value++,
    key: '',
    value: '',
    active: true,
    description: ''
  })
}

const clearContent = () => {
  workingParams.value = []
}

</script>

<style scoped>

</style>
