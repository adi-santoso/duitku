<template>
  <div class="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h3 class="font-display text-base font-extrabold text-ink-900 dark:text-white flex items-center gap-2">
        <span>📊</span>
        <span>Tren Pemasukan vs Pengeluaran</span>
      </h3>

      <!-- Granularity Selector Pills -->
      <div class="inline-flex p-1 rounded-2xl bg-canvas dark:bg-ink-800 border border-ink-900/5 dark:border-white/5 text-xs font-bold">
        <button
          v-for="opt in [
            { value: 'day', label: 'Harian' },
            { value: 'week', label: 'Mingguan' },
            { value: 'month', label: 'Bulanan' },
            { value: 'year', label: 'Tahunan' },
          ]"
          :key="opt.value"
          @click="granularity = opt.value as any"
          class="px-3 py-1.5 rounded-xl transition-all"
          :class="granularity === opt.value ? 'bg-surface dark:bg-ink-900 text-ink-900 dark:text-white shadow-soft font-extrabold' : 'text-ink-500 dark:text-slate-400 hover:text-ink-900'"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Summary Badges Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="p-4 rounded-2xl bg-lime/15 dark:bg-lime/10 border border-lime/20 space-y-1">
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-900 dark:text-lime">Total Pemasukan</p>
        <p class="font-display text-base font-extrabold text-[#70a214] dark:text-lime truncate">{{ formatCurrency(data.summary.totalIncome) }}</p>
      </div>

      <div class="p-4 rounded-2xl bg-coral/15 dark:bg-coral/10 border border-coral/20 space-y-1">
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-coral">Total Pengeluaran</p>
        <p class="font-display text-base font-extrabold text-coral truncate">{{ formatCurrency(data.summary.totalExpense) }}</p>
      </div>

      <div class="p-4 rounded-2xl bg-canvas/70 dark:bg-ink-800/70 border border-ink-900/5 dark:border-white/5 space-y-1">
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Arah Tren</p>
        <p class="font-display text-base font-extrabold text-ink-900 dark:text-white truncate">
          {{ trendIcon }} {{ trendText }}
          <span class="text-xs text-ink-500 dark:text-slate-400 font-bold ml-1">({{ formatTrendPercentage }})</span>
        </p>
      </div>
    </div>

    <!-- Line Chart Container -->
    <div class="h-64 sm:h-80">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { TrendData } from '@/composables/useAnalytics'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Props {
  data: TrendData
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:granularity': [value: 'day' | 'week' | 'month' | 'year']
}>()

const granularity = ref<'day' | 'week' | 'month' | 'year'>('month')

const chartData = computed(() => ({
  labels: props.data.periods.map((p) => formatPeriodLabel(p.period)),
  datasets: [
    {
      label: 'Pemasukan',
      data: props.data.periods.map((p) => p.income),
      borderColor: '#70a214',
      backgroundColor: 'rgba(200, 241, 109, 0.2)',
      tension: 0.4,
      borderWidth: 2.5,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Pengeluaran',
      data: props.data.periods.map((p) => p.expense),
      borderColor: '#ff8068',
      backgroundColor: 'rgba(255, 128, 104, 0.15)',
      tension: 0.4,
      borderWidth: 2.5,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { boxWidth: 12, padding: 16, font: { size: 11 } }
    },
    tooltip: {
      backgroundColor: '#0c131d',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || ''
          const value = formatCurrency(context.parsed.y)
          return ` ${label}: ${value}`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        font: { size: 11 },
        color: '#94a3b8',
        callback: (value: any) => formatCurrencyShort(value),
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
    },
    x: {
      ticks: { font: { size: 11 }, color: '#94a3b8' },
      grid: {
        display: false,
      },
    },
  },
}))

const trendIcon = computed(() => {
  switch (props.data.summary.trend) {
    case 'increasing':
      return '📈'
    case 'decreasing':
      return '📉'
    default:
      return '➡️'
  }
})

const trendText = computed(() => {
  switch (props.data.summary.trend) {
    case 'increasing':
      return 'Naik'
    case 'decreasing':
      return 'Turun'
    default:
      return 'Stabil'
  }
})

const formatTrendPercentage = computed(() => {
  const percentage = Math.abs(props.data.summary.trendPercentage)
  const prefix = props.data.summary.trendPercentage > 0 ? '+' : '-'
  return `${prefix}${percentage.toFixed(1)}%`
})

function formatPeriodLabel(period: string): string {
  const date = new Date(period)
  if (granularity.value === 'day') {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  } else if (granularity.value === 'week') {
    return `W${getWeekNumber(date)}`
  } else if (granularity.value === 'month') {
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  } else {
    return date.getFullYear().toString()
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}jt`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`
  }
  return amount.toString()
}

watch(granularity, (newValue) => {
  emit('update:granularity', newValue)
})
</script>
