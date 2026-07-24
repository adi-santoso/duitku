<template>
  <div class="p-5 sm:p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft hover:-translate-y-1 hover:shadow-float transition-all duration-300 flex flex-col sm:flex-row items-center gap-5">
    <!-- SVG Ring Progress -->
    <div class="relative flex-shrink-0 w-28 h-28">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <!-- Track circle -->
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          class="stroke-canvas dark:stroke-ink-800"
          stroke-width="10"
        />
        <!-- Progress circle -->
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          :stroke="strokeColor"
          stroke-width="10"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
          class="transition-all duration-700 ease-out"
        />
      </svg>

      <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span class="text-xl leading-none mb-0.5">{{ alert.categoryIcon }}</span>
        <span class="font-display text-xs font-extrabold text-ink-900 dark:text-white tabular-nums">{{ alert.percentage }}%</span>
      </div>
    </div>

    <!-- Details -->
    <div class="flex-1 min-w-0 text-center sm:text-left space-y-2.5 w-full">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 class="font-display text-sm font-extrabold text-ink-900 dark:text-white truncate">{{ alert.categoryName }}</h3>
        <!-- Tier Badge -->
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mx-auto sm:mx-0" :class="badgeClass">
          <span>{{ alert.tierIcon }}</span>
          <span>{{ alert.tierMessage }}</span>
        </span>
      </div>

      <div>
        <p class="font-display text-lg font-extrabold text-ink-900 dark:text-white">
          {{ formatCurrency(alert.spent) }}
        </p>
        <p class="text-[11px] font-bold text-ink-400 dark:text-slate-400">
          dari total {{ formatCurrency(alert.budgetAmount) }}
        </p>
      </div>

      <!-- Sisa Per Hari / Over Budget Chip -->
      <div v-if="alert.remaining > 0" class="pt-2 border-t border-ink-900/5 dark:border-white/5 flex items-center justify-between text-xs">
        <span class="text-ink-400 dark:text-slate-400 font-bold">Sisa per hari ({{ alert.daysLeft }}hr)</span>
        <span class="font-display font-extrabold text-[#70a214] dark:text-lime">{{ formatCurrency(alert.dailyAllowance) }}</span>
      </div>
      <div v-else class="pt-2 border-t border-ink-900/5 dark:border-white/5 flex items-center justify-between text-xs">
        <span class="text-coral font-bold">Melebihi Anggaran</span>
        <span class="font-display font-extrabold text-coral">+ {{ formatCurrency(Math.abs(alert.remaining)) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BudgetAlert } from '@/composables/useAnalytics'

interface Props {
  alert: BudgetAlert
}

const props = defineProps<Props>()

const circumference = computed(() => 2 * Math.PI * 52)
const progressOffset = computed(() => {
  const progress = Math.min(props.alert.ratio, 1.25)
  return circumference.value - (progress * circumference.value)
})

const strokeColor = computed(() => {
  if (props.alert.ratio > 1) return '#ff8068' // Coral
  if (props.alert.ratio > 0.8) return '#f59e0b' // Warning Yellow
  return '#70a214' // Lime Green
})

const badgeClass = computed(() => {
  if (props.alert.ratio > 1) return 'bg-coral/20 text-coral'
  if (props.alert.ratio > 0.8) return 'bg-amber-400/20 text-amber-600 dark:text-amber-400'
  return 'bg-lime/20 text-ink-900 dark:text-lime'
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>
