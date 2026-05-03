<template>
  <div class="space-y-4 lg:space-y-6 pb-20 lg:pb-0 animate-fade-in">
    <!-- Expense Categories -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Kategori Pengeluaran</h2>
        <div class="flex items-center gap-2">
          <span class="badge badge-red">{{ expenseCategories.length }}</span>
          <button
            @click="openAddModal('expense')"
            class="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div v-for="i in 8" :key="i" class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse">
          <div class="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 mx-auto mb-2"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto w-16"></div>
        </div>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="cat in expenseCategories"
          :key="cat.id"
          class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all text-center group relative"
          @click="openEditModal(cat)"
        >
          <!-- Delete button (custom only) -->
          <button
            v-if="!cat.is_default"
            @click.stop="confirmDelete(cat)"
            class="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 dark:bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform cursor-pointer"
            :style="{ backgroundColor: cat.color + '18' }"
          >
            {{ cat.icon }}
          </div>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300 block truncate">{{ cat.name }}</span>
          <span v-if="cat.is_default" class="text-[10px] text-slate-400 dark:text-slate-500">Default</span>
          <span v-else class="text-[10px] text-primary-500">Custom</span>
        </div>
      </div>
    </div>

    <!-- Income Categories -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Kategori Pemasukan</h2>
        <div class="flex items-center gap-2">
          <span class="badge badge-green">{{ incomeCategories.length }}</span>
          <button
            @click="openAddModal('income')"
            class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse">
          <div class="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 mx-auto mb-2"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto w-16"></div>
        </div>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="cat in incomeCategories"
          :key="cat.id"
          class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all text-center group relative"
          @click="openEditModal(cat)"
        >
          <!-- Delete button (custom only) -->
          <button
            v-if="!cat.is_default"
            @click.stop="confirmDelete(cat)"
            class="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 dark:bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform cursor-pointer"
            :style="{ backgroundColor: cat.color + '18' }"
          >
            {{ cat.icon }}
          </div>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300 block truncate">{{ cat.name }}</span>
          <span v-if="cat.is_default" class="text-[10px] text-slate-400 dark:text-slate-500">Default</span>
          <span v-else class="text-[10px] text-primary-500">Custom</span>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in" @click.self="closeModal">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />
      <div class="relative w-full md:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl animate-slide-up border-t md:border border-slate-200 dark:border-slate-800">
        <!-- Modal Header -->
        <div class="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ isEditing ? 'Edit Kategori' : 'Tambah Kategori' }}
          </h3>
          <button @click="closeModal" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-5 space-y-4">
          <!-- Type (only for add) -->
          <div v-if="!isEditing">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Tipe</label>
            <div class="flex gap-2">
              <button
                @click="form.type = 'expense'"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border"
                :class="form.type === 'expense' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'"
              >
                Pengeluaran
              </button>
              <button
                @click="form.type = 'income'"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border"
                :class="form.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'"
              >
                Pemasukan
              </button>
            </div>
          </div>

          <!-- Name -->
          <div>
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Nama Kategori</label>
            <input
              v-model="form.name"
              type="text"
              class="input"
              placeholder="Contoh: Subscription"
              maxlength="30"
            />
          </div>

          <!-- Icon -->
          <div>
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Icon (Emoji)</label>
            <div class="flex items-center gap-3">
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl border border-slate-200 dark:border-slate-700"
                :style="{ backgroundColor: (form.color || '#94a3b8') + '18' }"
              >
                {{ form.icon || '?' }}
              </div>
              <input
                v-model="form.icon"
                type="text"
                class="input flex-1"
                placeholder="Paste emoji di sini"
                maxlength="4"
              />
            </div>
            <!-- Quick emoji picker -->
            <div class="flex flex-wrap gap-2 mt-2">
              <button
                v-for="emoji in quickEmojis"
                :key="emoji"
                @click="form.icon = emoji"
                class="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                :class="{ 'ring-2 ring-primary-500 border-primary-500': form.icon === emoji }"
              >
                {{ emoji }}
              </button>
            </div>
          </div>

          <!-- Color -->
          <div>
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Warna</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in colorOptions"
                :key="color"
                @click="form.color = color"
                class="w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                :class="form.color === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'"
                :style="{ backgroundColor: color }"
              />
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-5 py-4 border-t border-slate-200/80 dark:border-slate-800/80 flex gap-3">
          <button @click="closeModal" class="btn btn-secondary flex-1">Batal</button>
          <button @click="handleSubmit" :disabled="saving" class="btn btn-primary flex-1">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ isEditing ? 'Simpan' : 'Tambah' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" @click.self="showDeleteModal = false">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteModal = false" />
      <div class="relative w-full max-w-sm mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-slide-up border border-slate-200 dark:border-slate-800 p-6 text-center">
        <div class="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Hapus Kategori?</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Kategori <strong>"{{ deletingCategory?.name }}"</strong> akan dihapus. Transaksi yang menggunakan kategori ini tidak akan terpengaruh.
        </p>
        <div class="flex gap-3">
          <button @click="showDeleteModal = false" class="btn btn-secondary flex-1">Batal</button>
          <button @click="handleDelete" :disabled="saving" class="btn btn-danger flex-1">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategories } from '@/composables/useCategories'
import { useToast } from '@/composables/useToast'

const { expenseCategories, incomeCategories, loadCategories, addCategory, updateCategory, deleteCategory } = useCategories()
const toast = useToast()

const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingCategory = ref(null)
const deletingCategory = ref(null)

const form = ref({
  name: '',
  type: 'expense',
  icon: '',
  color: '#FF6B6B'
})

const quickEmojis = ['💸', '🏦', '📱', '🎬', '✈️', '🐶', '💪', '📦', '🎵', '☕', '🍕', '🚌', '💊', '📖', '🎁', '💼']

const colorOptions = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DFE6E9', '#74B9FF', '#A29BFE', '#FD79A8', '#00B894',
  '#00CEC9', '#FDCB6E', '#E17055', '#636E72', '#6C5CE7'
]

const openAddModal = (type) => {
  isEditing.value = false
  editingCategory.value = null
  form.value = { name: '', type, icon: '', color: '#FF6B6B' }
  showModal.value = true
}

const openEditModal = (cat) => {
  // Only allow editing custom categories
  if (cat.is_default) {
    toast.info('Kategori default tidak bisa diedit')
    return
  }
  isEditing.value = true
  editingCategory.value = cat
  form.value = {
    name: cat.name,
    type: cat.type,
    icon: cat.icon || '',
    color: cat.color || '#FF6B6B'
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
}

const confirmDelete = (cat) => {
  deletingCategory.value = cat
  showDeleteModal.value = true
}

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    toast.warning('Masukkan nama kategori')
    return
  }
  if (!form.value.icon.trim()) {
    toast.warning('Pilih atau masukkan icon emoji')
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await updateCategory(editingCategory.value.id, form.value.name, form.value.icon, form.value.color)
      toast.success('Kategori berhasil diupdate')
    } else {
      await addCategory(form.value.name, form.value.type, form.value.icon, form.value.color)
      toast.success('Kategori berhasil ditambahkan')
    }
    closeModal()
  } catch (error) {
    toast.error('Gagal menyimpan kategori: ' + error.message)
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  saving.value = true
  try {
    await deleteCategory(deletingCategory.value.id)
    toast.success(`Kategori "${deletingCategory.value.name}" berhasil dihapus`)
    showDeleteModal.value = false
    deletingCategory.value = null
  } catch (error) {
    toast.error('Gagal menghapus kategori: ' + error.message)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  loading.value = false
})
</script>
