<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    :disabled="disabled"
    :class="[
      'transition-all cursor-pointer appearance-none bg-no-repeat',
      sizeClasses,
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 dark:hover:border-slate-700',
      customClass
    ]"
    :style="arrowStyle"
  >
    <slot />
  </select>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, null],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md'].includes(val)
  },
  customClass: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const sizeClasses = computed(() => {
  if (props.size === 'sm') {
    return 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 pr-7 bg-[right_0.5rem_center] bg-[length:1rem]'
  }
  return 'input pr-10 bg-[right_0.75rem_center] bg-[length:1.25rem]'
})

const arrowStyle = computed(() => {
  return {
    backgroundImage: "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%2394a3b8%22><path fill-rule=%22evenodd%22 d=%22M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z%22 clip-rule=%22evenodd%22/></svg>')"
  }
})
</script>
