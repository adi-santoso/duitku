<template>
  <div class="card overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white">Skor Kesehatan Keuangan</h3>
      <button
        @click="$emit('refresh')"
        class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
        :class="{ 'animate-spin': loading }"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-700 animate-pulse" />
    </div>

    <template v-else>
      <!-- Score Circle -->
      <div class="flex items-center gap-5 mb-4">
        <div class="relative w-20 h-20 flex-shrink-0">
          <svg class="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="currentColor"
              stroke-width="8"
              class="text-slate-100 dark:text-slate-800"
            />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              :stroke="grade.color"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="`${(score / 100) * 213.6} 213.6`"
              class="transition-all duration-1000"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-lg font-bold text-slate-900 dark:text-white">{{ score }}</span>
            <span class="text-[9px] text-slate-400 dark:text-slate-500">/100</span>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-lg">{{ grade.emoji }}</span>
            <span class="text-sm font-bold" :style="{ color: grade.color }">{{ grade.label }}</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {{ tips[0] }}
          </p>
        </div>
      </div>

      <!-- Breakdown Bars -->
      <div class="space-y-2.5">
        <div v-for="(item, key) in breakdown" :key="key">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-[11px] font-medium text-slate-600 dark:text-slate-400">{{ item.label }}</span>
            <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300">{{ item.score }}/{{ item.max }}</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
            <div
              class="h-1.5 rounded-full transition-all duration-700"
              :style="{
                width: `${item.max > 0 ? (item.score / item.max) * 100 : 0}%`,
                backgroundColor: getBarColor(item.score, item.max)
              }"
            />
          </div>
          <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{{ item.detail }}</p>
        </div>
      </div>

      <!-- More Tips (expandable) -->
      <div v-if="tips.length > 1" class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          @click="showTips = !showTips"
          class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          {{ showTips ? 'Sembunyikan tips' : `Lihat ${tips.length - 1} tips lainnya` }}
        </button>
        <ul v-if="showTips" class="mt-2 space-y-1.5">
          <li
            v-for="(tip, i) in tips.slice(1)"
            :key="i"
            class="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5"
          >
            <span class="text-amber-500 mt-0.5">💡</span>
            <span>{{ tip }}</span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  score: { type: Number, default: 0 },
  breakdown: { type: Object, default: () => ({}) },
  grade: { type: Object, default: () => ({ label: '', color: '#94a3b8', emoji: '' }) },
  tips: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['refresh'])

const showTips = ref(false)

const getBarColor = (score, max) => {
  const pct = max > 0 ? (score / max) * 100 : 0
  if (pct >= 70) return '#10B981'
  if (pct >= 40) return '#F59E0B'
  return '#EF4444'
}
</script>
