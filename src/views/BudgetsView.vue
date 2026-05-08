<template>
  <div class="space-y-4 lg:space-y-6 pb-20 lg:pb-0 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Anggaran Bulanan</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ currentMonthLabel }}</p>
      </div>
      <button
        @click="showAddModal = true"
        class="btn btn-primary h-9 px-4 text-sm"
      >
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Tambah
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="card text-center py-3">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Total Budget</p>
        <p class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(totalBudget) }}</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Terpakai</p>
        <p class="text-sm font-bold text-red-600 dark:text-red-400">{{ formatCurrency(totalSpent) }}</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Sisa</p>
        <p class="text-sm font-bold" :class="totalRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
          {{ formatCurrency(totalRemaining) }}
        </p>
      </div>
      <div class="card text-center py-3">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Kategori</p>
        <p class="text-sm font-bold text-slate-900 dark:text-white">{{ budgets.length }}</p>
      </div>
    </div>

    <!-- Overall Progress -->
    <div v-if="budgets.length > 0" class="card">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Progress Keseluruhan</p>
        <p class="text-sm font-bold" :class="overallPercentage > 100 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'">
          {{ overallPercentage.toFixed(0) }}%
        </p>
      </div>
      <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
        <div
          class="h-3 rounded-full transition-all duration-700"
          :class="overallPercentage > 100 ? 'bg-red-500' : overallPercentage > 80 ? 'bg-amber-500' : 'bg-primary-500'"
          :style="{ width: `${Math.min(overallPercentage, 100)}%` }"
        />
      </div>
      <p class="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
        {{ formatCurrency(totalSpent) }} dari {{ formatCurrency(totalBudget) }} terpakai
      </p>
    </div>

    <!-- Budget Forecast Alerts -->
    <div v-if="atRiskBudgets.length > 0" class="card border-l-4 border-l-amber-500">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-lg">📊</span>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Prediksi Akhir Bulan</h3>
      </div>
      <div class="space-y-2.5">
        <div v-for="f in atRiskBudgets" :key="f.id" class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center text-base" :style="{ backgroundColor: f.category_color + '18' }">
            {{ f.category_icon }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{{ f.category_name }}</p>
            <p class="text-[10px] text-slate-400 dark:text-slate-500">
              <span v-if="f.status === 'exceeded'">Sudah melebihi budget!</span>
              <span v-else-if="f.daysUntilExceeded">Habis dalam ~{{ f.daysUntilExceeded }} hari</span>
              <span v-else>Proyeksi: {{ formatCurrency(f.projectedTotal) }}</span>
            </p>
          </div>
          <div class="text-right flex-shrink-0">
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-md"
              :style="{ backgroundColor: f.statusColor + '18', color: f.statusColor }"
            >
              {{ f.statusLabel }}
            </span>
            <p class="text-[10px] text-slate-400 mt-0.5">Maks {{ formatCurrency(f.recommendedDaily) }}/hari</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Budget List -->
    <div v-if="budgets.length === 0" class="card text-center py-16">
      <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Belum ada anggaran</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
        Atur budget per kategori untuk membantu mengontrol pengeluaran bulanan
      </p>
      <button @click="showAddModal = true" class="btn btn-primary h-10 px-5">
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Buat Anggaran Pertama
      </button>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="budget in sortedBudgets"
        :key="budget.id"
        class="card hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            :style="{ backgroundColor: budget.category_color + '18' }"
          >
            {{ budget.category_icon }}
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ budget.category_name }}</p>
              <div class="flex items-center gap-2">
                <span
                  class="text-xs px-2 py-0.5 rounded-md font-semibold"
                  :class="getStatusClass(budget)"
                >
                  {{ getStatusLabel(budget) }}
                </span>
                <button
                  @click="editBudget(budget)"
                  class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  @click="confirmDelete(budget)"
                  class="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-slate-400 hover:text-red-500"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-slate-500 dark:text-slate-400">
                {{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.amount) }}
              </span>
              <span class="text-xs font-bold" :class="budget.spent > budget.amount ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'">
                {{ budget.amount > 0 ? ((budget.spent / budget.amount) * 100).toFixed(0) : 0 }}%
              </span>
            </div>

            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :style="{
                  width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%`,
                  backgroundColor: budget.spent > budget.amount ? '#ef4444' : budget.spent > budget.amount * 0.8 ? '#f59e0b' : budget.category_color
                }"
              />
            </div>

            <p v-if="budget.spent > budget.amount" class="text-xs text-red-500 dark:text-red-400 mt-1.5 font-medium">
              Melebihi {{ formatCurrency(budget.spent - budget.amount) }}
            </p>
            <p v-else class="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              Sisa {{ formatCurrency(budget.amount - budget.spent) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Budget Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in" @click.self="closeModals">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModals" />

      <div class="relative w-full md:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up border-t md:border border-slate-200 dark:border-slate-800">
        <div class="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-5 py-4 flex items-center justify-between z-10">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ showEditModal ? 'Edit Anggaran' : 'Tambah Anggaran' }}
          </h2>
          <button @click="closeModals" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-5 space-y-5">
          <!-- Category Selection (only for add) -->
          <div v-if="!showEditModal">
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Kategori Pengeluaran *</label>
            <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              <button
                v-for="cat in availableCategories"
                :key="cat.id"
                type="button"
                @click="form.categoryId = cat.id"
                class="p-3 rounded-xl border-2 transition-all text-center"
                :class="form.categoryId === cat.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
              >
                <span class="text-xl block mb-1">{{ cat.icon }}</span>
                <span class="text-[10px] font-medium block truncate text-slate-600 dark:text-slate-400">{{ cat.name }}</span>
              </button>
            </div>
          </div>

          <!-- Editing category display -->
          <div v-if="showEditModal && editingBudget" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :style="{ backgroundColor: editingBudget.category_color + '18' }">
              {{ editingBudget.category_icon }}
            </div>
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ editingBudget.category_name }}</span>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jumlah Anggaran *</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500">Rp</span>
              <input
                v-model="form.amount"
                type="number"
                class="input pl-12"
                placeholder="0"
                required
                min="1000"
                step="1000"
              />
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Budget maksimal per bulan untuk kategori ini</p>
          </div>

          <!-- Quick Amount Buttons -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="preset in [500000, 1000000, 2000000, 3000000, 5000000]"
              :key="preset"
              type="button"
              @click="form.amount = preset"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
              :class="form.amount == preset
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'"
            >
              {{ formatCurrency(preset) }}
            </button>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeModals" class="btn btn-secondary flex-1 h-11">Batal</button>
            <button type="submit" class="btn btn-primary flex-1 h-11">
              {{ showEditModal ? 'Simpan' : 'Tambah' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCategories } from '@/composables/useCategories'
import { useBudgets } from '@/composables/useBudgets'
import { useBudgetForecast } from '@/composables/useBudgetForecast'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/formatters'
import { getMonthName } from '@/utils/dateHelpers'

const { categories, expenseCategories, loadCategories } = useCategories()
const { budgets, loadBudgets, addBudget, updateBudget, deleteBudget } = useBudgets()
const { atRiskBudgets, calculateForecasts } = useBudgetForecast()
const toast = useToast()

// Recalculate forecasts when budgets change
watch(budgets, (newBudgets) => {
  if (newBudgets.length > 0) {
    calculateForecasts(newBudgets)
  }
}, { immediate: true })

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()
const currentMonthLabel = `${getMonthName(currentMonth)} ${currentYear}`

const showAddModal = ref(false)
const showEditModal = ref(false)
const editingBudget = ref(null)

const form = ref({
  categoryId: null,
  amount: ''
})

// Computed
const totalBudget = computed(() => budgets.value.reduce((sum, b) => sum + b.amount, 0))
const totalSpent = computed(() => budgets.value.reduce((sum, b) => sum + b.spent, 0))
const totalRemaining = computed(() => totalBudget.value - totalSpent.value)
const overallPercentage = computed(() => totalBudget.value > 0 ? (totalSpent.value / totalBudget.value) * 100 : 0)

const sortedBudgets = computed(() => {
  return [...budgets.value].sort((a, b) => {
    const pctA = a.amount > 0 ? a.spent / a.amount : 0
    const pctB = b.amount > 0 ? b.spent / b.amount : 0
    return pctB - pctA
  })
})

const availableCategories = computed(() => {
  const usedIds = budgets.value.map(b => b.category_id)
  return expenseCategories.value.filter(c => !usedIds.includes(c.id))
})

// Methods
const getStatusClass = (budget) => {
  const pct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
  if (pct >= 100) return 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400'
  if (pct >= 80) return 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'
  return 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
}

const getStatusLabel = (budget) => {
  const pct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
  if (pct >= 100) return 'Melebihi'
  if (pct >= 80) return 'Hampir'
  return 'Aman'
}

const editBudget = (budget) => {
  editingBudget.value = budget
  form.value = {
    categoryId: budget.category_id,
    amount: budget.amount
  }
  showEditModal.value = true
}

const confirmDelete = async (budget) => {
  if (confirm(`Hapus anggaran untuk "${budget.category_name}"?`)) {
    await deleteBudget(budget.id)
    await loadBudgets(currentYear, currentMonth)
  }
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingBudget.value = null
  form.value = { categoryId: null, amount: '' }
}

const handleSubmit = async () => {
  if (!form.value.amount || form.value.amount <= 0) {
    toast.warning('Masukkan jumlah anggaran')
    return
  }

  if (showEditModal.value && editingBudget.value) {
    await updateBudget(editingBudget.value.id, parseFloat(form.value.amount))
  } else {
    if (!form.value.categoryId) {
      toast.warning('Pilih kategori terlebih dahulu')
      return
    }
    await addBudget(form.value.categoryId, parseFloat(form.value.amount))
  }

  closeModals()
  await loadBudgets(currentYear, currentMonth)
}

onMounted(async () => {
  await loadCategories()
  await loadBudgets(currentYear, currentMonth)
})
</script>
