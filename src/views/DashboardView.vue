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
        <!-- Main Column (Primary) -->
        <div class="space-y-5 min-w-0">
          <!-- Hero Card (Total Saldo) -->
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

          <!-- Top 3 Metric Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <!-- Metric 1: Sisa Anggaran -->
            <article class="card !p-4.5 group">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs text-ink-500 dark:text-slate-400 font-medium">Sisa anggaran</span>
                <div class="w-8 h-8 rounded-xl bg-lime/60 text-ink-900 grid place-items-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-width="1.8" d="M5 8h14v10H5zM8 8V6h8v2m-7 5h6"/>
                  </svg>
                </div>
              </div>
              <strong class="block mt-3 font-display text-2xl font-extrabold text-ink-900 dark:text-white tracking-tight">{{ formatCompactCurrency(remainingBudget) }}</strong>
              <small class="block mt-1 text-[11px] text-ink-500 dark:text-slate-400">
                <b class="text-lime-deep font-bold">{{ budgetRemainingPercentage }}%</b> masih tersedia
              </small>
            </article>

            <!-- Metric 2: Rasio Tabungan -->
            <article class="card !p-4.5 group">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs text-ink-500 dark:text-slate-400 font-medium">Rasio tabungan</span>
                <div class="w-8 h-8 rounded-xl bg-sky/25 text-sky-600 dark:text-sky-400 grid place-items-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-width="1.8" d="M6 15c1.5 0 2.3-1.4 3-3 .8 3.5 1.8 5.2 3 5.2 1.3 0 2-3.4 3-6.2.7 1.5 1.6 2.5 3 2.5"/>
                  </svg>
                </div>
              </div>
              <strong class="block mt-3 font-display text-2xl font-extrabold text-ink-900 dark:text-white tracking-tight">{{ savingsRate }}%</strong>
              <small class="block mt-1 text-[11px] text-ink-500 dark:text-slate-400">
                <b class="text-lime-deep font-bold">{{ savingsRateDiffLabel }}</b> dibanding bulan lalu
              </small>
            </article>

            <!-- Metric 3: Tagihan Terdekat -->
            <article class="card !p-4.5 group">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs text-ink-500 dark:text-slate-400 font-medium">Tagihan terdekat</span>
                <div class="w-8 h-8 rounded-xl bg-coral/20 text-coral grid place-items-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-width="1.8" d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  </svg>
                </div>
              </div>
              <strong class="block mt-3 font-display text-2xl font-extrabold text-ink-900 dark:text-white tracking-tight">
                {{ upcomingBill ? `${upcomingBill.daysLeft} hari` : 'Aman' }}
              </strong>
              <small class="block mt-1 text-[11px] text-ink-500 dark:text-slate-400 truncate">
                {{ upcomingBill ? `${upcomingBill.title} · ${formatCompactCurrency(upcomingBill.amount)}` : 'Tidak ada tagihan terdekat' }}
              </small>
            </article>
          </div>

          <!-- Cash Flow Section ("Arus uang") -->
          <article class="card !p-5.5">
            <header class="flex items-center justify-between gap-4 mb-5 px-1">
              <div>
                <h2 class="font-display text-lg font-extrabold text-ink-900 dark:text-white">Arus uang</h2>
                <p class="text-xs text-ink-500 dark:text-slate-400 mt-0.5">Enam bulan terakhir, dalam juta rupiah</p>
              </div>
              <router-link to="/analytics" class="text-xs font-extrabold text-ink-900 dark:text-lime hover:underline">
                Lihat analitik ↗
              </router-link>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_145px] gap-6 items-center">
              <div>
                <div class="h-52">
                  <Bar v-if="trendChartData" :data="trendChartData" :options="trendChartOptions" />
                </div>
                <div class="flex items-center gap-4 mt-3 text-xs text-ink-500 dark:text-slate-400 font-medium">
                  <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-sm bg-lime inline-block"></i> Pemasukan</span>
                  <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-sm bg-coral inline-block"></i> Pengeluaran</span>
                </div>
              </div>

              <!-- Chart Aside Summary Box -->
              <aside class="space-y-3">
                <div class="p-3 rounded-2xl bg-canvas dark:bg-ink-800 hover:scale-[1.03] hover:shadow-sm transition-all duration-200 cursor-pointer">
                  <span class="text-[10px] text-ink-500 dark:text-slate-400 block">Rata-rata masuk</span>
                  <strong class="font-display text-sm font-extrabold text-ink-900 dark:text-white block mt-1">{{ formatCompactCurrency(avgIncome) }}</strong>
                </div>
                <div class="p-3 rounded-2xl bg-canvas dark:bg-ink-800 hover:scale-[1.03] hover:shadow-sm transition-all duration-200 cursor-pointer">
                  <span class="text-[10px] text-ink-500 dark:text-slate-400 block">Rata-rata keluar</span>
                  <strong class="font-display text-sm font-extrabold text-ink-900 dark:text-white block mt-1">{{ formatCompactCurrency(avgExpense) }}</strong>
                </div>
                <div class="p-3 rounded-2xl bg-canvas dark:bg-ink-800 hover:scale-[1.03] hover:shadow-sm transition-all duration-200 cursor-pointer">
                  <span class="text-[10px] text-ink-500 dark:text-slate-400 block">Tren saldo</span>
                  <strong class="font-display text-sm font-extrabold text-[#79a71f] block mt-1">Naik {{ balanceChangeLabel }}</strong>
                </div>
              </aside>
            </div>
          </article>

          <!-- Recent Transactions Card List ("Transaksi terbaru") -->
          <article class="card !p-5.5">
            <header class="flex items-center justify-between gap-4 mb-4 px-3">
              <div>
                <h2 class="font-display text-lg font-extrabold text-ink-900 dark:text-white">Transaksi terbaru</h2>
                <p class="text-xs text-ink-500 dark:text-slate-400 mt-0.5">Aktivitas terakhir dari akun bersama</p>
              </div>
              <router-link to="/transactions" class="text-xs font-extrabold text-ink-900 dark:text-lime hover:underline">
                Lihat semua
              </router-link>
            </header>

            <div v-if="recentTransactions.length === 0" class="text-center py-10 text-slate-400 dark:text-slate-500">
              <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p class="text-sm">Belum ada transaksi</p>
            </div>

            <!-- Fresh Card List Layout for Recent Transactions -->
            <div v-else class="space-y-1.5">
              <div
                v-for="t in recentTransactions"
                :key="t.id"
                class="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 items-center p-3 rounded-2xl group hover:bg-canvas dark:hover:bg-ink-800/80 hover:scale-[1.01] hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <!-- Category Icon Box -->
                <div
                  class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                  :style="{ backgroundColor: (t.category_color || '#aa9cff') + '30' }"
                >
                  {{ t.category_icon || '💳' }}
                </div>

                <!-- Transaction Details -->
                <div class="min-w-0">
                  <strong class="block text-xs font-bold text-ink-900 dark:text-white truncate">
                    {{ t.description || t.category_name }}
                  </strong>
                  <span class="block text-[11px] text-ink-500 dark:text-slate-400 mt-0.5 truncate">
                    {{ t.category_name }} · {{ formatDate(t.transaction_date, 'medium') }}
                  </span>
                </div>

                <!-- Transaction Amount -->
                <span
                  class="font-display font-bold text-xs flex-shrink-0"
                  :class="t.type === 'income' ? 'text-[#70a214] dark:text-lime font-extrabold' : 'text-ink-900 dark:text-slate-200'"
                >
                  {{ t.type === 'income' ? '+' : '−' }} {{ formatCurrency(t.amount) }}
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- Sidebar Right Column (Secondary) -->
        <aside class="space-y-5 min-w-0" aria-label="Insight dan target">
          <!-- Kesehatan Finansial Card -->
          <FinancialHealthCard
            :score="healthScore"
            :breakdown="healthBreakdown"
            :grade="healthGrade"
            :tips="healthTips"
            :loading="healthLoading"
            @refresh="refreshHealthScore"
          />

          <!-- Anggaran Aktif Card -->
          <article class="card !p-5.5">
            <header class="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 class="font-display text-base font-extrabold text-ink-900 dark:text-white">Anggaran aktif</h2>
                <p class="text-[11px] text-ink-500 dark:text-slate-400">Periode berjalan</p>
              </div>
              <router-link to="/budgets" class="text-xs font-extrabold text-ink-900 dark:text-lime hover:underline">
                Kelola
              </router-link>
            </header>

            <div v-if="budgetSummary.length === 0" class="text-center py-6 text-xs text-slate-400">
              Belum ada anggaran aktif
            </div>

            <div v-else class="space-y-4">
              <div v-for="b in budgetSummary.slice(0, 3)" :key="b.id" class="space-y-2">
                <div class="flex items-center justify-between text-xs font-bold">
                  <span class="text-ink-900 dark:text-white">{{ b.category_icon }} {{ b.category_name }}</span>
                  <small class="text-ink-500 dark:text-slate-400 font-normal">
                    {{ formatCompactCurrency(b.spent) }} / {{ formatCompactCurrency(b.amount) }}
                  </small>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-[#ebe7de] dark:bg-ink-800">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="b.spent > Number(b.amount) ? 'bg-coral' : b.spent > Number(b.amount) * 0.8 ? 'bg-coral/80' : 'bg-lime-deep'"
                    :style="{ width: `${Math.min((b.spent / Number(b.amount)) * 100, 100)}%` }"
                  />
                </div>
              </div>
            </div>
          </article>

          <!-- Target Tabungan (Goal Card) Widget -->
          <article v-if="topGoal" class="card relative overflow-hidden !p-5.5 !bg-violet !border-transparent !text-ink-900 shadow-soft">
            <div class="absolute -right-2 -bottom-5 text-white/30 text-8xl font-black rotate-[-14deg] pointer-events-none select-none">
              {{ topGoal.icon || '✈' }}
            </div>
            <h2 class="font-display text-base font-extrabold tracking-tight relative z-10">
              {{ topGoal.name }}
            </h2>
            <p class="text-xs text-ink-900/70 mt-1 mb-4 relative z-10">Target tabungan utama</p>

            <div class="relative z-10 flex items-center justify-between gap-3">
              <strong class="font-display text-xl font-extrabold">
                {{ formatCompactCurrency(topGoal.current_amount) }}
              </strong>
              <span class="text-xs font-bold">{{ Math.round(topGoal.percentage) }}%</span>
            </div>

            <div class="relative z-10 h-2 mt-2.5 mb-3 rounded-full bg-white/40 overflow-hidden">
              <div
                class="h-full bg-ink-900 rounded-full transition-all duration-700"
                :style="{ width: `${Math.min(100, topGoal.percentage)}%` }"
              />
            </div>

            <footer class="relative z-10 flex items-center justify-between text-[11px] text-ink-900/80 font-bold">
              <span>Target {{ formatCompactCurrency(topGoal.target_amount) }}</span>
              <span>Sisa {{ formatCompactCurrency(topGoal.remaining) }}</span>
            </footer>
          </article>

          <article v-else class="card relative overflow-hidden !p-5.5 !bg-violet/15 border border-violet/30 !text-ink-900 dark:!text-white shadow-soft">
            <h2 class="font-display text-base font-extrabold tracking-tight">Target Tabungan</h2>
            <p class="text-xs text-ink-500 dark:text-slate-400 mt-1 mb-4">Belum ada target tabungan yang aktif.</p>
            <router-link to="/savings" class="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-violet text-ink-900 text-xs font-extrabold hover:opacity-90 transition-opacity">
              + Buat Target Tabungan
            </router-link>
          </article>

          <!-- Insight & Recurring Suggestions -->
          <RecurringSuggestions
            :suggestions="recurringSuggestions"
            :get-frequency-label="getFrequencyLabel"
            @dismiss="dismissRecurring"
            @mark-recurring="handleMarkRecurring"
          />

          <!-- Default Insight Card if no recurring suggestions -->
          <article v-if="recurringSuggestions.length === 0" class="card flex items-start gap-3 !p-4.5 !bg-[#fff7e5] dark:!bg-[#d8b866] !border-amber-200/50 !text-ink-900">
            <div class="w-9 h-9 rounded-xl bg-[#ffd77c] text-amber-900 flex items-center justify-center font-bold text-lg flex-shrink-0">
              ✦
            </div>
            <div>
              <strong class="block text-xs font-bold text-amber-950 dark:text-ink-900">Insight untukmu</strong>
              <p class="text-[11px] text-amber-900/80 mt-1 leading-relaxed">
                Pengeluaranmu minggu ini berada di jalur aman. Menjaga batas belanja dapat meningkatkan rasio tabungan bulan ini.
              </p>
            </div>
          </article>
        </aside>
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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
import { useSavingsGoals } from '@/composables/useSavingsGoals'
import { api } from '@/utils/api'
import { formatCurrency } from '@/utils/formatters'
import { formatDate, getMonthRange, getMonthName } from '@/utils/dateHelpers'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const { transactions, loadTransactions, getSummary, getExpenseByCategory } = useTransactions()
const { loadCategories } = useCategories()
const { loadBudgets, budgets, getBudgetAlerts } = useBudgets()
const { activeGoals, loadGoals } = useSavingsGoals()
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
const trendIncomeList = ref([])
const trendExpenseList = ref([])
const upcomingBill = ref(null)

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

// Filter state: null = semua, { year, month } = bulan tertentu
const selectedMonth = ref(null)

const topGoal = computed(() => activeGoals.value[0] || null)

const avgIncome = computed(() => {
  if (trendIncomeList.value.length === 0) return 0
  const sum = trendIncomeList.value.reduce((a, b) => a + b, 0)
  return sum / trendIncomeList.value.length
})

const avgExpense = computed(() => {
  if (trendExpenseList.value.length === 0) return 0
  const sum = trendExpenseList.value.reduce((a, b) => a + b, 0)
  return sum / trendExpenseList.value.length
})

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
  if (!selectedMonth.value || prevSummary.value.balance === 0) return '0%'
  const change = ((summary.value.balance - prevSummary.value.balance) / Math.abs(prevSummary.value.balance)) * 100
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
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

const prevSavingsRate = computed(() => prevSummary.value.income > 0
  ? Math.max(0, Math.round((prevSummary.value.balance / prevSummary.value.income) * 100))
  : 0)

const savingsRateDiffLabel = computed(() => {
  if (prevSummary.value.income === 0) return 'Periode ini'
  const diff = savingsRate.value - prevSavingsRate.value
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
})

const formatCompactCurrency = (value) => {
  const amount = Number(value) || 0
  if (Math.abs(amount) >= 1000000000) return `Rp${(amount / 1000000000).toFixed(1).replace('.0', '')} M`
  if (Math.abs(amount) >= 1000000) return `Rp${(amount / 1000000).toFixed(1).replace('.0', '')} jt`
  if (Math.abs(amount) >= 1000) return `Rp${(amount / 1000).toFixed(0)} rb`
  return formatCurrency(amount)
}

// Monthly trend data (last 6 months)
const trendChartData = ref(null)
const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#17213f',
      titleFont: { family: 'DM Sans', size: 12 },
      bodyFont: { family: 'DM Sans', size: 11 },
      padding: 10,
      cornerRadius: 10,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: 'DM Sans', size: 11 }, color: '#7d879f' }
    },
    y: {
      grid: { color: 'rgba(23, 33, 63, 0.08)' },
      ticks: {
        font: { family: 'DM Sans', size: 10 },
        color: '#7d879f',
        callback: (v) => {
          if (v >= 1000000) return (v / 1000000).toFixed(0) + 'jt'
          if (v >= 1000) return (v / 1000).toFixed(0) + 'k'
          return v
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

const loadUpcomingBills = async () => {
  try {
    const result = await api.transactions.list({ limit: 20 })
    const txs = result.transactions || result || []
    const recurringTx = txs.find(t => t.is_recurring || t.isRecurring)
    if (recurringTx) {
      upcomingBill.value = {
        title: recurringTx.description || recurringTx.category_name,
        amount: Number(recurringTx.amount),
        daysLeft: 3
      }
    } else {
      upcomingBill.value = null
    }
  } catch (e) {
    upcomingBill.value = null
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

  trendIncomeList.value = incomeData
  trendExpenseList.value = expenseData

  trendChartData.value = {
    labels,
    datasets: [
      {
        label: 'Pemasukan',
        data: incomeData,
        backgroundColor: '#c8f16d',
        borderRadius: 8,
        barPercentage: 0.65,
        categoryPercentage: 0.65
      },
      {
        label: 'Pengeluaran',
        data: expenseData,
        backgroundColor: '#ff8068',
        borderRadius: 8,
        barPercentage: 0.65,
        categoryPercentage: 0.65
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
      const { start, end } = getMonthRange(selectedMonth.value.year, selectedMonth.value.month)
      startDate = start
      endDate = end
    }

    if (startDate && endDate) {
      const [summaryData, expenseByCat] = await Promise.all([
        getSummary(startDate, endDate),
        getExpenseByCategory(startDate, endDate)
      ])
      summary.value = summaryData
      expenseByCategory.value = expenseByCat

      let prevMonth = selectedMonth.value.month - 1
      let prevYear = selectedMonth.value.year
      if (prevMonth < 0) { prevMonth = 11; prevYear-- }
      const prevRange = getMonthRange(prevYear, prevMonth)
      prevSummary.value = await getSummary(prevRange.start, prevRange.end)
    } else {
      const [summaryData, expenseByCat] = await Promise.all([
        getSummary('2000-01-01', '2099-12-31'),
        getExpenseByCategory('2000-01-01', '2099-12-31')
      ])
      summary.value = summaryData
      expenseByCategory.value = expenseByCat
      prevSummary.value = { income: 0, expense: 0, balance: 0 }
    }

    if (startDate && endDate) {
      await loadTransactions({ startDate, endDate, limit: 7 })
    } else {
      await loadTransactions({ limit: 7 })
    }
    recentTransactions.value = transactions.value.slice(0, 7)

    await loadBudgets(currentYear, currentMonth)
    budgetSummary.value = budgets.value
    budgetAlerts.value = await getBudgetAlerts(currentYear, currentMonth)

    await buildTrendChart()
    await loadUpcomingBills()

    try {
      await loadGoals()
    } catch (e) {
      console.warn('Savings goals not loaded:', e)
    }

    refreshHealthScore()
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
