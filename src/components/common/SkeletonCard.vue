<template>
  <div class="card">
    <div v-if="variant === 'stat'" class="flex items-center justify-between">
      <div class="space-y-2 flex-1">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 skeleton-shimmer"></div>
        <div class="h-7 bg-slate-200 dark:bg-slate-700 rounded w-32 skeleton-shimmer"></div>
      </div>
      <div class="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 skeleton-shimmer"></div>
    </div>

    <div v-else-if="variant === 'chart'" class="space-y-3">
      <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 skeleton-shimmer"></div>
      <div class="h-56 bg-slate-100 dark:bg-slate-800 rounded-xl skeleton-shimmer"></div>
    </div>

    <div v-else-if="variant === 'list'" class="space-y-3">
      <div v-for="i in items" :key="i" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0 skeleton-shimmer"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 skeleton-shimmer"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 skeleton-shimmer"></div>
        </div>
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 skeleton-shimmer"></div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full skeleton-shimmer"></div>
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 skeleton-shimmer"></div>
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 skeleton-shimmer"></div>
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

<style scoped>
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer 2s linear infinite;
}

:global(.dark) .skeleton-shimmer::before {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
</style>
