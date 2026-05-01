<template>
  <div class="space-y-6 pb-20 lg:pb-0 animate-fade-in">
    <!-- Skeleton Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <!-- Filter Skeleton -->
      <div class="flex items-center gap-3">
        <div class="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
      </div>

      <!-- Summary Cards Skeleton -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="card">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <div class="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div class="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
          </div>
          <div class="mt-3 h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
      </div>

      <!-- Charts Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div class="card">
          <div class="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
          <div class="h-56 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        </div>
        <div class="card">
          <div class="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
          <div class="h-56 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        </div>
      </div>

      <!-- Bottom Section Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div class="card lg:col-span-1">
          <div class="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
          <div class="space-y-3">
            <div class="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            <div class="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          </div>
        </div>
        <div class="card lg:col-span-2">
          <div class="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
          <div class="space-y-3">
            <div v-for="i in 5" :key="i" class="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Month Filter (Select Dropdown) -->
      <div class="flex items-center gap-3">
        <div class="relative">
          <select
            :value="selectedMonthValue"
            @change="handleFilterChange($event)"
            class="appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all cursor-pointer"
          >
            <option value="all">Semua Waktu</option>
            <option
              v-for="m in monthOptions"
              :key="`${m.year}-${m.month}`"
              :value="`${m.year}-${m.month}`"
            >
              {{ m.label }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
        <span v-if="selectedMonth" class="text-xs text-slate-400 dark:text-slate-500">
          vs {{ prevMonthLabel }}
        </span>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="stat-card group">
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Pemasukan</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ formatCurrency(summary.income) }}</p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-1.5">
            <span class="badge badge-green">{{ filterLabel }}</span>
            <span v-if="incomeChange !== null" class="text-xs font-medium" :class="incomeChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
              {{ incomeChange >= 0 ? '+' : '' }}{{ incomeChange.toFixed(0) }}%
            </span>
          </div>
        </div>

        <div class="stat-card group">
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Pengeluaran</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ formatCurrency(summary.expense) }}</p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-1.5">
            <span class="badge badge-red">{{ filterLabel }}</span>
            <span v-if="expenseChange !== null" class="text-xs font-medium" :class="expenseChange <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
              {{ expenseChange >= 0 ? '+' : '' }}{{ expenseChange.toFixed(0) }}%
            </span>
          </div>
        </div>

        <div class="stat-card group">
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo</p>
              <p class="text-2xl font-bold" :class="summary.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600 dark:text-red-400'">
                {{ formatCurrency(summary.balance) }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
          </div>
          <div class="mt-3">
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full transition-all duration-700"
                :class="summary.balance >= 0 ? 'bg-blue-500' : 'bg-red-500'"
                :style="{ width: summary.income > 0 ? `${Math.min((summary.expense / summary.income) * 100, 100)}%` : '0%' }"
              />
            </div>
            <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              {{ summary.income > 0 ? ((summary.expense / summary.income) * 100).toFixed(0) : 0 }}% terpakai
            </p>
          </div>
        </div>
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
import TransactionModal from '@/components/transaction/TransactionModal.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import { useBudgets } from '@/composables/useBudgets'
import { formatCurrency } from '@/utils/formatters'
import { formatDate, getMonthRange, getMonthName } from '@/utils/dateHelpers'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const { transactions, loadTransactions, getSummary, getExpenseByCategory } = useTransactions()
const { loadCategories } = useCategories()
const { loadBudgets, budgets, getBudgetAlerts } = useBudgets()

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

// Label for badge
const filterLabel = computed(() => {
  if (selectedMonth.value === null) return 'Semua'
  return `${getMonthName(selectedMonth.value.month).substring(0, 3)} ${selectedMonth.value.year}`
})

// Previous month label for comparison hint
const prevMonthLabel = computed(() => {
  if (!selectedMonth.value) return ''
  let prevM = selectedMonth.value.month - 1
  let prevY = selectedMonth.value.year
  if (prevM < 0) { prevM = 11; prevY-- }
  return `${getMonthName(prevM).substring(0, 3)} ${prevY}`
})

// Percentage changes (only shown when a month is selected)
const incomeChange = computed(() => {
  if (selectedMonth.value === null) return null
  if (prevSummary.value.income === 0) return null
  return ((summary.value.income - prevSummary.value.income) / prevSummary.value.income) * 100
})

const expenseChange = computed(() => {
  if (selectedMonth.value === null) return null
  if (prevSummary.value.expense === 0) return null
  return ((summary.value.expense - prevSummary.value.expense) / prevSummary.value.expense) * 100
})

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

const setFilter = (month) => {
  selectedMonth.value = month
  loadData()
}

const handleFilterChange = (event) => {
  const val = event.target.value
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
    const startDate = start.toISOString().split('T')[0]
    const endDate = end.toISOString().split('T')[0]
    const data = await getSummary(startDate, endDate)

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
      startDate = start.toISOString().split('T')[0]
      endDate = end.toISOString().split('T')[0]
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
      prevSummary.value = await getSummary(
        prevRange.start.toISOString().split('T')[0],
        prevRange.end.toISOString().split('T')[0]
      )
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

    // Load transactions (filtered or all)
    if (startDate && endDate) {
      await loadTransactions({ startDate, endDate })
    } else {
      await loadTransactions()
    }
    recentTransactions.value = transactions.value.slice(0, 7)

    // Budget data (always current month)
    await loadBudgets(currentYear, currentMonth)
    budgetSummary.value = budgets.value
    budgetAlerts.value = await getBudgetAlerts(currentYear, currentMonth)

    await buildTrendChart()
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
