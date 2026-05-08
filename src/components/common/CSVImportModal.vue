<template>
  <div class="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in" @click.self="$emit('close')">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />

    <div class="relative w-full md:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up border-t md:border border-slate-200 dark:border-slate-800">
      <!-- Header -->
      <div class="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-5 py-4 flex items-center justify-between z-10">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Import CSV</h2>
        <button @click="$emit('close')" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-5 space-y-5">
        <!-- Step 1: Upload File -->
        <div v-if="step === 1">
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Upload file CSV dari bank statement atau spreadsheet kamu.</p>

          <input ref="fileInput" type="file" accept=".csv,.txt" @change="handleFileUpload" class="hidden" />

          <button
            @click="$refs.fileInput.click()"
            class="w-full p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 transition-all text-center"
          >
            <svg class="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Klik untuk pilih file CSV</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Format: .csv atau .txt (max 5MB)</p>
          </button>

          <p v-if="parseError" class="text-sm text-red-500 mt-2">{{ parseError }}</p>
        </div>

        <!-- Step 2: Column Mapping -->
        <div v-if="step === 2">
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">
            {{ parsedData.length }} baris ditemukan. Pilih kolom yang sesuai:
          </p>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kolom Tanggal *</label>
              <select v-model="config.dateCol" class="input text-sm">
                <option :value="null" disabled>Pilih kolom...</option>
                <option v-for="(h, i) in headers" :key="'d'+i" :value="i">{{ h }} ({{ getPreview(i) }})</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kolom Jumlah *</label>
              <select v-model="config.amountCol" class="input text-sm">
                <option :value="null" disabled>Pilih kolom...</option>
                <option v-for="(h, i) in headers" :key="'a'+i" :value="i">{{ h }} ({{ getPreview(i) }})</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kolom Deskripsi</label>
              <select v-model="config.descCol" class="input text-sm">
                <option :value="null">-- Tidak ada --</option>
                <option v-for="(h, i) in headers" :key="'desc'+i" :value="i">{{ h }} ({{ getPreview(i) }})</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kolom Tipe (Income/Expense)</label>
              <select v-model="config.typeCol" class="input text-sm">
                <option :value="null">-- Tidak ada (gunakan default) --</option>
                <option v-for="(h, i) in headers" :key="'t'+i" :value="i">{{ h }} ({{ getPreview(i) }})</option>
              </select>
            </div>

            <div v-if="config.typeCol === null">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Default</label>
              <select v-model="config.defaultType" class="input text-sm">
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Default *</label>
              <select v-model="config.categoryId" class="input text-sm">
                <option :value="null" disabled>Pilih kategori...</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.icon }} {{ cat.name }}</option>
              </select>
            </div>
          </div>

          <!-- Preview -->
          <div class="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Preview (3 baris pertama):</p>
            <div class="space-y-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 overflow-x-auto">
              <div v-for="(row, i) in parsedData.slice(0, 3)" :key="i" class="whitespace-nowrap">
                {{ headers.map((h, idx) => row[h] || '-').join(' | ') }}
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-3">
            <button @click="step = 1; reset()" class="btn btn-secondary flex-1 h-10">Kembali</button>
            <button
              @click="startImport"
              :disabled="!canImport"
              class="btn btn-primary flex-1 h-10 disabled:opacity-50"
            >
              Import {{ parsedData.length }} Transaksi
            </button>
          </div>
        </div>

        <!-- Step 3: Importing -->
        <div v-if="step === 3">
          <div class="text-center py-6">
            <div class="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Mengimport transaksi...</p>
            <p class="text-xs text-slate-400 mt-1">{{ importProgress }}% selesai</p>
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3">
              <div class="h-2 rounded-full bg-primary-500 transition-all duration-300" :style="{ width: `${importProgress}%` }" />
            </div>
          </div>
        </div>

        <!-- Step 4: Result -->
        <div v-if="step === 4 && importResult">
          <div class="text-center py-4">
            <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              :class="importResult.failed === 0 ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-amber-100 dark:bg-amber-500/15'">
              <span class="text-2xl">{{ importResult.failed === 0 ? '✅' : '⚠️' }}</span>
            </div>
            <p class="text-base font-bold text-slate-900 dark:text-white">Import Selesai</p>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-center">
              <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ importResult.success }}</p>
              <p class="text-[10px] text-emerald-600 dark:text-emerald-400">Berhasil</p>
            </div>
            <div class="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-center">
              <p class="text-lg font-bold text-red-600 dark:text-red-400">{{ importResult.failed }}</p>
              <p class="text-[10px] text-red-600 dark:text-red-400">Gagal</p>
            </div>
          </div>

          <div v-if="importResult.errors.length > 0" class="mb-4">
            <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Errors:</p>
            <div class="max-h-32 overflow-y-auto space-y-1">
              <p v-for="(err, i) in importResult.errors" :key="i" class="text-[10px] text-red-500">{{ err }}</p>
            </div>
          </div>

          <button @click="$emit('close')" class="btn btn-primary w-full h-10">Selesai</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCSVImport } from '@/composables/useCSVImport'
import { useCategories } from '@/composables/useCategories'

defineEmits(['close'])

const { parsedData, columnMapping, importing, importProgress, importResult, parseError, parseFile, importTransactions, reset } = useCSVImport()
const { categories: allCategories, loadCategories } = useCategories()

const step = ref(1)
const fileInput = ref(null)

const config = ref({
  dateCol: null,
  amountCol: null,
  descCol: null,
  typeCol: null,
  defaultType: 'expense',
  categoryId: null,
  dateFormat: 'auto',
})

const headers = computed(() => columnMapping.value.headers || [])
const categories = computed(() => allCategories.value || [])

const canImport = computed(() => {
  return config.value.dateCol !== null && config.value.amountCol !== null && config.value.categoryId !== null
})

const getPreview = (colIdx) => {
  if (parsedData.value.length === 0) return ''
  const h = headers.value[colIdx]
  const val = parsedData.value[0]?.[h] || ''
  return val.length > 20 ? val.substring(0, 20) + '...' : val
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    parseError.value = 'File terlalu besar (max 5MB)'
    return
  }

  const success = await parseFile(file)
  if (success) {
    // Auto-apply detected mapping
    const mapping = columnMapping.value.mapping || {}
    if (mapping.date !== undefined) config.value.dateCol = mapping.date
    if (mapping.amount !== undefined) config.value.amountCol = mapping.amount
    if (mapping.description !== undefined) config.value.descCol = mapping.description
    if (mapping.type !== undefined) config.value.typeCol = mapping.type

    step.value = 2
  }
}

const startImport = async () => {
  step.value = 3
  await importTransactions(config.value)
  step.value = 4
}

// Load categories on mount
loadCategories()
</script>
