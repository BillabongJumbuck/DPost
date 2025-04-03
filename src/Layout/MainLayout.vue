<template>
  <Splitpanes class="no-splitter h-full w-full">
    <Pane
      size="100"
      min-size="65"
      class="flex flex-col !overflow-auto"
    >
      <Splitpanes class="smart-splitter">
        <Pane
          :size="65"
          class="flex flex-col !overflow-auto"
          min-size="45"
        >
          <slot name="primary" />
        </Pane>
        <Pane
          v-if="hasSecondary"
          :size="35"
          class="flex flex-col !overflow-auto"
          min-size="25"
        >
          <slot name="secondary" />
        </Pane>
      </Splitpanes>
    </Pane>
  </Splitpanes>
</template>

<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes"
import "splitpanes/dist/splitpanes.css"
import { computed, useSlots } from "vue"

const slots = useSlots()
const hasSecondary = computed(() => !!slots.secondary)
</script>
