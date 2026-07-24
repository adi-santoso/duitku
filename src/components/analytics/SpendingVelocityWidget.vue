<template>
  <div class="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft space-y-5">
    <div class="flex items-center justify-between">
      <h3 class="font-display text-base font-extrabold text-ink-900 dark:text-white flex items-center gap-2">
        <span>🔥</span>
        <span>Kecepatan Pengeluaran (Velocity)</span>
      </h3>
      <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider" :class="badgeClass">
        {{ velocityText }}
      </span>
    </div>

    <!-- Progress Bar -->
    <div class="space-y-1.5">
      <div class="flex justify-between text-xs font-bold text-ink-500 dark:text-slate-400">
        <span>Hari ke-{{ velocity.daysPassed }} dari {{ velocity.daysInMonth }} hari</span>
        <span class="font-display font-extrabold text-ink-900 dark:text-white tabular-nums">{{ progressPercentage.toFixed(0) }}% Bulan Berjalan</span>
      </div>
      <div class="w-full h-3 rounded-full bg-canvas dark:bg-ink-800 overflow-hidden p-0.5">
        <div
          class="h-full rounded-full transition-all duration-700"
          :class="velocity.velocity === 'fast' ? 'bg-coral' : velocity.velocity === 'slow' ? 'bg-lime dark:bg-lime-deep' : 'bg-violet'"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
    </div>

    <!-- Stats Grid Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="p-4 rounded-2xl bg-canvas/70 dark:bg-ink-800/70 border border-ink-900/5 dark:border-white/5 space-y-1">
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Rata-rata / Hari</p>
        <p class="font-display text-sm font-extrabold text-ink-900 dark:text-white truncate">{{ formatCurrency(velocity.dailyRate) }}</p>
      </div>

      <div class="p-4 rounded-2xl bg-canvas/70 dark:bg-ink-800/70 border border-ink-900/5 dark:border-white/5 space-y-1">
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Terpakai ({{ velocity.daysPassed }}hr)</p>
        <p class="font-display text-sm font-extrabold text-ink-900 dark:text-white truncate">{{ formatCurrency(velocity.currentSpent) }}</p>
      </div>

      <div class="p-4 rounded-2xl bg-canvas/70 dark:bg-ink-800/70 border border-ink-900/5 dark:border-white/5 space-y-1">
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Proyeksi Akhir Bulan</p>
        <p class="font-display text-sm font-extrabold text-violet dark:text-lime truncate">{{ formatCurrency(velocity.projectedTotal) }}</p>
      </div>
    </div>

    <!-- Status Message Pill -->
    <div v-if="velocity.isOverpacing" class="p-4 rounded-2xl bg-coral/15 border border-coral/20 flex items-center gap-3 text-xs text-coral font-bold">
      <span class="text-base">⚠️</span>
      <p>
        Pengeluaran <strong class="font-extrabold">{{ Math.abs(velocity.percentageVsHistorical).toFixed(0) }}% lebih cepat</strong> dari biasanya. Sisa {{ velocity.daysLeft }} hari lagi!
      </p>
    </div>

    <div v-else-if="velocity.percentageVsHistorical < -20" class="p-4 rounded-2xl bg-lime/20 border border-lime/30 flex items-center gap-3 text-xs text-ink-900 dark:text-lime font-bold">
      <span class="text-base">✅</span>
      <p>
        Hebat! Pengeluaran <strong class="font-extrabold">{{ Math.abs(velocity.percentageVsHistorical).toFixed(0) }}% lebih hemat</strong> dari ritme biasanya!
      </p>
    </div>

    <div v-else class="p-4 rounded-2xl bg-canvas dark:bg-ink-800 border border-ink-900/5 dark:border-white/5 flex items-center gap-3 text-xs text-ink-500 dark:text-slate-400 font-bold">
      <span class="text-base">📊</span>
      <p>Laju pengeluaran keuangan Anda berjalan stabil dalam batas normal.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SpendingVelocity } from '@/composables/useAnalytics'

interface Props {
  velocity: SpendingVelocity
}

const props = defineProps<Props>()

const velocityText = computed(() => {
  switch (props.velocity.velocity) {
    case 'fast':
      return 'Laju Cepat'
    case 'slow':
      return 'Laju Hemat'
    default:
      return 'Laju Normal'
  }
})

const badgeClass = computed(() => {
  switch (props.velocity.velocity) {
    case 'fast':
      return 'bg-coral/20 text-coral'
    case 'slow':
      return 'bg-lime/20 text-ink-900 dark:text-lime'
    default:
      return 'bg-canvas dark:bg-ink-800 text-ink-500 dark:text-slate-400'
  }
})

const progressPercentage = computed(() => {
  const percentage = (props.velocity.daysPassed / props.velocity.daysInMonth) * 100
  return Math.min(percentage, 100)
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
