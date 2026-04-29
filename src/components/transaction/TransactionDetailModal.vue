<template>
  <div class="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in" @click.self="$emit('close')">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />

    <!-- Modal -->
    <div class="relative w-full md:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up border-t md:border border-slate-200 dark:border-slate-800">
      <!-- Header -->
      <div class="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-5 py-4 flex items-center justify-between z-10">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Detail Transaksi</h2>
        <button @click="$emit('close')" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-5 space-y-5">
        <!-- Category & Amount Hero -->
        <div class="text-center py-2">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
            :style="{ backgroundColor: transaction.category_color + '18' }"
          >
            {{ transaction.category_icon }}
          </div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{{ transaction.category_name }}</p>
          <p
            class="text-3xl font-bold"
            :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
          >
            {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
          </p>
          <span
            class="badge mt-2"
            :class="transaction.type === 'income' ? 'badge-green' : 'badge-red'"
          >
            {{ transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
          </span>
        </div>

        <!-- Details -->
        <div class="space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-500 dark:text-slate-400">Tanggal</span>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ formatDate(transaction.transaction_date, 'long') }}</span>
          </div>

          <div v-if="transaction.description" class="flex items-start justify-between gap-4">
            <span class="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">Deskripsi</span>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 text-right">{{ transaction.description }}</span>
          </div>

          <div v-if="transaction.is_recurring" class="flex items-center justify-between">
            <span class="text-sm text-slate-500 dark:text-slate-400">Berulang</span>
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ getRecurringLabel(transaction.recurring_frequency) }}</span>
            </div>
          </div>
        </div>

        <!-- Receipt Image -->
        <div v-if="transaction.receipt_image">
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Foto Struk</p>
          <img
            :src="transaction.receipt_image"
            class="w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
            @click="showImageModal = true"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button @click="handleDelete" class="btn btn-danger flex-1 h-11">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Hapus
          </button>
          <button @click="$emit('close')" class="btn btn-secondary flex-1 h-11">
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      @click="showImageModal = false"
    >
      <img :src="transaction.receipt_image" class="max-w-full max-h-full rounded-lg" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { formatCurrency } from '@/utils/formatters'
import { formatDate } from '@/utils/dateHelpers'

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'deleted'])

const { deleteTransaction } = useTransactions()
const showImageModal = ref(false)

const getRecurringLabel = (frequency) => {
  const labels = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan'
  }
  return labels[frequency] || frequency
}

const handleDelete = () => {
  if (confirm('Yakin ingin menghapus transaksi ini?')) {
    deleteTransaction(props.transaction.id)
    emit('deleted')
  }
}
</script>
