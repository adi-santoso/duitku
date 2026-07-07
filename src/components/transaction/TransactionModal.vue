<template>
  <BottomSheet
    :model-value="true"
    @update:model-value="$emit('close')"
    :snap-to-top="true"
    content-class="p-0"
  >
    <template #header>
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ isEditing ? 'Edit Transaksi' : (type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran') }}
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ isEditing ? 'Ubah detail transaksi' : 'Isi detail transaksi' }}</p>
      </div>
    </template>

    <form @submit.prevent="handleSubmit" id="transaction-form" class="p-5 space-y-5">
        <!-- Templates Quick Select -->
        <div v-if="!isEditing && sortedTemplates.length > 0">
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Template</label>
          <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <button
              v-for="tpl in sortedTemplates.slice(0, 5)"
              :key="tpl.id"
              type="button"
              @click="applyTemplate(tpl)"
              class="flex-shrink-0 px-3 py-2 rounded-xl border transition-all text-left"
              :class="appliedTemplateId === tpl.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'"
            >
              <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ tpl.name }}</p>
              <p class="text-[10px] text-slate-400 dark:text-slate-500">Rp {{ Number(tpl.amount).toLocaleString('id-ID') }}</p>
            </button>
          </div>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Kategori *</label>

          <!-- Smart Suggestions -->
          <div v-if="suggestedCategories.length > 0 && !form.categoryId" class="mb-3 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div class="flex-1">
                <p class="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5">Saran kategori</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="cat in suggestedCategories"
                    :key="cat.id"
                    type="button"
                    @click="form.categoryId = cat.id"
                    class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-500/30 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
                  >
                    <span>{{ cat.icon }}</span>
                    <span>{{ cat.name }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

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

          <!-- Quick Amount Chips -->
          <div class="mt-3 space-y-2">
            <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                v-for="amount in quickAmounts"
                :key="amount"
                type="button"
                @click="form.amount = amount"
                class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                :class="Number(form.amount) === amount
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
              >
                {{ formatQuickAmount(amount) }}
              </button>
            </div>

            <!-- Recently Used Amounts -->
            <div v-if="recentAmounts.length > 0" class="flex items-center gap-2 text-xs">
              <span class="text-slate-400 dark:text-slate-500 flex-shrink-0">Terakhir:</span>
              <div class="flex gap-2 overflow-x-auto scrollbar-hide">
                <button
                  v-for="(amount, idx) in recentAmounts"
                  :key="idx"
                  type="button"
                  @click="form.amount = amount"
                  class="flex-shrink-0 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
                >
                  {{ formatQuickAmount(amount) }}
                </button>
              </div>
            </div>
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
          <BaseSelect v-model="form.recurringFrequency">
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </BaseSelect>
        </div>

        <!-- Save as Template -->
        <div v-if="!isEditing" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <input
            v-model="saveAsTemplateChecked"
            type="checkbox"
            id="save-template"
            class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500"
          />
          <label for="save-template" class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1">Simpan sebagai template</label>
        </div>
        <div v-if="saveAsTemplateChecked && !isEditing">
          <input
            v-model="templateName"
            type="text"
            class="input"
            placeholder="Nama template (contoh: Kopi pagi)"
            maxlength="50"
          />
        </div>

    </form>

    <template #footer>
      <div class="flex gap-3">
        <button type="button" @click="$emit('close')" class="btn btn-secondary flex-1 h-11">
          Batal
        </button>
        <button type="button" @click="handleSubmit" class="btn btn-primary flex-1 h-11" :disabled="isSaving">
          <svg v-if="isSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Update' : 'Simpan') }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { useCategories } from '@/composables/useCategories'
import { useTransactions } from '@/composables/useTransactions'
import { useTransactionTemplates } from '@/composables/useTransactionTemplates'
import { useImageCompression } from '@/composables/useImageCompression'
import { useToast } from '@/composables/useToast'
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
const { addTransaction, updateTransaction, isSaving } = useTransactions()
const { getSortedTemplates: getTemplates, useTemplate, saveAsTemplate } = useTransactionTemplates()
const { compressImage, validateImage } = useImageCompression()
const { success, error: showError } = useToast()

const imageError = ref('')
const fileInput = ref(null)
const saveAsTemplateChecked = ref(false)
const templateName = ref('')
const appliedTemplateId = ref(null)

const sortedTemplates = computed(() => getTemplates(props.type))

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

// Smart category suggestions based on description
const suggestedCategories = computed(() => {
  if (!form.value.description || form.value.description.length < 3) {
    return []
  }

  const desc = form.value.description.toLowerCase()
  const keywords = {
    'Makanan & Minuman': ['makan', 'minum', 'kopi', 'nasi', 'sarapan', 'lunch', 'dinner', 'snack', 'jajan', 'restoran', 'cafe', 'warteg', 'bakso', 'soto', 'ayam', 'nasi goreng', 'mie'],
    'Transport': ['ojek', 'grab', 'gojek', 'taxi', 'bensin', 'parkir', 'tol', 'kereta', 'busway', 'transjakarta', 'motor', 'mobil', 'uber'],
    'Belanja': ['beli', 'belanja', 'shopping', 'toko', 'marketplace', 'tokopedia', 'shopee', 'lazada', 'blibli', 'olshop'],
    'Tagihan': ['listrik', 'air', 'wifi', 'internet', 'pulsa', 'token', 'pdam', 'pln', 'telkom', 'indihome', 'billing', 'subscription', 'netflix', 'spotify'],
    'Hiburan': ['nonton', 'cinema', 'game', 'streaming', 'netflix', 'spotify', 'youtube', 'main', 'rekreasi', 'wisata', 'liburan'],
    'Kesehatan': ['dokter', 'obat', 'apotek', 'rumah sakit', 'klinik', 'medical', 'vitamin', 'check up', 'konsultasi'],
    'Pendidikan': ['kursus', 'buku', 'sekolah', 'kuliah', 'les', 'training', 'workshop', 'seminar', 'course'],
    'Rumah Tangga': ['laundry', 'cuci', 'bersih', 'sabun', 'deterjen', 'peralatan', 'dapur', 'kamar']
  }

  const matches = []
  for (const [catName, catKeywords] of Object.entries(keywords)) {
    const category = categories.value.find(c => c.name === catName)
    if (!category) continue

    for (const keyword of catKeywords) {
      if (desc.includes(keyword)) {
        matches.push({ category, matchCount: 1 })
        break
      }
    }
  }

  // Sort by match relevance and return top 3
  return matches
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 3)
    .map(m => m.category)
})

// Quick amount presets
const quickAmounts = computed(() => {
  if (props.type === 'expense') {
    return [5000, 10000, 20000, 50000, 100000, 200000, 500000]
  } else {
    return [100000, 500000, 1000000, 2000000, 5000000, 10000000]
  }
})

// Get recently used amounts from localStorage
const recentAmounts = computed(() => {
  try {
    const stored = localStorage.getItem(`duitku_recent_amounts_${props.type}`)
    if (!stored) return []
    const amounts = JSON.parse(stored)
    return amounts.slice(0, 3) // Show only 3 most recent
  } catch {
    return []
  }
})

// Format quick amount for display
const formatQuickAmount = (amount) => {
  if (amount >= 1000000) {
    const juta = amount / 1000000
    return juta % 1 === 0 ? `${juta}jt` : `${juta.toFixed(1)}jt`
  } else if (amount >= 1000) {
    const ribu = amount / 1000
    return ribu % 1 === 0 ? `${ribu}rb` : `${ribu.toFixed(1)}rb`
  }
  return amount.toLocaleString('id-ID')
}

// Save recently used amount
const saveRecentAmount = (amount) => {
  try {
    const key = `duitku_recent_amounts_${props.type}`
    const stored = localStorage.getItem(key)
    let amounts = stored ? JSON.parse(stored) : []

    // Remove if exists
    amounts = amounts.filter(a => a !== amount)

    // Add to front
    amounts.unshift(amount)

    // Keep only last 5
    amounts = amounts.slice(0, 5)

    localStorage.setItem(key, JSON.stringify(amounts))
  } catch {
    // Ignore localStorage errors
  }
}

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

const applyTemplate = (tpl) => {
  appliedTemplateId.value = tpl.id
  form.value.categoryId = tpl.categoryId
  form.value.amount = tpl.amount
  form.value.description = tpl.description || ''
  useTemplate(tpl.id)
}

const handleSubmit = async () => {
  if (!form.value.categoryId) {
    showError('Pilih kategori terlebih dahulu')
    return
  }

  try {
    const selectedCategory = categories.value.find(c => c.id === form.value.categoryId)

    const data = {
      type: props.type,
      categoryId: form.value.categoryId,
      amount: parseFloat(form.value.amount),
      transactionDate: form.value.transactionDate,
      description: form.value.description,
      receiptImage: form.value.receiptImage,
      isRecurring: form.value.isRecurring,
      recurringFrequency: form.value.isRecurring ? form.value.recurringFrequency : null,
      // Add category info for optimistic update
      category_name: selectedCategory?.name,
      category_icon: selectedCategory?.icon,
      category_color: selectedCategory?.color,
      category_id: form.value.categoryId
    }

    if (isEditing.value) {
      await updateTransaction(props.transaction.id, data)
      success('Transaksi berhasil diperbarui')
    } else {
      await addTransaction(data)
      success('Transaksi berhasil ditambahkan')

      // Save recently used amount
      saveRecentAmount(data.amount)

      // Save as template if checked
      if (saveAsTemplateChecked.value && templateName.value.trim()) {
        saveAsTemplate(data, templateName.value.trim())
        success('Template disimpan!')
      }
    }

    emit('saved')
  } catch (err) {
    console.error('Failed to save transaction:', err)
    showError('Gagal menyimpan transaksi')
  }
}

onMounted(async () => {
  await loadCategories()
})

// Watch for changes to props.transaction ID (different transaction, not same transaction updated)
watch(() => props.transaction?.id, (newId, oldId) => {
  // Only update form when opening a different transaction or closing/opening modal
  if (newId !== oldId) {
    if (props.transaction) {
      form.value = {
        categoryId: props.transaction.category_id,
        amount: props.transaction.amount,
        transactionDate: props.transaction.transaction_date,
        description: props.transaction.description || '',
        receiptImage: props.transaction.receipt_image,
        isRecurring: !!props.transaction.is_recurring,
        recurringFrequency: props.transaction.recurring_frequency || 'monthly'
      }
    } else {
      // Reset form when no transaction (creating new)
      form.value = {
        categoryId: null,
        amount: '',
        transactionDate: formatDateInput(new Date()),
        description: '',
        receiptImage: null,
        isRecurring: false,
        recurringFrequency: 'monthly'
      }
    }
  }
}, { immediate: false })

</script>
