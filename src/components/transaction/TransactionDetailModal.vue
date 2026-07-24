<template>
  <div class="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in" @click.self="$emit('close')">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" @click="$emit('close')" />

    <!-- Modal -->
    <div class="relative w-full md:max-w-lg bg-surface dark:bg-ink-900 rounded-t-3xl md:rounded-3xl shadow-float max-h-[92vh] overflow-y-auto animate-slide-up border border-ink-900/10 dark:border-white/10">
      <!-- Top Close Bar -->
      <div class="sticky top-0 z-20 bg-surface/90 dark:bg-ink-900/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between border-b border-ink-900/10 dark:border-white/10">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full" :class="transaction.type === 'income' ? 'bg-lime-deep dark:bg-lime' : 'bg-coral'"></span>
          <h2 class="font-display text-sm font-extrabold text-ink-900 dark:text-white uppercase tracking-wider">Detail Transaksi</h2>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 rounded-2xl hover:bg-canvas dark:hover:bg-ink-800 text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors"
          aria-label="Tutup"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-5 md:p-6 space-y-5 pb-24 lg:pb-6">
        <!-- Creative Hero Card -->
        <div
          class="relative overflow-hidden p-6 rounded-3xl shadow-lg transition-all duration-300"
          :class="transaction.type === 'income'
            ? 'bg-lime text-ink-900 shadow-lime/20'
            : 'bg-coral text-white shadow-coral/20'"
        >
          <!-- Background Decorative Accent Rings -->
          <div class="absolute -right-12 -bottom-16 w-48 h-48 rounded-full border-[28px] opacity-20 pointer-events-none" :class="transaction.type === 'income' ? 'border-ink-900' : 'border-white'"></div>
          <div class="absolute -right-4 -top-10 w-24 h-24 rounded-2xl opacity-15 rotate-12 pointer-events-none" :class="transaction.type === 'income' ? 'bg-ink-900' : 'bg-white'"></div>

          <div class="relative z-10">
            <!-- Header Badge & Category Icon -->
            <div class="flex items-center justify-between gap-3 mb-4">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                  :class="transaction.type === 'income' ? 'bg-ink-900/10 text-ink-900' : 'bg-white/20 text-white'"
                >
                  {{ transaction.category_icon }}
                </div>
                <span class="font-extrabold text-sm tracking-tight opacity-95">{{ transaction.category_name }}</span>
              </div>

              <span
                class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm"
                :class="transaction.type === 'income' ? 'bg-ink-900 text-white' : 'bg-white/25 text-white'"
              >
                {{ transaction.type === 'income' ? '✦ Pemasukan' : '✦ Pengeluaran' }}
              </span>
            </div>

            <!-- Big Amount Display -->
            <div class="my-2">
              <span class="text-xs font-extrabold uppercase tracking-widest opacity-75">Nominal Transaksi</span>
              <h1 class="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mt-1">
                {{ transaction.type === 'income' ? '+' : '−' }} {{ formatCurrency(transaction.amount) }}
              </h1>
            </div>
          </div>
        </div>

        <!-- Structured Details Grid Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Tanggal Card -->
          <div class="p-4 rounded-2xl bg-canvas/70 dark:bg-ink-800/70 border border-ink-900/5 dark:border-white/5 space-y-1">
            <div class="flex items-center gap-1.5 text-ink-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Tanggal
            </div>
            <p class="font-bold text-xs text-ink-900 dark:text-white pt-0.5">
              {{ formatDate(transaction.transaction_date, 'long') }}
            </p>
          </div>

          <!-- Status & Berulang Card -->
          <div class="p-4 rounded-2xl bg-canvas/70 dark:bg-ink-800/70 border border-ink-900/5 dark:border-white/5 space-y-1">
            <div class="flex items-center gap-1.5 text-ink-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Berulang
            </div>
            <p class="font-bold text-xs text-ink-900 dark:text-white pt-0.5">
              {{ transaction.is_recurring ? `Ya · ${getRecurringLabel(transaction.recurring_frequency)}` : 'Sekali Transaksi' }}
            </p>
          </div>
        </div>

        <!-- Deskripsi / Catatan Full-Width Card -->
        <div class="p-4.5 rounded-2xl bg-canvas/70 dark:bg-ink-800/70 border border-ink-900/5 dark:border-white/5 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-slate-400 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Catatan / Deskripsi
            </span>
          </div>
          <p class="text-xs font-bold text-ink-900 dark:text-white leading-relaxed">
            {{ transaction.description || 'Tidak ada catatan tambahan' }}
          </p>
        </div>

        <!-- Receipt Image Preview Card -->
        <div v-if="transaction.receipt_image" class="space-y-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-slate-400">Lampiran Foto Struk</label>
          <div
            @click="showImageModal = true"
            class="group relative rounded-3xl overflow-hidden border border-ink-900/10 dark:border-white/10 cursor-pointer shadow-soft hover:shadow-float transition-all"
          >
            <img :src="transaction.receipt_image" class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div class="absolute inset-0 bg-ink-900/30 group-hover:bg-ink-900/20 transition-colors flex items-center justify-center">
              <span class="px-3.5 py-1.5 rounded-full bg-surface/90 dark:bg-ink-900/90 text-ink-900 dark:text-white font-extrabold text-xs shadow-md backdrop-blur-md">
                🔍 Klik untuk memperbesar
              </span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center gap-3 pt-2">
          <button
            @click="handleDelete"
            class="h-12 px-5 rounded-2xl font-extrabold text-xs bg-coral/15 text-coral hover:bg-coral/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Hapus
          </button>
          <button
            @click="$emit('edit', transaction)"
            class="flex-1 h-12 rounded-2xl font-extrabold text-xs bg-ink-900 text-white dark:bg-lime dark:text-ink-900 hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit Transaksi
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

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Hapus Transaksi?"
      message="Transaksi yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?"
      confirm-text="Hapus"
      cancel-text="Batal"
      variant="danger"
      icon="trash"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { formatCurrency } from '@/utils/formatters'
import { formatDate } from '@/utils/dateHelpers'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'deleted', 'edit'])

const { deleteTransaction } = useTransactions()
const showImageModal = ref(false)
const showDeleteConfirm = ref(false)

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
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  await deleteTransaction(props.transaction.id)
  emit('deleted')
}
</script>
