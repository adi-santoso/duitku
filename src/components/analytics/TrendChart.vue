<template>
  <div class="trend-chart">
    <div class="chart-header">
      <h3 class="chart-title">📊 Income vs Expense Trend</h3>
      <div class="chart-controls">
        <select v-model="granularity" class="granularity-select">
          <option value="day">Harian</option>
          <option value="week">Mingguan</option>
          <option value="month">Bulanan</option>
          <option value="year">Tahunan</option>
        </select>
      </div>
    </div>

    <div class="summary-badges">
      <div class="badge badge-income">
        <p class="badge-label">Total Income</p>
        <p class="badge-value">{{ formatCurrency(data.summary.totalIncome) }}</p>
      </div>
      <div class="badge badge-expense">
        <p class="badge-label">Total Expense</p>
        <p class="badge-value">{{ formatCurrency(data.summary.totalExpense) }}</p>
      </div>
      <div class="badge badge-trend">
        <p class="badge-label">Trend</p>
        <p class="badge-value">
          {{ trendIcon }} {{ trendText }}
          <span class="trend-percentage">({{ formatTrendPercentage }})</span>
        </p>
      </div>
    </div>

    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
      label: 'Income',
      data: props.data.periods.map((p) => p.income),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Expense',
      data: props.data.periods.map((p) => p.expense),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
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
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || ''
          const value = formatCurrency(context.parsed.y)
          return `${label}: ${value}`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => formatCurrencyShort(value),
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
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

// Watch granularity changes
import { watch } from 'vue'
watch(granularity, (newValue) => {
  emit('update:granularity', newValue)
})
</script>

<style scoped>
.trend-chart {
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.dark .trend-chart {
  background: #1f2937;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.dark .chart-title {
  color: #f3f4f6;
}

.granularity-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  color: #111827;
  font-size: 0.875rem;
  cursor: pointer;
}

.dark .granularity-select {
  background-color: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.summary-badges {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.badge {
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

.badge-income {
  background-color: #d1fae5;
  border-left-color: #10b981;
}

.dark .badge-income {
  background-color: #065f46;
}

.badge-expense {
  background-color: #fee2e2;
  border-left-color: #ef4444;
}

.dark .badge-expense {
  background-color: #7f1d1d;
}

.badge-trend {
  background-color: #dbeafe;
  border-left-color: #3b82f6;
}

.dark .badge-trend {
  background-color: #1e3a8a;
}

.badge-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.dark .badge-label {
  color: #9ca3af;
}

.badge-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.dark .badge-value {
  color: #f3f4f6;
}

.trend-percentage {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .trend-percentage {
  color: #9ca3af;
}

.chart-container {
  height: 350px;
}

@media (max-width: 640px) {
  .chart-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .summary-badges {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 300px;
  }
}
</style>
