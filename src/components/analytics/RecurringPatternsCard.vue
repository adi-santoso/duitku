<template>
  <div class="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="font-display text-base font-extrabold text-ink-900 dark:text-white flex items-center gap-2">
          <span>🔄</span>
          <span>Pola Transaksi Berulang (Recurring Patterns)</span>
        </h3>
        <p class="text-xs font-medium text-ink-500 dark:text-slate-400">Deteksi otomatis transaksi rutin bulanan/mingguan</p>
      </div>

      <!-- Summary Pill Box -->
      <div class="flex items-center gap-3">
        <div class="px-3 py-1.5 rounded-2xl bg-canvas dark:bg-ink-800 border border-ink-900/5 text-xs">
          <span class="text-ink-400 dark:text-slate-400 font-bold">Total Pola: </span>
          <span class="font-extrabold text-ink-900 dark:text-white">{{ data.summary.totalPatterns }}</span>
        </div>
        <div class="px-3 py-1.5 rounded-2xl bg-lime/20 border border-lime/30 text-xs">
          <span class="text-ink-500 dark:text-slate-300 font-bold">Potensi Hemat: </span>
          <span class="font-display font-extrabold text-[#70a214] dark:text-lime">Rp {{ formatCurrency(data.summary.potentialSavings) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="data.patterns.length === 0" class="text-center py-10 bg-canvas/50 dark:bg-ink-800/50 rounded-2xl border border-ink-900/5 text-ink-400 dark:text-slate-500 space-y-1">
      <p class="text-xs font-bold">Tidak ditemukan pola transaksi berulang</p>
      <p class="text-[11px]">Dibutuhkan minimal 3 transaksi serupa dalam 6 bulan terakhir</p>
    </div>

    <!-- Pattern List -->
    <div v-else class="space-y-3">
      <div
        v-for="(pattern, index) in displayedPatterns"
        :key="index"
        class="p-4 sm:p-5 rounded-2xl bg-canvas/60 dark:bg-ink-800/60 hover:bg-canvas dark:hover:bg-ink-800 border border-ink-900/5 dark:border-white/5 transition-all space-y-3"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl p-2 rounded-2xl bg-surface dark:bg-ink-900 shadow-sm flex-shrink-0">{{ pattern.categoryIcon }}</span>
            <div class="min-w-0">
              <h4 class="font-display text-sm font-extrabold text-ink-900 dark:text-white truncate">{{ pattern.categoryName }}</h4>
              <p class="text-[11px] font-medium text-ink-500 dark:text-slate-400 truncate" v-if="pattern.description">{{ pattern.description }}</p>
              <div class="flex items-center gap-2 pt-1">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-violet/15 text-violet dark:text-lime">
                  {{ getFrequencyLabel(pattern.frequency) }}
                </span>
                <span class="text-[11px] font-bold text-ink-400 dark:text-slate-400">{{ pattern.occurrences }}x transaksi</span>
                <span class="text-[11px] font-extrabold text-[#70a214] dark:text-lime">• {{ Math.round(pattern.confidence) }}% akurat</span>
              </div>
            </div>
          </div>

          <div class="text-left sm:text-right flex-shrink-0">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Rata-rata</span>
            <p class="font-display text-base font-extrabold text-ink-900 dark:text-white">Rp {{ formatCurrency(pattern.avgAmount) }}</p>
          </div>
        </div>

        <!-- Dates Prediction Row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-surface dark:bg-ink-900 text-xs">
          <div>
            <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Terakhir</p>
            <p class="font-bold text-ink-900 dark:text-white mt-0.5">{{ formatDate(pattern.lastDate) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-extrabold uppercase tracking-wider text-coral">Prediksi Selanjutnya</p>
            <p class="font-extrabold text-coral mt-0.5">{{ formatDate(pattern.nextPredictedDate) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Interval</p>
            <p class="font-bold text-ink-900 dark:text-white mt-0.5">{{ pattern.avgInterval }} hari</p>
          </div>
        </div>

        <!-- Action CTA Buttons -->
        <div class="flex items-center gap-2 pt-1">
          <button
            @click="createRecurring(pattern)"
            class="px-4 py-2 rounded-xl bg-lime text-ink-900 font-extrabold text-xs shadow-soft hover:shadow-float active:scale-95 transition-all"
          >
            ✅ Jadikan Transaksi Berulang
          </button>
          <button
            @click="viewTransactions(pattern)"
            class="px-4 py-2 rounded-xl bg-surface dark:bg-ink-900 border border-ink-900/10 text-ink-900 dark:text-white font-extrabold text-xs hover:bg-canvas transition-all"
          >
            👁️ {{ expandedPattern === index ? 'Tutup Riwayat' : 'Lihat Riwayat' }}
          </button>
        </div>

        <!-- Collapsible Transaction History -->
        <div v-if="expandedPattern === index" class="mt-3 pt-3 border-t border-ink-900/5 dark:border-white/5 space-y-2 animate-fade-in">
          <h5 class="text-xs font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Riwayat Terdeteksi</h5>
          <div class="space-y-1.5">
            <div
              v-for="tx in pattern.transactions"
              :key="tx.id"
              class="flex items-center justify-between p-2 rounded-xl bg-surface dark:bg-ink-900 text-xs"
            >
              <span class="text-ink-500 dark:text-slate-400 font-bold">{{ formatDate(tx.date) }}</span>
              <span class="text-ink-900 dark:text-white font-medium truncate mx-2">{{ tx.description || '-' }}</span>
              <span class="font-display font-extrabold text-ink-900 dark:text-white">Rp {{ formatCurrency(tx.amount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Show More Button -->
    <div v-if="data.patterns.length > 5" class="text-center pt-2">
      <button @click="showAll = !showAll" class="px-5 py-2.5 rounded-2xl bg-canvas dark:bg-ink-800 text-ink-900 dark:text-white font-extrabold text-xs hover:bg-lime hover:text-ink-900 shadow-soft transition-all">
        {{ showAll ? 'Tampilkan Lebih Sedikit' : `Tampilkan Semua (${data.patterns.length})` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RecurringPatternsResult, RecurringPattern } from '@/composables/useAnalytics'

interface Props {
  data: RecurringPatternsResult
}

const props = defineProps<Props>()
const emit = defineEmits<{
  createRecurring: [pattern: RecurringPattern]
}>()

const showAll = ref(false)
const expandedPattern = ref<number | null>(null)

const displayedPatterns = computed(() => {
  return showAll.value ? props.data.patterns : props.data.patterns.slice(0, 5)
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
  }
  return labels[frequency] || frequency
}

function createRecurring(pattern: RecurringPattern) {
  emit('createRecurring', pattern)
}

function viewTransactions(pattern: RecurringPattern) {
  const index = props.data.patterns.indexOf(pattern)
  expandedPattern.value = expandedPattern.value === index ? null : index
}
</script>
