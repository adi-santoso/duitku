<template>
  <div class="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in" @click.self="$emit('close')">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />

    <!-- Modal -->
    <div class="relative w-full md:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up border-t md:border border-slate-200 dark:border-slate-800">
      <!-- Header -->
      <div class="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-5 py-4 flex items-center justify-between z-10">
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ isEditing ? 'Edit Transaksi' : (type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran') }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ isEditing ? 'Ubah detail transaksi' : 'Isi detail transaksi' }}</p>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-5 space-y-5">
        <!-- Category -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Kategori *</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="category in categories"
              :key="category.id"
              type="button"
              @click="form.categoryId = category.id"
              class="p-3 rounded-xl border-2 transition-all text-center"
              :class="form.categoryId === category.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
            >
              <span class="text-xl block mb-1">{{ category.icon }}</span>
              <span class="text-[11px] font-medium block truncate text-slate-600 dark:text-slate-400">{{ category.name }}</span>
            </button>
          </div>
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jumlah *</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500">Rp</span>
            <input
              v-model="form.amount"
              type="number"
              class="input pl-12"
              placeholder="0"
              required
              min="0"
              step="1000"
            />
          </div>
        </div>

        <!-- Date -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tanggal *</label>
          <input
            v-model="form.transactionDate"
            type="date"
            class="input"
            required
            :max="today"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Deskripsi</label>
          <textarea
            v-model="form.description"
            class="input resize-none"
            rows="3"
            placeholder="Catatan tambahan (opsional)"
          ></textarea>
        </div>

        <!-- Receipt Image -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Foto Struk</label>
          <div class="space-y-2">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileChange"
              class="hidden"
            />

            <button
              v-if="!form.receiptImage"
              type="button"
              @click="$refs.fileInput.click()"
              class="w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 transition-all"
            >
              <svg class="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <span class="text-sm text-slate-400 dark:text-slate-500">Klik untuk upload foto</span>
            </button>

            <div v-else class="relative rounded-xl overflow-hidden">
              <img :src="form.receiptImage" class="w-full h-48 object-cover" />
              <button
                type="button"
                @click="removeImage"
                class="absolute top-2 right-2 p-2 bg-red-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>

            <p v-if="imageError" class="text-sm text-red-600 dark:text-red-400">{{ imageError }}</p>
          </div>
        </div>

        <!-- Recurring -->
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <input
            v-model="form.isRecurring"
            type="checkbox"
            id="recurring"
            class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500"
          />
          <label for="recurring" class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Transaksi Berulang</label>
        </div>

        <div v-if="form.isRecurring">
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Frekuensi</label>
          <select v-model="form.recurringFrequency" class="input">
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button type="button" @click="$emit('close')" class="btn btn-secondary flex-1 h-11">
            Batal
          </button>
          <button type="submit" class="btn btn-primary flex-1 h-11" :disabled="loading">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ loading ? 'Menyimpan...' : (isEditing ? 'Update' : 'Simpan') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCategories } from '@/composables/useCategories'
import { useTransactions } from '@/composables/useTransactions'
import { useImageCompression } from '@/composables/useImageCompression'
import { formatDateInput } from '@/utils/dateHelpers'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['income', 'expense'].includes(value)
  },
  transaction: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const isEditing = computed(() => !!props.transaction)

const { loadCategories, categories: allCategories } = useCategories()
const { addTransaction, updateTransaction } = useTransactions()
const { compressImage, validateImage } = useImageCompression()

const loading = ref(false)
const imageError = ref('')
const fileInput = ref(null)

const form = ref({
  categoryId: props.transaction ? props.transaction.category_id : null,
  amount: props.transaction ? props.transaction.amount : '',
  transactionDate: props.transaction ? props.transaction.transaction_date : formatDateInput(new Date()),
  description: props.transaction ? (props.transaction.description || '') : '',
  receiptImage: props.transaction ? props.transaction.receipt_image : null,
  isRecurring: props.transaction ? !!props.transaction.is_recurring : false,
  recurringFrequency: props.transaction ? (props.transaction.recurring_frequency || 'monthly') : 'monthly'
})

const today = formatDateInput(new Date())

const categories = computed(() => {
  return allCategories.value.filter(cat => cat.type === props.type)
})

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  imageError.value = ''

  try {
    validateImage(file)
    const compressed = await compressImage(file)
    form.value.receiptImage = compressed
  } catch (error) {
    imageError.value = error.message
    fileInput.value.value = ''
  }
}

const removeImage = () => {
  form.value.receiptImage = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSubmit = async () => {
  if (!form.value.categoryId) {
    alert('Pilih kategori terlebih dahulu')
    return
  }

  loading.value = true

  try {
    const data = {
      type: props.type,
      categoryId: form.value.categoryId,
      amount: parseFloat(form.value.amount),
      transactionDate: form.value.transactionDate,
      description: form.value.description,
      receiptImage: form.value.receiptImage,
      isRecurring: form.value.isRecurring,
      recurringFrequency: form.value.isRecurring ? form.value.recurringFrequency : null
    }

    if (isEditing.value) {
      await updateTransaction(props.transaction.id, data)
    } else {
      await addTransaction(data)
    }

    emit('saved')
  } catch (error) {
    alert('Gagal menyimpan transaksi: ' + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>
