<template>
  <div class="card animate-pulse">
    <div v-if="variant === 'stat'" class="flex items-center justify-between">
      <div class="space-y-2 flex-1">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
        <div class="h-7 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
      </div>
      <div class="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
    </div>

    <div v-else-if="variant === 'chart'" class="space-y-3">
      <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
      <div class="h-56 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
    </div>

    <div v-else-if="variant === 'list'" class="space-y-3">
      <div v-for="i in items" :key="i" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
        </div>
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'stat', 'chart', 'list'].includes(value)
  },
  items: {
    type: Number,
    default: 3
  }
})
</script>
