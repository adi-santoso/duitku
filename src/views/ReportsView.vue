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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <!-- Expense by Category -->
      <div class="card">
        <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Pengeluaran per Kategori</h2>

        <div v-if="expenseByCategory.length === 0" class="text-center py-8 text-slate-400 dark:text-slate-500">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
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
              <span class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(cat.total) }}</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :style="{
                  width: `${(cat.total / summary.expense) * 100}%`,
                  backgroundColor: cat.color
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Comparison -->
      <div class="card">
        <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Perbandingan Bulanan</h2>
        <div class="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
          <div v-for="month in comparisonData" :key="month.label" class="py-3 first:pt-0 last:pb-0">
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{{ month.label }}</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Pemasukan</p>
                <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(month.income) }}</p>
              </div>
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Pengeluaran</p>
                <p class="text-sm font-bold text-red-600 dark:text-red-400">{{ formatCurrency(month.expense) }}</p>
              </div>
            </div>
            <!-- Visual bar comparison -->
            <div class="mt-2 flex gap-1.5 h-1.5">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { formatCurrency, formatCompactNumber } from '@/utils/formatters'
import { getMonthsList, getMonthRange } from '@/utils/dateHelpers'

const { getSummary, getExpenseByCategory } = useTransactions()

const monthsList = getMonthsList()
const selectedMonth = ref(monthsList[0])
const summary = ref({ income: 0, expense: 0, balance: 0 })
const expenseByCategory = ref([])
const comparisonData = ref([])

const loadData = () => {
  const { start, end } = getMonthRange(selectedMonth.value.year, selectedMonth.value.month)
  const startDate = start.toISOString().split('T')[0]
  const endDate = end.toISOString().split('T')[0]

  summary.value = getSummary(startDate, endDate)
  expenseByCategory.value = getExpenseByCategory(startDate, endDate)

  comparisonData.value = monthsList.slice(0, 6).map(month => {
    const { start, end } = getMonthRange(month.year, month.month)
    const startDate = start.toISOString().split('T')[0]
    const endDate = end.toISOString().split('T')[0]
    const data = getSummary(startDate, endDate)

    return {
      label: month.label,
      income: data.income,
      expense: data.expense,
      balance: data.balance
    }
  })
}

onMounted(() => {
  loadData()
})
</script>
