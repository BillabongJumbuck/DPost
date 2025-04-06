<template>
  <HoppLink
    :to="to"
    :exact="exact"
    :blank="blank"
    class="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none"
    :class="[
      color && isValidColor(color) ? colorClasses[color]
        : 'text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark',
      { 'pointer-events-none': loading },
      label ? 'rounded px-4 py-2' : 'p-2',
      { 'rounded-full': rounded },
      { 'opacity-75 cursor-not-allowed': disabled },
      { 'flex-row-reverse': reverse },
      { 'px-6 py-4 text-lg': large },
      {
        'border border-divider hover:border-dividerDark focus-visible:border-dividerDark':
          outline,
      },
      {
        'bg-primaryLight hover:bg-primaryDark focus-visible:bg-primaryDark':
          filled,
      },
    ]"
    :disabled="disabled"
    :tabindex="loading ? '-1' : '0'"
    role="button"
  >
    <span
      v-if="!loading"
      class="inline-flex items-center justify-center whitespace-nowrap"
      :class="{ 'flex-row-reverse': reverse }"
    >
      <component
        :is="icon"
        v-if="icon"
        class="svg-icons"
        :class="[
          { '!text-2xl': large },
          label ? (reverse ? 'ml-2' : 'mr-2') : '',
        ]"
      />
      <div class="truncate max-w-[16rem]">
        {{ label }}
      </div>
      <div v-if="shortcut.length" class="<sm:hidden">
        <kbd
          v-for="(key, index) in shortcut"
          :key="`key-${index}`"
          class="shortcut-key !bg-inherit"
        >
          {{ key }}
        </kbd>
      </div>
    </span>
    <HoppSpinner v-else />
  </HoppLink>
</template>

<script setup lang="ts">
import { HoppLink, HoppSpinner } from "./"
import type { Component } from "vue"

interface Props {
  to?: string
  exact?: boolean
  blank?: boolean
  label?: string
  icon?: object | null | Component // It is a component!
  svg?: object | null | Component // It is a component!
  color?: 'red' | 'blue' | 'green'
  disabled?: boolean
  loading?: boolean
  reverse?: boolean
  rounded?: boolean
  large?: boolean
  outline?: boolean
  shortcut?: string[]
  filled?: boolean
}
withDefaults(defineProps<Props>(), {
  to: "",
  exact: true,
  blank: false,
  label: "",
  icon: null,
  svg: null,
  color: undefined,
  disabled: false,
  loading: false,
  reverse: false,
  rounded: false,
  large: false,
  outline: false,
  shortcut: () => [],
  filled: false,
})

const colorClasses = {
  red: 'text-red-500 hover:text-red-600 focus-visible:text-red-600',
  blue: 'text-blue-500 hover:text-blue-600 focus-visible:text-blue-600',
  green: 'text-green-500 hover:text-green-600 focus-visible:text-green-600'
} as const

type ValidColor = keyof typeof colorClasses

const isValidColor = (color: string): color is ValidColor => {
  return color in colorClasses
}
</script>
