<template>
  <div class="space-y-4 lg:space-y-6 pb-20 lg:pb-0 animate-fade-in">
    <!-- Month Selector -->
    <div class="flex items-center gap-3">
      <div class="flex-1">
        <BaseSelect v-model="selectedMonthIndex" @update:modelValue="loadData">
          <option v-for="(month, idx) in monthsList" :key="month.label" :value="idx">
            {{ month.label }}
          </option>
        </BaseSelect>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <template v-if="isLoading">
      <div class="grid grid-cols-3 gap-3">
        <SkeletonCard v-for="i in 3" :key="i" variant="stat" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonCard v-for="i in 2" :key="i" variant="chart" />
      </div>
    </template>

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-3 gap-3">
        <div class="card text-center">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Pemasukan</p>
          <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {{ formatNumber(summary.income) }}
          </p>
        </div>
        <div class="card text-center">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Pengeluaran</p>
          <p class="text-lg font-bold text-red-600 dark:text-red-400">
            {{ formatNumber(summary.expense) }}
          </p>
        </div>
        <div class="card text-center">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Saldo</p>
          <p class="text-lg font-bold" :class="summary.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'">
            {{ formatNumber(summary.balance) }}
          </p>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <!-- Expense Donut Chart -->
        <div class="card">
          <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Komposisi Pengeluaran</h2>

          <EmptyState
            v-if="expenseByCategory.length === 0"
            icon="chart"
            title="Tidak ada data pengeluaran"
            description="Tambahkan transaksi pengeluaran untuk melihat komposisi kategori"
            variant="secondary"
          />

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

          <EmptyState
            v-if="!trendChartData"
            icon="chart"
            title="Tidak ada data trend"
            description="Tambahkan lebih banyak transaksi untuk melihat tren keuangan"
            variant="secondary"
          />

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

      <!-- Monthly Comparison Table (with category breakdown) -->
      <div class="card">
        <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Perbandingan Bulanan</h2>
        <div class="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
          <div v-for="(month, idx) in comparisonData" :key="month.label" class="py-3 first:pt-0 last:pb-0">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ month.label }}</p>
              <button
                @click="toggleMonthDetail(idx)"
                class="text-[10px] font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
              >
                {{ expandedMonthIdx === idx ? 'Tutup' : 'Detail' }}
              </button>
            </div>
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

            <!-- Expanded Category Breakdown -->
            <div v-if="expandedMonthIdx === idx" class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
              <div v-if="monthDetailLoading" class="text-center py-3">
                <span class="text-xs text-slate-400">Memuat detail...</span>
              </div>
              <div v-else-if="monthDetailData.length > 0" class="space-y-2">
                <div v-for="cat in monthDetailData" :key="cat.id" class="flex items-center gap-2">
                  <span class="text-sm">{{ cat.icon }}</span>
                  <span class="text-xs text-slate-600 dark:text-slate-400 flex-1 truncate">{{ cat.name }}</span>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(cat.total) }}</span>
                  <span
                    v-if="cat.change !== null"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    :class="{
                      'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10': cat.change > 10,
                      'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10': cat.change < -10,
                      'text-slate-500 bg-slate-100 dark:bg-slate-800': cat.change >= -10 && cat.change <= 10,
                    }"
                  >
                    {{ cat.change > 0 ? '+' : '' }}{{ cat.change }}%
                  </span>
                </div>
              </div>
              <div v-else class="text-center py-2">
                <span class="text-xs text-slate-400">Tidak ada data pengeluaran</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Year-in-Review -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Ringkasan Tahunan</h2>
          <BaseSelect
            v-model="reviewYear"
            @update:modelValue="loadYearReview"
            size="sm"
          >
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </BaseSelect>
        </div>

        <div v-if="yearReviewLoading" class="text-center py-8">
          <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>

        <div v-else-if="yearReview">
          <!-- Key Stats -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5">Total Pemasukan</p>
              <p class="text-sm font-bold text-emerald-700 dark:text-emerald-300">{{ formatCurrency(yearReview.totalIncome) }}</p>
            </div>
            <div class="p-3 rounded-xl bg-red-50 dark:bg-red-500/10">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-0.5">Total Pengeluaran</p>
              <p class="text-sm font-bold text-red-700 dark:text-red-300">{{ formatCurrency(yearReview.totalExpense) }}</p>
            </div>
            <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5">Total Ditabung</p>
              <p class="text-sm font-bold text-blue-700 dark:text-blue-300">{{ formatCurrency(yearReview.totalSaved) }}</p>
            </div>
            <div class="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-0.5">Rasio Tabungan</p>
              <p class="text-sm font-bold text-purple-700 dark:text-purple-300">{{ yearReview.savingsRate }}%</p>
            </div>
          </div>

          <!-- Highlights -->
          <div class="space-y-2 mb-4">
            <div v-if="yearReview.bestMonth" class="flex items-center gap-2 text-xs">
              <span class="text-emerald-500">🏆</span>
              <span class="text-slate-600 dark:text-slate-400">Bulan terbaik:</span>
              <span class="font-bold text-slate-700 dark:text-slate-300">{{ yearReview.bestMonth.label }}</span>
            </div>
            <div v-if="yearReview.highestExpenseMonth" class="flex items-center gap-2 text-xs">
              <span class="text-red-500">💸</span>
              <span class="text-slate-600 dark:text-slate-400">Pengeluaran tertinggi:</span>
              <span class="font-bold text-slate-700 dark:text-slate-300">{{ yearReview.highestExpenseMonth.label }} ({{ formatCurrency(yearReview.highestExpenseMonth.expense) }})</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span>📝</span>
              <span class="text-slate-600 dark:text-slate-400">Total transaksi:</span>
              <span class="font-bold text-slate-700 dark:text-slate-300">{{ yearReview.totalTransactions }}</span>
            </div>
          </div>

          <!-- Top Categories -->
          <div v-if="yearReview.topCategories.length > 0">
            <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Top Kategori Pengeluaran</p>
            <div class="space-y-1.5">
              <div v-for="(cat, i) in yearReview.topCategories" :key="cat.id" class="flex items-center gap-2">
                <span class="text-[10px] font-bold text-slate-400 w-4">{{ i + 1 }}</span>
                <span class="text-sm">{{ cat.icon }}</span>
                <span class="text-xs text-slate-600 dark:text-slate-400 flex-1">{{ cat.name }}</span>
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(cat.total) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-6 text-slate-400 dark:text-slate-500">
          <p class="text-sm">Belum ada data untuk tahun ini</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Doughnut } from 'vue-chartjs'
import BaseSelect from '@/components/common/BaseSelect.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
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
import { useYearReview } from '@/composables/useYearReview'
import { formatCurrency, formatCompactNumber, formatNumber } from '@/utils/formatters'
import { getMonthsList, getMonthRange, getMonthName } from '@/utils/dateHelpers'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const { getSummary, getExpenseByCategory } = useTransactions()
const { patterns: spendingPatterns, analyzePatterns } = useSpendingPatterns()
const { review: yearReview, loading: yearReviewLoading, generateReview } = useYearReview()

const currentYear = new Date().getFullYear()
const reviewYear = ref(currentYear)
const availableYears = computed(() => {
  const years = []
  for (let y = currentYear; y >= currentYear - 3; y--) years.push(y)
  return years
})

const loadYearReview = () => {
  generateReview(reviewYear.value)
}

const monthsList = getMonthsList()
const selectedMonthIndex = ref(0)
const selectedMonth = computed(() => monthsList[selectedMonthIndex.value])

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
const expandedMonthIdx = ref(null)
const monthDetailData = ref([])
const monthDetailLoading = ref(false)

/**
 * Toggle month detail: load per-category breakdown for that month
 * and compare with the previous month
 */
const toggleMonthDetail = async (idx) => {
  if (expandedMonthIdx.value === idx) {
    expandedMonthIdx.value = null
    return
  }

  expandedMonthIdx.value = idx
  monthDetailLoading.value = true
  monthDetailData.value = []

  try {
    const month = monthsList[idx]
    const { start, end } = getMonthRange(month.year, month.month)

    // Get expense by category for this month
    const thisMonthCats = await getExpenseByCategory(start, end)

    // Get previous month for comparison
    let prevCats = []
    if (idx + 1 < monthsList.length) {
      const prevMonth = monthsList[idx + 1]
      const prevRange = getMonthRange(prevMonth.year, prevMonth.month)
      prevCats = await getExpenseByCategory(prevRange.start, prevRange.end)
    }

    // Build comparison map
    const prevMap = {}
    prevCats.forEach(c => { prevMap[c.id] = c.total })

    monthDetailData.value = thisMonthCats.map(c => ({
      ...c,
      change: prevMap[c.id] && prevMap[c.id] > 0
        ? Math.round(((c.total - prevMap[c.id]) / prevMap[c.id]) * 100)
        : null,
    }))
  } catch (err) {
    console.error('Error loading month detail:', err)
  } finally {
    monthDetailLoading.value = false
  }
}

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

    const [summaryData, expenseByCat] = await Promise.all([
      getSummary(start, end),
      getExpenseByCategory(start, end)
    ])

    summary.value = summaryData
    expenseByCategory.value = expenseByCat

    // Build comparison data (last 6 months)
    const comparisons = []
    for (const month of monthsList.slice(0, 6)) {
      const { start, end } = getMonthRange(month.year, month.month)
      const data = await getSummary(start, end)

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

    // Load year review (non-blocking)
    loadYearReview()
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
