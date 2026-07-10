<template>
  <div class="space-y-4 lg:space-y-6 pb-20 lg:pb-0 animate-fade-in">
    <!-- Loading State -->
    <div v-if="loading && !currentProject" class="card text-center py-16">
      <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-sm text-slate-500 dark:text-slate-400">Memuat detail project...</p>
    </div>

    <!-- Content -->
    <template v-else-if="currentProject">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <button
          @click="goBack"
          class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div class="flex-1">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ currentProject.name }}</h2>
          <p v-if="currentProject.description" class="text-sm text-slate-500 dark:text-slate-400">
            {{ currentProject.description }}
          </p>
        </div>
        <button
          v-if="!currentProject.isCompleted"
          @click="openAddItemModal"
          class="btn btn-primary h-9 px-4 text-sm"
        >
          <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Item
        </button>
      </div>

      <!-- Project Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Total Budget</p>
          <p class="text-xl font-bold text-slate-900 dark:text-white">{{ formatCurrency(currentProject.totalBudget) }}</p>
        </div>
        <div class="card">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Total Belanja</p>
          <p class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ formatCurrency(currentProject.totalSpent || '0') }}</p>
        </div>
        <div class="card">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Sisa Budget</p>
          <p class="text-xl font-bold" :class="remainingBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
            {{ formatCurrency(remainingBudget) }}
          </p>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Progress Pembelian</h3>
          <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {{ progressPercentage }}%
          </span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-3">
          <div
            class="h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
            :style="{ width: `${progressPercentage}%` }"
          />
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-600 dark:text-slate-400">
            {{ purchasedItemsCount }} dari {{ totalItemsCount }} item sudah dibeli
          </span>
          <span class="text-slate-600 dark:text-slate-400">
            {{ unpurchasedItemsCount }} item tersisa
          </span>
        </div>
      </div>

      <!-- Items List -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Daftar Item</h3>
          <span class="text-sm text-slate-500 dark:text-slate-400">{{ totalItemsCount }} item</span>
        </div>

        <!-- Empty State -->
        <div v-if="totalItemsCount === 0" class="text-center py-12">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Belum ada item</p>
          <p class="text-xs text-slate-500 dark:text-slate-500">Tambahkan item yang akan dibeli untuk project ini</p>
        </div>

        <!-- Items -->
        <div v-else class="space-y-2">
          <div
            v-for="item in currentProject.items"
            :key="item.id"
            class="p-4 rounded-xl border transition-all"
            :class="item.isPurchased
              ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {{ item.name }}
                  </h4>
                  <span
                    class="flex-shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md"
                    :style="{
                      backgroundColor: item.category?.color + '15',
                      color: item.category?.color
                    }"
                  >
                    {{ item.category?.name }}
                  </span>
                </div>
                <p v-if="item.notes" class="text-xs text-slate-500 dark:text-slate-400 mb-2">{{ item.notes }}</p>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold text-slate-900 dark:text-white">
                    {{ formatCurrency(item.estimatedPrice) }}
                  </span>
                  <span v-if="item.isPurchased" class="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Sudah dibeli
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1">
                <button
                  v-if="!item.isPurchased && !currentProject.isCompleted"
                  @click="openPurchaseModal(item)"
                  class="p-2 hover:bg-primary-100 dark:hover:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg transition-colors"
                  title="Tandai sudah dibeli"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  v-if="!item.isPurchased && !currentProject.isCompleted"
                  @click="openEditItemModal(item)"
                  class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
                  title="Edit item"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  v-if="!item.isPurchased"
                  @click="confirmDeleteItem(item)"
                  class="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  title="Hapus item"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Item Modal -->
      <teleport to="body">
        <div
          v-if="showAddItemModal"
          @click="closeAllModals"
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            @click.stop
            class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in"
          >
            <div class="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Tambah Item Baru</h3>
              <button @click="closeAllModals" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleAddItem" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nama Item *</label>
                <input
                  v-model="itemForm.name"
                  type="text"
                  placeholder="Contoh: Cat Tembok"
                  required
                  maxlength="255"
                  class="input w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Kategori *</label>
                <select v-model.number="itemForm.categoryId" required class="input w-full">
                  <option :value="null" disabled>Pilih kategori</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Estimasi Harga *</label>
                <input
                  v-model.number="itemForm.estimatedPrice"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  required
                  class="input w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Catatan</label>
                <textarea
                  v-model="itemForm.notes"
                  placeholder="Catatan tambahan (opsional)"
                  rows="3"
                  class="input w-full resize-none"
                />
              </div>

              <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" @click="closeAllModals" class="btn btn-secondary flex-1">Batal</button>
                <button type="submit" :disabled="loading" class="btn btn-primary flex-1">
                  <span v-if="loading">Menyimpan...</span>
                  <span v-else>Tambah Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </teleport>

      <!-- Edit Item Modal -->
      <teleport to="body">
        <div
          v-if="showEditItemModal"
          @click="closeAllModals"
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div @click.stop class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            <div class="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Edit Item</h3>
              <button @click="closeAllModals" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleEditItem" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nama Item *</label>
                <input v-model="itemForm.name" type="text" required maxlength="255" class="input w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Kategori *</label>
                <select v-model.number="itemForm.categoryId" required class="input w-full">
                  <option :value="null" disabled>Pilih kategori</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Estimasi Harga *</label>
                <input v-model.number="itemForm.estimatedPrice" type="number" min="0" step="1000" required class="input w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Catatan</label>
                <textarea v-model="itemForm.notes" rows="3" class="input w-full resize-none" />
              </div>
              <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" @click="closeAllModals" class="btn btn-secondary flex-1">Batal</button>
                <button type="submit" :disabled="loading" class="btn btn-primary flex-1">
                  <span v-if="loading">Menyimpan...</span>
                  <span v-else>Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </teleport>

      <!-- Purchase Modal -->
      <teleport to="body">
        <div
          v-if="showPurchaseModal"
          @click="closeAllModals"
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div @click.stop class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Tandai Sudah Dibeli</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Item akan ditandai sudah dibeli dan transaksi akan otomatis dibuat
              </p>
            </div>

            <form @submit.prevent="handlePurchase" class="p-6 space-y-4">
              <div v-if="purchasingItem" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p class="text-sm font-bold text-slate-900 dark:text-white mb-1">{{ purchasingItem.name }}</p>
                <p class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ formatCurrency(purchasingItem.estimatedPrice) }}</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tanggal Pembelian *</label>
                <input v-model="purchaseForm.transactionDate" type="date" required class="input w-full" />
              </div>

              <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" @click="closeAllModals" class="btn btn-secondary flex-1">Batal</button>
                <button type="submit" :disabled="loading" class="btn btn-primary flex-1">
                  <span v-if="loading">Memproses...</span>
                  <span v-else>Tandai Sudah Dibeli</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </teleport>

      <!-- Delete Confirmation -->
      <teleport to="body">
        <div
          v-if="showDeleteConfirm"
          @click="closeAllModals"
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div @click.stop class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Hapus Item?</h3>
            </div>

            <div class="p-6">
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Item <span class="font-bold text-slate-900 dark:text-white">{{ deletingItem?.name }}</span> akan dihapus. Aksi ini tidak dapat dibatalkan.
              </p>

              <div class="flex gap-3">
                <button @click="closeAllModals" class="btn btn-secondary flex-1">Batal</button>
                <button @click="handleDeleteItem" :disabled="loading" class="btn bg-red-600 hover:bg-red-700 text-white flex-1">
                  <span v-if="loading">Menghapus...</span>
                  <span v-else>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </teleport>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjects } from '@/composables/useProjects'
import { useCategories } from '@/composables/useCategories'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const {
  currentProject,
  loading,
  error,
  fetchProjectById,
  addProjectItem,
  updateProjectItem,
  deleteProjectItem,
  markItemAsPurchased
} = useProjects()

const { categories, loadCategories } = useCategories()

const showAddItemModal = ref(false)
const showEditItemModal = ref(false)
const showPurchaseModal = ref(false)
const showDeleteConfirm = ref(false)
const editingItem = ref(null)
const deletingItem = ref(null)
const purchasingItem = ref(null)

const itemForm = ref({
  categoryId: null,
  name: '',
  estimatedPrice: 0,
  notes: ''
})

const purchaseForm = ref({
  transactionDate: new Date().toISOString().split('T')[0]
})

onMounted(async () => {
  await Promise.all([
    fetchProjectById(route.params.id),
    loadCategories()
  ])
})

const goBack = () => {
  router.push('/projects')
}

const remainingBudget = computed(() => {
  if (!currentProject.value) return 0
  return Number(currentProject.value.totalBudget) - Number(currentProject.value.totalSpent || 0)
})

const totalItemsCount = computed(() => {
  return currentProject.value?.items?.length || 0
})

const purchasedItemsCount = computed(() => {
  return currentProject.value?.items?.filter(i => i.isPurchased).length || 0
})

const unpurchasedItemsCount = computed(() => {
  return totalItemsCount.value - purchasedItemsCount.value
})

const progressPercentage = computed(() => {
  if (totalItemsCount.value === 0) return 0
  return Math.round((purchasedItemsCount.value / totalItemsCount.value) * 100)
})

const openAddItemModal = () => {
  itemForm.value = {
    categoryId: null,
    name: '',
    estimatedPrice: 0,
    notes: ''
  }
  showAddItemModal.value = true
}

const openEditItemModal = (item) => {
  editingItem.value = item
  itemForm.value = {
    categoryId: item.categoryId,
    name: item.name,
    estimatedPrice: Number(item.estimatedPrice),
    notes: item.notes || ''
  }
  showEditItemModal.value = true
}

const openPurchaseModal = (item) => {
  purchasingItem.value = item
  purchaseForm.value = {
    transactionDate: new Date().toISOString().split('T')[0]
  }
  showPurchaseModal.value = true
}

const confirmDeleteItem = (item) => {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

const closeAllModals = () => {
  showAddItemModal.value = false
  showEditItemModal.value = false
  showPurchaseModal.value = false
  showDeleteConfirm.value = false
  editingItem.value = null
  deletingItem.value = null
  purchasingItem.value = null
}

const handleAddItem = async () => {
  try {
    await addProjectItem(currentProject.value.id, itemForm.value)
    toast.success('Item berhasil ditambahkan')
    closeAllModals()
  } catch (err) {
    toast.error(error.value || 'Gagal menambahkan item')
  }
}

const handleEditItem = async () => {
  try {
    await updateProjectItem(editingItem.value.id, itemForm.value)
    toast.success('Item berhasil diupdate')
    closeAllModals()
  } catch (err) {
    toast.error(error.value || 'Gagal mengupdate item')
  }
}

const handleDeleteItem = async () => {
  try {
    await deleteProjectItem(deletingItem.value.id)
    toast.success('Item berhasil dihapus')
    closeAllModals()
  } catch (err) {
    toast.error(error.value || 'Gagal menghapus item')
  }
}

const handlePurchase = async () => {
  try {
    await markItemAsPurchased(purchasingItem.value.id, purchaseForm.value.transactionDate)
    toast.success('Item ditandai sudah dibeli & transaksi berhasil dibuat')
    closeAllModals()
  } catch (err) {
    toast.error(error.value || 'Gagal menandai item sebagai dibeli')
  }
}
</script>

