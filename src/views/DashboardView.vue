<template>
  <div class="space-y-5 animate-fade-in">
    <!-- Skeleton Loading State -->
    <template v-if="isLoading">
      <div class="flex items-center gap-3">
        <div class="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard v-for="i in 3" :key="i" variant="stat" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <SkeletonCard v-for="i in 2" :key="i" variant="chart" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <SkeletonCard variant="chart" />
        <div class="lg:col-span-2">
          <SkeletonCard variant="list" :items="5" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,.75fr)] gap-5">
        <div class="space-y-4 min-w-0">
          <section class="relative overflow-hidden min-h-[270px] md:min-h-[250px] rounded-3xl bg-ink-900 dark:bg-ink-800 text-white p-6 md:p-7 shadow-float">
            <div class="absolute -right-20 -bottom-32 w-72 h-72 rounded-full border-[44px] border-violet/50"></div>
            <div class="absolute right-36 -top-16 w-28 h-28 rounded-[32px] bg-lime/10 rotate-12"></div>
            <div class="relative flex items-center justify-between gap-4">
              <p class="text-xs text-slate-400">Total saldo bersih</p>
              <BaseSelect :model-value="selectedMonthValue" @update:modelValue="handleFilterChange" custom-class="!w-auto pl-3 pr-9 py-2 rounded-xl !border-white/15 !bg-white/10 !text-white text-xs font-semibold">
                <option value="all" class="text-ink-900">Semua Waktu</option>
                <option v-for="m in monthOptions" :key="`${m.year}-${m.month}`" :value="`${m.year}-${m.month}`" class="text-ink-900">{{ m.label }}</option>
              </BaseSelect>
            </div>
            <div class="relative mt-6">
              <p class="font-display text-4xl md:text-5xl font-extrabold tracking-[-0.06em]" :class="summary.balance < 0 ? 'text-coral' : 'text-white'">{{ formatCurrency(summary.balance) }}</p>
              <div v-if="selectedMonth" class="flex items-center gap-2 mt-3 text-[11px] text-slate-300"><span class="px-2 py-1 rounded-full bg-lime text-ink-900 font-extrabold">{{ balanceChangeLabel }}</span> dibanding {{ prevMonthLabel }}</div>
              <p v-else class="mt-3 text-[11px] text-slate-400">Akumulasi seluruh transaksi tercatat</p>
            </div>
            <div class="absolute left-6 right-6 bottom-6 grid grid-cols-2 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
              <div class="pt-3 border-t border-white/10"><span class="block text-[10px] text-slate-400">Pemasukan</span><strong class="font-display text-base">{{ formatCompactCurrency(summary.income) }}</strong></div>
              <div class="pt-3 border-t border-white/10"><span class="block text-[10px] text-slate-400">Pengeluaran</span><strong class="font-display text-base">{{ formatCompactCurrency(summary.expense) }}</strong></div>
              <button @click="showAddTransaction('expense')" class="hidden md:block h-12 px-5 rounded-2xl bg-coral text-sm font-extrabold shadow-lg shadow-coral/20 hover:-translate-y-0.5 transition-transform">+ Transaksi</button>
            </div>
          </section>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <article class="card !p-4"><div class="flex justify-between"><span class="text-xs text-ink-500 dark:text-slate-400">Sisa anggaran</span><span class="w-8 h-8 rounded-xl bg-lime/60 text-ink-900 grid place-items-center">◎</span></div><strong class="block mt-3 font-display text-xl text-ink-900 dark:text-white">{{ formatCompactCurrency(remainingBudget) }}</strong><small class="text-[10px] text-ink-500 dark:text-slate-400"><b class="text-primary-600 dark:text-lime">{{ budgetRemainingPercentage }}%</b> masih tersedia</small></article>
            <article class="card !p-4"><div class="flex justify-between"><span class="text-xs text-ink-500 dark:text-slate-400">Rasio tabungan</span><span class="w-8 h-8 rounded-xl bg-sky/25 text-sky-600 grid place-items-center">↗</span></div><strong class="block mt-3 font-display text-xl text-ink-900 dark:text-white">{{ savingsRate }}%</strong><small class="text-[10px] text-ink-500 dark:text-slate-400">Dari pemasukan periode ini</small></article>
            <article class="card !p-4 sm:col-auto"><div class="flex justify-between"><span class="text-xs text-ink-500 dark:text-slate-400">Transaksi tercatat</span><span class="w-8 h-8 rounded-xl bg-coral/20 text-coral grid place-items-center">#</span></div><strong class="block mt-3 font-display text-xl text-ink-900 dark:text-white">{{ recentTransactions.length }}</strong><small class="text-[10px] text-ink-500 dark:text-slate-400">Aktivitas terbaru ditampilkan</small></article>
          </div>
        </div>

        <FinancialHealthCard :score="healthScore" :breakdown="healthBreakdown" :grade="healthGrade" :tips="healthTips" :loading="healthLoading" @refresh="refreshHealthScore" />
      </div>

      <!-- Budget Alerts -->
      <div v-if="budgetAlerts.length > 0" class="card border-l-4" :class="hasOverBudget ? 'border-l-red-500' : 'border-l-amber-500'">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="hasOverBudget ? 'bg-red-100 dark:bg-red-500/15' : 'bg-amber-100 dark:bg-amber-500/15'">
            <svg class="w-5 h-5" :class="hasOverBudget ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-slate-900 dark:text-white mb-2">Peringatan Anggaran</p>
            <div class="space-y-2">
              <div v-for="alert in budgetAlerts" :key="alert.id" class="flex items-center gap-2">
                <span class="text-sm">{{ alert.category_icon }}</span>
                <span class="text-xs font-medium text-slate-700 dark:text-slate-300">{{ alert.category_name }}</span>
                <span class="text-xs px-1.5 py-0.5 rounded-md font-semibold" :class="alert.status === 'over' ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'">
                  {{ alert.status === 'over' ? 'Melebihi' : 'Hampir' }} {{ alert.percentage.toFixed(0) }}%
                </span>
                <span class="text-xs text-slate-400 ml-auto">{{ formatCurrency(alert.spent) }} / {{ formatCurrency(alert.budget_amount) }}</span>
              </div>
            </div>
            <router-link to="/budgets" class="inline-block mt-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
              Kelola Anggaran →
            </router-link>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <!-- Monthly Trend Chart -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Tren Bulanan</h2>
            <div class="flex items-center gap-3 text-xs">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span class="text-slate-500 dark:text-slate-400">Masuk</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span class="text-slate-500 dark:text-slate-400">Keluar</span>
              </span>
            </div>
          </div>
          <div class="h-56">
            <Bar v-if="trendChartData" :data="trendChartData" :options="trendChartOptions" />
          </div>
        </div>

        <!-- Expense Donut Chart -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Komposisi Pengeluaran</h2>
            <router-link to="/reports" class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
              Detail
            </router-link>
          </div>
          <div v-if="expenseByCategory.length === 0" class="flex items-center justify-center h-56 text-slate-400 dark:text-slate-500">
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              </svg>
              <p class="text-sm">Belum ada data</p>
            </div>
          </div>
          <div v-else class="flex items-center gap-4">
            <div class="w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0">
              <Doughnut :data="donutChartData" :options="donutChartOptions" />
            </div>
            <div class="flex-1 space-y-1.5 min-w-0 overflow-y-auto max-h-48">
              <div v-for="cat in expenseByCategory.slice(0, 6)" :key="cat.id" class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: cat.color }"></span>
                <span class="text-xs text-slate-600 dark:text-slate-400 truncate">{{ cat.name }}</span>
                <span class="text-xs font-bold text-slate-900 dark:text-white ml-auto flex-shrink-0">{{ ((cat.total / summary.expense) * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recurring Transaction Suggestions -->
      <RecurringSuggestions
        :suggestions="recurringSuggestions"
        :get-frequency-label="getFrequencyLabel"
        @dismiss="dismissRecurring"
        @mark-recurring="handleMarkRecurring"
      />

      <!-- Quick Actions + Recent Transactions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <!-- Quick Actions -->
        <div class="card lg:col-span-1">
          <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Tambah Cepat</h2>
          <div class="space-y-3">
            <button
              @click="showAddTransaction('income')"
              class="w-full flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 transition-all group"
            >
              <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div class="text-left">
                <p class="font-semibold text-sm text-emerald-700 dark:text-emerald-400">Pemasukan</p>
                <p class="text-xs text-emerald-600/70 dark:text-emerald-400/60">Catat pendapatan baru</p>
              </div>
            </button>

            <button
              @click="showAddTransaction('expense')"
              class="w-full flex items-center gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/15 transition-all group"
            >
              <div class="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-sm shadow-red-500/25 group-hover:scale-105 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                </svg>
              </div>
              <div class="text-left">
                <p class="font-semibold text-sm text-red-700 dark:text-red-400">Pengeluaran</p>
                <p class="text-xs text-red-600/70 dark:text-red-400/60">Catat pengeluaran baru</p>
              </div>
            </button>
          </div>

          <!-- Budget Summary Mini -->
          <div v-if="budgetSummary.length > 0" class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-bold text-slate-900 dark:text-white">Anggaran</p>
              <router-link to="/budgets" class="text-xs font-semibold text-primary-600 dark:text-primary-400">Kelola</router-link>
            </div>
            <div class="space-y-2.5">
              <div v-for="b in budgetSummary.slice(0, 3)" :key="b.id">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-slate-600 dark:text-slate-400">{{ b.category_icon }} {{ b.category_name }}</span>
                  <span class="text-xs font-semibold" :class="b.spent > Number(b.amount) ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'">
                    {{ Number(b.amount) > 0 ? ((b.spent / Number(b.amount)) * 100).toFixed(0) : 0 }}%
                  </span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all duration-500"
                    :class="b.spent > Number(b.amount) ? 'bg-red-500' : b.spent > Number(b.amount) * 0.8 ? 'bg-amber-500' : 'bg-primary-500'"
                    :style="{ width: `${Math.min((b.spent / Number(b.amount)) * 100, 100)}%` }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Transaksi Terbaru</h2>
            <router-link to="/transactions" class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
              Lihat Semua
            </router-link>
          </div>

          <div v-if="recentTransactions.length === 0" class="text-center py-10 text-slate-400 dark:text-slate-500">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p class="text-sm">Belum ada transaksi</p>
          </div>

          <!-- Desktop Table -->
          <div v-else class="hidden md:block">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800">
                  <th class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Kategori</th>
                  <th class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Tanggal</th>
                  <th class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Deskripsi</th>
                  <th class="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Jumlah</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="t in recentTransactions" :key="t.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="py-3">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" :style="{ backgroundColor: t.category_color + '18' }">
                        {{ t.category_icon }}
                      </div>
                      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ t.category_name }}</span>
                    </div>
                  </td>
                  <td class="py-3">
                    <span class="text-sm text-slate-500 dark:text-slate-400">{{ formatDate(t.transaction_date, 'medium') }}</span>
                  </td>
                  <td class="py-3">
                    <span class="text-sm text-slate-500 dark:text-slate-400">{{ t.description || '-' }}</span>
                  </td>
                  <td class="py-3 text-right">
                    <span class="text-sm font-bold" :class="t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                      {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile List -->
          <div v-if="recentTransactions.length > 0" class="md:hidden space-y-1">
            <div v-for="t in recentTransactions" :key="'m-' + t.id" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" :style="{ backgroundColor: t.category_color + '18' }">
                {{ t.category_icon }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{{ t.category_name }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500">{{ formatDate(t.transaction_date, 'medium') }}</p>
              </div>
              <p class="text-sm font-bold flex-shrink-0" :class="t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Transaction Modal -->
    <TransactionModal
      v-if="showModal"
      :type="transactionType"
      @close="showModal = false"
      @saved="handleTransactionSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import BaseSelect from '@/components/common/BaseSelect.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import TransactionModal from '@/components/transaction/TransactionModal.vue'
import FinancialHealthCard from '@/components/common/FinancialHealthCard.vue'
import RecurringSuggestions from '@/components/common/RecurringSuggestions.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import { useBudgets } from '@/composables/useBudgets'
import { useFinancialHealth } from '@/composables/useFinancialHealth'
import { useRecurringDetection } from '@/composables/useRecurringDetection'
import { api } from '@/utils/api'
import { formatCurrency } from '@/utils/formatters'
import { formatDate, getMonthRange, getMonthName } from '@/utils/dateHelpers'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const { transactions, loadTransactions, getSummary, getExpenseByCategory } = useTransactions()
const { loadCategories } = useCategories()
const { loadBudgets, budgets, getBudgetAlerts } = useBudgets()
const {
  score: healthScore,
  breakdown: healthBreakdown,
  grade: healthGrade,
  tips: healthTips,
  loading: healthLoading,
  calculateScore: refreshHealthScore,
} = useFinancialHealth()
const {
  suggestions: recurringSuggestions,
  detectRecurring,
  dismissSuggestion: dismissRecurring,
  getFrequencyLabel,
} = useRecurringDetection()

const isLoading = ref(true)
const showModal = ref(false)
const transactionType = ref('expense')
const summary = ref({ income: 0, expense: 0, balance: 0 })
const prevSummary = ref({ income: 0, expense: 0, balance: 0 })
const expenseByCategory = ref([])
const recentTransactions = ref([])
const budgetAlerts = ref([])
const budgetSummary = ref([])

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

// Filter state: null = semua, { year, month } = bulan tertentu
const selectedMonth = ref(null)

// Generate month options (last 12 months)
const monthOptions = computed(() => {
  const options = []
  for (let i = 0; i < 12; i++) {
    let m = currentMonth - i
    let y = currentYear
    if (m < 0) { m += 12; y-- }
    options.push({
      year: y,
      month: m,
      label: `${getMonthName(m)} ${y}`
    })
  }
  return options
})

// Computed value for select binding
const selectedMonthValue = computed(() => {
  if (selectedMonth.value === null) return 'all'
  return `${selectedMonth.value.year}-${selectedMonth.value.month}`
})

// Previous month label for comparison hint
const prevMonthLabel = computed(() => {
  if (!selectedMonth.value) return ''
  let prevM = selectedMonth.value.month - 1
  let prevY = selectedMonth.value.year
  if (prevM < 0) { prevM = 11; prevY-- }
  return `${getMonthName(prevM).substring(0, 3)} ${prevY}`
})

const balanceChangeLabel = computed(() => {
  if (!selectedMonth.value || prevSummary.value.balance === 0) return 'Periode aktif'
  const change = ((summary.value.balance - prevSummary.value.balance) / Math.abs(prevSummary.value.balance)) * 100
  return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`
})

const totalBudgetAmount = computed(() => budgetSummary.value.reduce((sum, budget) => sum + Number(budget.amount || 0), 0))
const totalBudgetSpent = computed(() => budgetSummary.value.reduce((sum, budget) => sum + Number(budget.spent || 0), 0))
const remainingBudget = computed(() => Math.max(0, totalBudgetAmount.value - totalBudgetSpent.value))
const budgetRemainingPercentage = computed(() => totalBudgetAmount.value > 0
  ? Math.round((remainingBudget.value / totalBudgetAmount.value) * 100)
  : 0)
const savingsRate = computed(() => summary.value.income > 0
  ? Math.max(0, Math.round((summary.value.balance / summary.value.income) * 100))
  : 0)

const formatCompactCurrency = (value) => {
  const amount = Number(value) || 0
  if (Math.abs(amount) >= 1000000000) return `Rp${(amount / 1000000000).toFixed(1).replace('.0', '')} M`
  if (Math.abs(amount) >= 1000000) return `Rp${(amount / 1000000).toFixed(1).replace('.0', '')} jt`
  if (Math.abs(amount) >= 1000) return `Rp${(amount / 1000).toFixed(0)} rb`
  return formatCurrency(amount)
}

const hasOverBudget = computed(() => budgetAlerts.value.some(a => a.status === 'over'))

// Monthly trend data (last 6 months)
const trendChartData = ref(null)
const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: { family: 'Inter', size: 12 },
      bodyFont: { family: 'Inter', size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' }
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.1)' },
      ticks: {
        font: { family: 'Inter', size: 10 },
        color: '#94a3b8',
        callback: (v) => {
          if (v >= 1000000) return (v / 1000000).toFixed(1) + 'Jt'
          if (v >= 1000) return (v / 1000).toFixed(0) + 'K'
          return v
        }
      }
    }
  }
}

// Donut chart
const donutChartData = computed(() => {
  if (expenseByCategory.value.length === 0) return null
  const cats = expenseByCategory.value.slice(0, 6)
  return {
    labels: cats.map(c => c.name),
    datasets: [{
      data: cats.map(c => c.total),
      backgroundColor: cats.map(c => c.color),
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
      titleFont: { family: 'Inter', size: 12 },
      bodyFont: { family: 'Inter', size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
          const pct = ((ctx.raw / total) * 100).toFixed(1)
          return `${ctx.label}: ${formatCurrency(ctx.raw)} (${pct}%)`
        }
      }
    }
  }
}

const showAddTransaction = (type) => {
  transactionType.value = type
  showModal.value = true
}

const handleTransactionSaved = () => {
  showModal.value = false
  loadData()
}

const handleMarkRecurring = async (item) => {
  // Mark the most recent transaction as recurring
  try {
    const result = await api.transactions.list({
      type: 'expense',
      search: item.description,
      limit: '1',
    })
    const txs = result.transactions || result || []
    if (txs.length > 0) {
      await api.transactions.update(txs[0].id, {
        isRecurring: true,
        recurringFrequency: item.frequency,
      })
    }
    dismissRecurring(item.id)
  } catch (err) {
    console.error('Error marking recurring:', err)
  }
}

const setFilter = (month) => {
  selectedMonth.value = month
  loadData()
}

const handleFilterChange = (val) => {
  if (val === 'all') {
    setFilter(null)
  } else {
    const [year, month] = val.split('-').map(Number)
    setFilter({ year, month, label: `${getMonthName(month).substring(0, 3)} ${year}` })
  }
}

const buildTrendChart = async () => {
  const labels = []
  const incomeData = []
  const expenseData = []

  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i
    let y = currentYear
    if (m < 0) { m += 12; y-- }

    const { start, end } = getMonthRange(y, m)
    const data = await getSummary(start, end)

    labels.push(getMonthName(m).substring(0, 3))
    incomeData.push(data.income)
    expenseData.push(data.expense)
  }

  trendChartData.value = {
    labels,
    datasets: [
      {
        label: 'Pemasukan',
        data: incomeData,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.7
      },
      {
        label: 'Pengeluaran',
        data: expenseData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.7
      }
    ]
  }
}

const loadData = async () => {
  isLoading.value = true

  try {
    await loadCategories()

    let startDate = null
    let endDate = null

    if (selectedMonth.value) {
      // Filtered by specific month
      const { start, end } = getMonthRange(selectedMonth.value.year, selectedMonth.value.month)
      startDate = start
      endDate = end
    }

    // Load summary and expense by category
    if (startDate && endDate) {
      const [summaryData, expenseByCat] = await Promise.all([
        getSummary(startDate, endDate),
        getExpenseByCategory(startDate, endDate)
      ])
      summary.value = summaryData
      expenseByCategory.value = expenseByCat

      // Previous month for comparison
      let prevMonth = selectedMonth.value.month - 1
      let prevYear = selectedMonth.value.year
      if (prevMonth < 0) { prevMonth = 11; prevYear-- }
      const prevRange = getMonthRange(prevYear, prevMonth)
      prevSummary.value = await getSummary(prevRange.start, prevRange.end)
    } else {
      // All time: no date filter
      const [summaryData, expenseByCat] = await Promise.all([
        getSummary('2000-01-01', '2099-12-31'),
        getExpenseByCategory('2000-01-01', '2099-12-31')
      ])
      summary.value = summaryData
      expenseByCategory.value = expenseByCat
      prevSummary.value = { income: 0, expense: 0, balance: 0 }
    }

    // Load recent transactions (limited for dashboard display)
    if (startDate && endDate) {
      await loadTransactions({ startDate, endDate, limit: 7 })
    } else {
      await loadTransactions({ limit: 7 })
    }
    recentTransactions.value = transactions.value.slice(0, 7)

    // Budget data (always current month)
    await loadBudgets(currentYear, currentMonth)
    budgetSummary.value = budgets.value
    budgetAlerts.value = await getBudgetAlerts(currentYear, currentMonth)

    await buildTrendChart()

    // Calculate financial health score (non-blocking)
    refreshHealthScore()

    // Detect recurring patterns (non-blocking)
    detectRecurring()
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
