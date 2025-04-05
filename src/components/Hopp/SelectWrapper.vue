<template>
  <div class="select-wrapper">
    <span class="text-xs down-icon">
      <IconChevronDown />
    </span>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon as IconChevronDown } from 'lucide-vue-next'
</script>

<style scoped lang="scss">
.select-wrapper {
  @apply flex flex-1;
  @apply relative;
}

.down-icon {
  @apply absolute;
  @apply flex;
  @apply inset-y-0;
  @apply items-center;
  @apply justify-center;
  @apply pointer-events-none;
  @apply text-current;
  @apply right-3;
}
</style>
