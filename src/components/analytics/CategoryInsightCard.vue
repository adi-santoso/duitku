<template>
  <div class="space-y-4">
    <!-- Header Hero Card -->
    <div class="p-5 rounded-2xl bg-canvas/80 dark:bg-ink-800/80 border border-ink-900/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
          :style="{ backgroundColor: (insight.categoryColor || '#70a214') + '25' }"
        >
          {{ insight.categoryIcon }}
        </div>
        <div>
          <h3 class="font-display text-lg font-extrabold text-ink-900 dark:text-white">{{ insight.categoryName }}</h3>
          <p class="text-xs font-medium text-ink-500 dark:text-slate-400">{{ insight.currentMonth.transactionCount }} transaksi bulan ini</p>
        </div>
      </div>
      <div class="text-left sm:text-right">
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Total Terpakai</p>
        <p class="font-display text-2xl font-extrabold text-ink-900 dark:text-white">{{ formatCurrency(insight.currentMonth.amount) }}</p>
      </div>
    </div>

    <!-- Anomaly Alert Pill -->
    <div v-if="insight.anomaly.detected" class="p-4 rounded-2xl flex items-center gap-3 text-xs font-bold" :class="insight.anomaly.direction === 'spike' ? 'bg-coral/15 border border-coral/20 text-coral' : 'bg-lime/20 border border-lime/30 text-ink-900 dark:text-lime'">
      <span class="text-lg">{{ insight.anomaly.direction === 'spike' ? '⬆️' : '⬇️' }}</span>
      <p>
        Anomali Terdeteksi: Pengeluaran <strong class="font-extrabold">{{ insight.anomaly.direction === 'spike' ? 'Naik' : 'Turun' }} {{ Math.abs(insight.anomaly.percentageFromMean).toFixed(0) }}%</strong> dari rata-rata biasanya.
      </p>
    </div>

    <!-- Month Comparisons Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="p-4 rounded-2xl bg-canvas/60 dark:bg-ink-800/60 border border-ink-900/5 dark:border-white/5 space-y-1">
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">vs Bulan Lalu</p>
        <p class="font-display text-base font-extrabold" :class="insight.comparison.prevMonth.change > 0 ? 'text-coral' : 'text-[#70a214] dark:text-lime'">
          {{ formatChange(insight.comparison.prevMonth.change) }}
        </p>
      </div>
      <div class="p-4 rounded-2xl bg-canvas/60 dark:bg-ink-800/60 border border-ink-900/5 dark:border-white/5 space-y-1">
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">vs Rata-rata 3 Bulan</p>
        <p class="font-display text-base font-extrabold" :class="insight.comparison.threeMonthAvg.change > 0 ? 'text-coral' : 'text-[#70a214] dark:text-lime'">
          {{ formatChange(insight.comparison.threeMonthAvg.change) }}
        </p>
      </div>
    </div>

    <!-- Pola Pengeluaran & Peak Day -->
    <div v-if="insight.patterns.peakDay" class="p-4 rounded-2xl bg-canvas/60 dark:bg-ink-800/60 border border-ink-900/5 dark:border-white/5 flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-lime/25 text-ink-900 dark:text-lime flex items-center justify-center text-lg flex-shrink-0">
        📅
      </div>
      <div>
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Hari Puncak Belanja</p>
        <p class="font-display text-xs font-extrabold text-ink-900 dark:text-white mt-0.5">
          {{ insight.patterns.peakDay }} • Rata-rata {{ formatCurrency(insight.patterns.peakDayAvg) }}
        </p>
      </div>
    </div>

    <!-- Top Merchants List -->
    <div v-if="insight.patterns.topMerchants.length > 0" class="space-y-2 pt-1">
      <h4 class="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-slate-400">🏆 Top Tempat Transaksi (Merchants)</h4>
      <div class="space-y-2">
        <div
          v-for="(merchant, index) in insight.patterns.topMerchants.slice(0, 3)"
          :key="index"
          class="flex items-center gap-3 p-3 rounded-2xl bg-canvas/60 dark:bg-ink-800/60 border border-ink-900/5 dark:border-white/5"
        >
          <span class="w-6 h-6 rounded-xl bg-lime/25 text-ink-900 dark:text-lime font-display text-xs font-extrabold flex items-center justify-center flex-shrink-0">
            #{{ index + 1 }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-extrabold text-ink-900 dark:text-white truncate">{{ merchant.name }}</p>
            <p class="text-[10px] font-bold text-ink-400 dark:text-slate-400">{{ merchant.count }}x transaksi</p>
          </div>
          <span class="font-display text-xs font-extrabold text-ink-900 dark:text-white flex-shrink-0">{{ formatCurrency(merchant.total) }}</span>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div v-if="insight.recommendations.length > 0" class="space-y-2 pt-2 border-t border-ink-900/5 dark:border-white/5">
      <h4 class="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-slate-400">💡 Rekomendasi Finansial</h4>
      <div
        v-for="(rec, index) in insight.recommendations"
        :key="index"
        class="p-4 rounded-2xl bg-lime/15 border border-lime/20 space-y-1 text-xs text-ink-900 dark:text-white"
      >
        <p class="font-extrabold text-ink-900 dark:text-lime">{{ rec.action }}</p>
        <p class="text-[11px] font-medium text-ink-500 dark:text-slate-300">{{ rec.impact }}</p>
        <ul v-if="rec.tips && rec.tips.length > 0" class="list-disc list-inside space-y-0.5 text-[11px] font-medium text-ink-500 dark:text-slate-400 pt-1">
          <li v-for="(tip, tipIndex) in rec.tips" :key="tipIndex">{{ tip }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryInsight } from '@/composables/useAnalytics'

interface Props {
  insight: CategoryInsight
}

defineProps<Props>()

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatChange(change: number): string {
  const prefix = change > 0 ? '+' : ''
  return `${prefix}${change.toFixed(1)}%`
}
</script>
