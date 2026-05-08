<template>
  <div class="space-y-4 lg:space-y-6 pb-20 lg:pb-0 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Target Tabungan</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Kelola target keuangan kamu</p>
      </div>
      <button
        @click="openCreateModal"
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
        <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Total Target</p>
        <p class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(totalTarget) }}</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Terkumpul</p>
        <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(totalSaved) }}</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Sisa</p>
        <p class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ formatCurrency(totalTarget - totalSaved) }}</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Tercapai</p>
        <p class="text-sm font-bold text-slate-900 dark:text-white">{{ completedGoals.length }}</p>
      </div>
    </div>

    <!-- Overall Progress -->
    <div v-if="activeGoals.length > 0" class="card">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Progress Keseluruhan</p>
        <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {{ totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0 }}%
        </p>
      </div>
      <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
        <div
          class="h-3 rounded-full transition-all duration-700 bg-emerald-500"
          :style="{ width: `${totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0}%` }"
        />
      </div>
      <p class="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
        {{ formatCurrency(totalSaved) }} dari {{ formatCurrency(totalTarget) }} terkumpul
      </p>
    </div>

    <!-- Tabs: Active / Completed -->
    <div class="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
      <button
        @click="activeTab = 'active'"
        class="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all"
        :class="activeTab === 'active'
          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
      >
        Aktif ({{ activeGoals.length }})
      </button>
      <button
        @click="activeTab = 'completed'"
        class="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all"
        :class="activeTab === 'completed'
          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
      >
        Tercapai ({{ completedGoals.length }})
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card animate-pulse">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="displayedGoals.length === 0" class="card text-center py-16">
      <div class="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
        <span class="text-3xl">🎯</span>
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">
        {{ activeTab === 'active' ? 'Belum ada target tabungan' : 'Belum ada target tercapai' }}
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
        {{ activeTab === 'active'
          ? 'Buat target tabungan untuk memotivasi kamu menabung lebih konsisten'
          : 'Target yang sudah tercapai akan muncul di sini' }}
      </p>
      <button v-if="activeTab === 'active'" @click="openCreateModal" class="btn btn-primary h-10 px-5">
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Buat Target Pertama
      </button>
    </div>

    <!-- Goals List -->
    <div v-else class="space-y-3">
      <div
        v-for="goal in displayedGoals"
        :key="goal.id"
        class="card hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            :style="{ backgroundColor: goal.color + '18' }"
          >
            {{ goal.icon }}
          </div>

          <div class="flex-1 min-w-0">
            <!-- Title & Actions -->
            <div class="flex items-center justify-between mb-1">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{{ goal.name }}</p>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <!-- Add Contribution -->
                <button
                  v-if="!goal.is_completed"
                  @click="openContributeModal(goal)"
                  class="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors text-emerald-500 hover:text-emerald-600"
                  title="Tambah tabungan"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
                <!-- Edit -->
                <button
                  @click="openEditModal(goal)"
                  class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <!-- Delete -->
                <button
                  @click="confirmDelete(goal)"
                  class="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-slate-400 hover:text-red-500"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Amount Info -->
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-slate-500 dark:text-slate-400">
                {{ formatCurrency(goal.current_amount) }} / {{ formatCurrency(goal.target_amount) }}
              </span>
              <span class="text-xs font-bold" :class="goal.is_completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'">
                {{ goal.percentage.toFixed(0) }}%
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
              <div
                class="h-2.5 rounded-full transition-all duration-500"
                :style="{
                  width: `${goal.percentage}%`,
                  backgroundColor: goal.is_completed ? '#10B981' : goal.color
                }"
              />
            </div>

            <!-- Footer Info -->
            <div class="flex items-center justify-between mt-2">
              <span v-if="goal.target_date" class="text-xs text-slate-400 dark:text-slate-500">
                🗓️ Target: {{ formatDate(goal.target_date) }}
              </span>
              <span v-else class="text-xs text-slate-400 dark:text-slate-500">Tanpa batas waktu</span>
              <span v-if="goal.is_completed" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✅ Tercapai!
              </span>
              <span v-else class="text-xs text-slate-400 dark:text-slate-500">
                Sisa {{ formatCurrency(goal.remaining) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Contribution History Toggle -->
        <button
          @click="toggleHistory(goal.id)"
          class="mt-3 w-full text-xs text-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-1"
        >
          {{ expandedGoalId === goal.id ? 'Sembunyikan riwayat' : 'Lihat riwayat kontribusi' }}
        </button>

        <!-- Contribution History -->
        <div v-if="expandedGoalId === goal.id" class="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div v-if="contributionsLoading" class="text-center py-3">
            <span class="text-xs text-slate-400">Memuat...</span>
          </div>
          <div v-else-if="contributions.length === 0" class="text-center py-3">
            <span class="text-xs text-slate-400">Belum ada kontribusi</span>
          </div>
          <div v-else class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="c in contributions"
              :key="c.id"
              class="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div>
                <p class="text-xs font-medium text-slate-700 dark:text-slate-300">+{{ formatCurrency(c.amount) }}</p>
                <p v-if="c.note" class="text-[10px] text-slate-400 dark:text-slate-500">{{ c.note }}</p>
              </div>
              <span class="text-[10px] text-slate-400 dark:text-slate-500">{{ formatDateTime(c.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in" @click.self="closeFormModal">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeFormModal" />

      <div class="relative w-full md:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up border-t md:border border-slate-200 dark:border-slate-800">
        <div class="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-5 py-4 flex items-center justify-between z-10">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ editingGoal ? 'Edit Target' : 'Target Baru' }}
          </h2>
          <button @click="closeFormModal" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleFormSubmit" class="p-5 space-y-5">
          <!-- Name -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nama Target *</label>
            <input
              v-model="form.name"
              type="text"
              class="input"
              placeholder="Contoh: Liburan Bali, iPhone baru..."
              required
              maxlength="100"
            />
          </div>

          <!-- Target Amount -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jumlah Target *</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500">Rp</span>
              <input
                v-model="form.targetAmount"
                type="number"
                class="input pl-12"
                placeholder="0"
                required
                min="10000"
                step="1000"
              />
            </div>
          </div>

          <!-- Quick Amount Buttons -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="preset in [1000000, 5000000, 10000000, 25000000, 50000000]"
              :key="preset"
              type="button"
              @click="form.targetAmount = preset"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
              :class="form.targetAmount == preset
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'"
            >
              {{ formatCurrency(preset) }}
            </button>
          </div>

          <!-- Target Date (optional) -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Tanggal (opsional)</label>
            <input
              v-model="form.targetDate"
              type="date"
              class="input"
              :min="todayStr"
            />
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Kosongkan jika tanpa batas waktu</p>
          </div>

          <!-- Icon -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ikon</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="emoji in iconOptions"
                :key="emoji"
                type="button"
                @click="form.icon = emoji"
                class="w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all"
                :class="form.icon === emoji
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'"
              >
                {{ emoji }}
              </button>
            </div>
          </div>

          <!-- Color -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Warna</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in colorOptions"
                :key="c"
                type="button"
                @click="form.color = c"
                class="w-8 h-8 rounded-full border-2 transition-all"
                :class="form.color === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'"
                :style="{ backgroundColor: c }"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeFormModal" class="btn btn-secondary flex-1 h-11">Batal</button>
            <button type="submit" :disabled="submitting" class="btn btn-primary flex-1 h-11">
              {{ submitting ? 'Menyimpan...' : (editingGoal ? 'Simpan' : 'Buat Target') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Contribute Modal -->
    <div v-if="showContributeModal" class="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in" @click.self="closeContributeModal">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeContributeModal" />

      <div class="relative w-full md:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl animate-slide-up border-t md:border border-slate-200 dark:border-slate-800">
        <div class="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-5 py-4 flex items-center justify-between z-10">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Tambah Tabungan</h2>
          <button @click="closeContributeModal" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleContribute" class="p-5 space-y-4">
          <!-- Goal Info -->
          <div v-if="contributingGoal" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :style="{ backgroundColor: contributingGoal.color + '18' }">
              {{ contributingGoal.icon }}
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ contributingGoal.name }}</p>
              <p class="text-xs text-slate-400">Sisa {{ formatCurrency(contributingGoal.remaining) }}</p>
            </div>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jumlah *</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500">Rp</span>
              <input
                v-model="contributeForm.amount"
                type="number"
                class="input pl-12"
                placeholder="0"
                required
                min="1000"
                step="1000"
              />
            </div>
          </div>

          <!-- Quick Amount -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="preset in [50000, 100000, 250000, 500000, 1000000]"
              :key="preset"
              type="button"
              @click="contributeForm.amount = preset"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
              :class="contributeForm.amount == preset
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'"
            >
              {{ formatCurrency(preset) }}
            </button>
          </div>

          <!-- Note -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Catatan (opsional)</label>
            <input
              v-model="contributeForm.note"
              type="text"
              class="input"
              placeholder="Contoh: Bonus bulan ini"
              maxlength="200"
            />
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeContributeModal" class="btn btn-secondary flex-1 h-11">Batal</button>
            <button type="submit" :disabled="submitting" class="btn btn-primary flex-1 h-11">
              {{ submitting ? 'Menyimpan...' : 'Tambah' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSavingsGoals } from '@/composables/useSavingsGoals'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/formatters'

const {
  goals,
  loading,
  contributions,
  activeGoals,
  completedGoals,
  totalSaved,
  totalTarget,
  loadGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  loadContributions,
} = useSavingsGoals()

const toast = useToast()

// State
const activeTab = ref('active')
const showFormModal = ref(false)
const showContributeModal = ref(false)
const editingGoal = ref(null)
const contributingGoal = ref(null)
const expandedGoalId = ref(null)
const contributionsLoading = ref(false)
const submitting = ref(false)

const form = ref({
  name: '',
  targetAmount: '',
  targetDate: '',
  icon: '🎯',
  color: '#10B981',
})

const contributeForm = ref({
  amount: '',
  note: '',
})

// Constants
const iconOptions = ['🎯', '✈️', '🏠', '🚗', '📱', '💻', '🎓', '💍', '🏖️', '🎮', '👶', '💰', '🏥', '📚', '🎁']
const colorOptions = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16']

const todayStr = new Date().toISOString().split('T')[0]

// Computed
const displayedGoals = computed(() => {
  return activeTab.value === 'active' ? activeGoals.value : completedGoals.value
})

// Methods
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const openCreateModal = () => {
  editingGoal.value = null
  form.value = { name: '', targetAmount: '', targetDate: '', icon: '🎯', color: '#10B981' }
  showFormModal.value = true
}

const openEditModal = (goal) => {
  editingGoal.value = goal
  form.value = {
    name: goal.name,
    targetAmount: goal.target_amount,
    targetDate: goal.target_date || '',
    icon: goal.icon || '🎯',
    color: goal.color || '#10B981',
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  editingGoal.value = null
}

const openContributeModal = (goal) => {
  contributingGoal.value = goal
  contributeForm.value = { amount: '', note: '' }
  showContributeModal.value = true
}

const closeContributeModal = () => {
  showContributeModal.value = false
  contributingGoal.value = null
}

const handleFormSubmit = async () => {
  if (!form.value.name.trim()) {
    toast.warning('Nama target wajib diisi')
    return
  }
  if (!form.value.targetAmount || form.value.targetAmount <= 0) {
    toast.warning('Jumlah target harus lebih dari 0')
    return
  }

  submitting.value = true
  try {
    if (editingGoal.value) {
      await updateGoal(editingGoal.value.id, {
        name: form.value.name,
        targetAmount: parseFloat(form.value.targetAmount),
        targetDate: form.value.targetDate || null,
        icon: form.value.icon,
        color: form.value.color,
      })
      toast.success('Target berhasil diupdate')
    } else {
      await createGoal({
        name: form.value.name,
        targetAmount: parseFloat(form.value.targetAmount),
        targetDate: form.value.targetDate || null,
        icon: form.value.icon,
        color: form.value.color,
      })
      toast.success('Target berhasil dibuat')
    }
    closeFormModal()
  } catch (err) {
    toast.error(err.message || 'Gagal menyimpan target')
  } finally {
    submitting.value = false
  }
}

const handleContribute = async () => {
  if (!contributeForm.value.amount || contributeForm.value.amount <= 0) {
    toast.warning('Masukkan jumlah tabungan')
    return
  }

  submitting.value = true
  try {
    await addContribution(
      contributingGoal.value.id,
      parseFloat(contributeForm.value.amount),
      contributeForm.value.note
    )
    toast.success('Tabungan berhasil ditambahkan!')
    closeContributeModal()
  } catch (err) {
    toast.error(err.message || 'Gagal menambah tabungan')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (goal) => {
  if (!confirm(`Hapus target "${goal.name}"? Semua riwayat kontribusi juga akan dihapus.`)) return

  try {
    await deleteGoal(goal.id)
    toast.success('Target berhasil dihapus')
  } catch (err) {
    toast.error(err.message || 'Gagal menghapus target')
  }
}

const toggleHistory = async (goalId) => {
  if (expandedGoalId.value === goalId) {
    expandedGoalId.value = null
    return
  }

  expandedGoalId.value = goalId
  contributionsLoading.value = true
  try {
    await loadContributions(goalId)
  } catch (err) {
    toast.error('Gagal memuat riwayat')
  } finally {
    contributionsLoading.value = false
  }
}

onMounted(() => {
  loadGoals()
})
</script>
