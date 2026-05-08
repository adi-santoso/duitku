<template>
  <div class="space-y-4 lg:space-y-6 pb-20 lg:pb-0 animate-fade-in">
    <!-- Month Selector -->
    <div class="flex items-center gap-3">
      <div class="flex-1">
        <select v-model="selectedMonth" @change="loadData" class="input">
          <option v-for="month in monthsList" :key="month.label" :value="month">
            {{ month.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="space-y-4">
      <div class="grid grid-cols-3 gap-3">
        <div v-for="i in 3" :key="i" class="card animate-pulse">
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto mb-2"></div>
          <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto"></div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card animate-pulse"><div class="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl"></div></div>
        <div class="card animate-pulse"><div class="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl"></div></div>
      </div>
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-3 gap-3">
        <div class="card text-center">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Pemasukan</p>
          <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {{ formatCompactNumber(summary.income) }}
          </p>
        </div>
        <div class="card text-center">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Pengeluaran</p>
          <p class="text-lg font-bold text-red-600 dark:text-red-400">
            {{ formatCompactNumber(summary.expense) }}
          </p>
        </div>
        <div class="card text-center">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Saldo</p>
          <p class="text-lg font-bold" :class="summary.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'">
            {{ formatCompactNumber(summary.balance) }}
          </p>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <!-- Expense Donut Chart -->
        <div class="card">
          <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Komposisi Pengeluaran</h2>

          <div v-if="expenseByCategory.length === 0" class="text-center py-8 text-slate-400 dark:text-slate-500">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
            <p class="text-sm">Tidak ada data pengeluaran</p>
          </div>

          <div v-else>
            <div class="relative h-56 flex items-center justify-center">
              <Doughnut :data="donutChartData" :options="donutChartOptions" />
            </div>
            <!-- Legend -->
            <div class="mt-4 grid grid-cols-2 gap-2">
              <div v-for="cat in expenseByCategory.slice(0, 6)" :key="cat.id" class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: cat.color }"></div>
                <span class="text-xs text-slate-600 dark:text-slate-400 truncate">{{ cat.name }}</span>
                <span class="text-xs font-semibold text-slate-900 dark:text-white ml-auto">{{ Math.round((cat.total / summary.expense) * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Trend Line Chart -->
        <div class="card">
          <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Tren 6 Bulan Terakhir</h2>

          <div v-if="!trendChartData" class="text-center py-8 text-slate-400 dark:text-slate-500">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <p class="text-sm">Tidak ada data</p>
          </div>

          <div v-else class="h-56">
            <Line :data="trendChartData" :options="lineChartOptions" />
          </div>
        </div>
      </div>

      <!-- Expense by Category Detail -->
      <div class="card">
        <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Detail Pengeluaran per Kategori</h2>

        <div v-if="expenseByCategory.length === 0" class="text-center py-8 text-slate-400 dark:text-slate-500">
          <p class="text-sm">Tidak ada data</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="cat in expenseByCategory" :key="cat.id" class="group">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  :style="{ backgroundColor: cat.color + '18' }"
                >
                  {{ cat.icon }}
                </div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ cat.name }}</span>
              </div>
              <div class="text-right">
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(cat.total) }}</span>
                <span class="text-xs text-slate-400 dark:text-slate-500 ml-2">{{ Math.round((cat.total / summary.expense) * 100) }}%</span>
              </div>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-700"
                :style="{
                  width: `${(cat.total / summary.expense) * 100}%`,
                  backgroundColor: cat.color
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Spending Patterns -->
      <div v-if="spendingPatterns" class="card">
        <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Pola Pengeluaran</h2>

        <!-- Key Insights -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Rata-rata/hari</p>
            <p class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(spendingPatterns.dailyAverage) }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Hari terboros</p>
            <p class="text-sm font-bold text-red-600 dark:text-red-400">{{ spendingPatterns.peakDay?.day }}</p>
          </div>
        </div>

        <!-- Day of Week Distribution -->
        <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Pengeluaran per Hari</p>
        <div class="space-y-1.5 mb-4">
          <div v-for="day in spendingPatterns.dayOfWeek" :key="day.dayIndex" class="flex items-center gap-2">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 w-12">{{ day.day.substring(0, 3) }}</span>
            <div class="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :class="day.dayIndex === spendingPatterns.peakDay?.dayIndex ? 'bg-red-500' : 'bg-blue-400 dark:bg-blue-500'"
                :style="{ width: `${maxDayTotal > 0 ? (day.total / maxDayTotal) * 100 : 0}%` }"
              />
            </div>
            <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 w-16 text-right">{{ formatCompactNumber(day.total) }}</span>
          </div>
        </div>

        <!-- Period Analysis -->
        <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Distribusi per Periode</p>
        <div class="space-y-2 mb-4">
          <div v-for="period in spendingPatterns.periodAnalysis" :key="period.label" class="flex items-center gap-2">
            <span class="text-[11px] text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">{{ period.label }}</span>
            <div class="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div
                class="h-2 rounded-full bg-purple-400 dark:bg-purple-500 transition-all duration-500"
                :style="{ width: `${period.percentage}%` }"
              />
            </div>
            <span class="text-[10px] font-bold text-slate-600 dark:text-slate-400 w-8 text-right">{{ period.percentage }}%</span>
          </div>
        </div>

        <!-- Category Trends -->
        <div v-if="spendingPatterns.categoryTrends.length > 0">
          <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Tren Kategori (vs bulan lalu)</p>
          <div class="space-y-1.5">
            <div
              v-for="trend in spendingPatterns.categoryTrends.slice(0, 5)"
              :key="trend.categoryId"
              class="flex items-center gap-2 py-1"
            >
              <span class="text-base">{{ trend.categoryIcon }}</span>
              <span class="text-xs text-slate-600 dark:text-slate-400 flex-1 truncate">{{ trend.categoryName }}</span>
              <span
                class="text-xs font-bold px-1.5 py-0.5 rounded"
                :class="{
                  'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10': trend.direction === 'up',
                  'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10': trend.direction === 'down',
                  'text-slate-500 bg-slate-100 dark:bg-slate-800': trend.direction === 'stable',
                  'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10': trend.direction === 'new',
                }"
              >
                {{ trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : trend.direction === 'new' ? 'Baru' : '→' }}
                {{ trend.direction !== 'new' && trend.direction !== 'stable' ? Math.abs(trend.change) + '%' : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Comparison Table -->
      <div class="card">
        <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Perbandingan Bulanan</h2>
        <div class="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
          <div v-for="month in comparisonData" :key="month.label" class="py-3 first:pt-0 last:pb-0">
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{{ month.label }}</p>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Pemasukan</p>
                <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(month.income) }}</p>
              </div>
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Pengeluaran</p>
                <p class="text-sm font-bold text-red-600 dark:text-red-400">{{ formatCurrency(month.expense) }}</p>
              </div>
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Saldo</p>
                <p class="text-sm font-bold" :class="month.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'">
                  {{ formatCurrency(month.balance) }}
                </p>
              </div>
            </div>
            <!-- Visual bar comparison -->
            <div class="mt-2 flex gap-1.5 h-2 rounded-full overflow-hidden">
              <div
                class="bg-emerald-400 dark:bg-emerald-500 rounded-full transition-all duration-500"
                :style="{ width: month.income > 0 || month.expense > 0 ? `${(month.income / Math.max(month.income + month.expense, 1)) * 100}%` : '50%' }"
              />
              <div
                class="bg-red-400 dark:bg-red-500 rounded-full transition-all duration-500"
                :style="{ width: month.income > 0 || month.expense > 0 ? `${(month.expense / Math.max(month.income + month.expense, 1)) * 100}%` : '50%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useTransactions } from '@/composables/useTransactions'
import { useSpendingPatterns } from '@/composables/useSpendingPatterns'
import { formatCurrency, formatCompactNumber } from '@/utils/formatters'
import { getMonthsList, getMonthRange, getMonthName } from '@/utils/dateHelpers'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const { getSummary, getExpenseByCategory } = useTransactions()
const { patterns: spendingPatterns, analyzePatterns } = useSpendingPatterns()

const monthsList = getMonthsList()
const selectedMonth = ref(monthsList[0])

// Computed for max day total (for bar width calculation)
const maxDayTotal = computed(() => {
  if (!spendingPatterns.value) return 0
  return Math.max(...spendingPatterns.value.dayOfWeek.map(d => d.total))
})
const summary = ref({ income: 0, expense: 0, balance: 0 })
const expenseByCategory = ref([])
const comparisonData = ref([])
const trendChartData = ref(null)
const isLoading = ref(true)

// Donut chart
const donutChartData = computed(() => {
  if (expenseByCategory.value.length === 0) return null
  return {
    labels: expenseByCategory.value.map(c => c.name),
    datasets: [{
      data: expenseByCategory.value.map(c => c.total),
      backgroundColor: expenseByCategory.value.map(c => c.color),
      borderWidth: 0,
      hoverOffset: 6
    }]
  }
})

const donutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const value = ctx.raw
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
          const pct = Math.round((value / total) * 100)
          return ` ${formatCurrency(value)} (${pct}%)`
        }
      }
    }
  }
}

// Line chart options
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: '#94a3b8' }
    },
    y: {
      grid: { color: '#f1f5f9', drawBorder: false },
      ticks: {
        font: { size: 11 },
        color: '#94a3b8',
        callback: (val) => formatCompactNumber(val)
      }
    }
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 12, padding: 16, font: { size: 11 } }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
      }
    }
  },
  elements: {
    line: { tension: 0.3 },
    point: { radius: 4, hoverRadius: 6 }
  }
}

const buildTrendChart = (comparisons) => {
  const labels = comparisons.map(c => c.label.split(' ')[0].substring(0, 3))
  trendChartData.value = {
    labels: labels.reverse(),
    datasets: [
      {
        label: 'Pemasukan',
        data: comparisons.map(c => c.income).reverse(),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        borderWidth: 2
      },
      {
        label: 'Pengeluaran',
        data: comparisons.map(c => c.expense).reverse(),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        fill: true,
        borderWidth: 2
      }
    ]
  }
}

const loadData = async () => {
  isLoading.value = true

  try {
    const { start, end } = getMonthRange(selectedMonth.value.year, selectedMonth.value.month)
    const startDate = start.toISOString().split('T')[0]
    const endDate = end.toISOString().split('T')[0]

    const [summaryData, expenseByCat] = await Promise.all([
      getSummary(startDate, endDate),
      getExpenseByCategory(startDate, endDate)
    ])

    summary.value = summaryData
    expenseByCategory.value = expenseByCat

    // Build comparison data (last 6 months)
    const comparisons = []
    for (const month of monthsList.slice(0, 6)) {
      const { start, end } = getMonthRange(month.year, month.month)
      const s = start.toISOString().split('T')[0]
      const e = end.toISOString().split('T')[0]
      const data = await getSummary(s, e)

      comparisons.push({
        label: month.label,
        income: data.income,
        expense: data.expense,
        balance: data.balance
      })
    }
    comparisonData.value = comparisons
    buildTrendChart(comparisons)

    // Analyze spending patterns (non-blocking)
    analyzePatterns()
  } catch (error) {
    console.error('Error loading report data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
