<template>
  <div class="space-y-4 lg:space-y-6 pb-20 lg:pb-0 animate-fade-in">
    <!-- Settings Menu -->
    <div class="card">
      <h2 class="text-base font-bold text-slate-900 dark:text-white mb-1">Pengaturan</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Kelola data dan preferensi aplikasi</p>

      <div class="space-y-1">
        <router-link to="/categories" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Kelola Kategori</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Lihat dan atur kategori transaksi</p>
            </div>
          </div>
          <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </router-link>

        <router-link to="/budgets" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Kelola Anggaran</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Atur budget per kategori</p>
            </div>
          </div>
          <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </router-link>

        <router-link to="/team" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Kelola Tim</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Undang anggota & keuangan bersama</p>
            </div>
          </div>
          <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </router-link>

        <button @click="showExportModal = true" class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Export Data</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Download data transaksi (CSV, PDF, JSON)</p>
            </div>
          </div>
          <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <button @click="showImportModal = true" class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Import CSV</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Import transaksi dari file CSV/bank statement</p>
            </div>
          </div>
          <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Account Info -->
    <div class="card">
      <h2 class="text-base font-bold text-slate-900 dark:text-white mb-1">Akun</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Informasi akun Anda</p>

      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span class="text-sm text-slate-700 dark:text-slate-300">Email</span>
          </div>
          <span class="text-xs font-medium text-slate-600 dark:text-slate-400">
            {{ userEmail }}
          </span>
        </div>
      </div>
    </div>

    <!-- About -->
    <div class="card">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm shadow-primary-500/25 flex-shrink-0">
          <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">DuitKu</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Versi 2.0.0 — Supabase Edition</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Aplikasi pencatatan keuangan personal</p>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in" @click.self="showExportModal = false">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showExportModal = false" />
      <div class="relative w-full md:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl animate-slide-up border-t md:border border-slate-200 dark:border-slate-800">
        <div class="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Export Data</h3>
          <button @click="showExportModal = false" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-5 space-y-3">
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">Pilih format export ({{ transactions.length }} transaksi)</p>

          <!-- CSV -->
          <button @click="handleExport('csv')" class="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all group">
            <div class="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">CSV</span>
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Spreadsheet (CSV)</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Bisa dibuka di Excel, Google Sheets</p>
            </div>
          </button>

          <!-- PDF -->
          <button @click="handleExport('pdf')" class="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50/50 dark:hover:bg-red-500/5 transition-all group">
            <div class="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <span class="text-sm font-bold text-red-600 dark:text-red-400">PDF</span>
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Laporan (PDF)</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Laporan lengkap dengan ringkasan</p>
            </div>
          </button>

          <!-- JSON -->
          <button @click="handleExport('json')" class="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all group">
            <div class="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <span class="text-sm font-bold text-blue-600 dark:text-blue-400">JSON</span>
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Data Mentah (JSON)</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Untuk backup atau integrasi</p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- PWA Status -->
    <div class="card">
      <h2 class="text-base font-bold text-slate-900 dark:text-white mb-1">Aplikasi</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Status PWA dan koneksi</p>

      <div class="space-y-3">
        <!-- Online status -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-full" :class="isOnline ? 'bg-emerald-500' : 'bg-amber-500'"></div>
            <span class="text-sm text-slate-700 dark:text-slate-300">Status Koneksi</span>
          </div>
          <span class="text-xs font-medium" :class="isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
            {{ isOnline ? 'Online' : 'Offline' }}
          </span>
        </div>

        <!-- Database -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span class="text-sm text-slate-700 dark:text-slate-300">Database</span>
          </div>
          <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Supabase Cloud</span>
        </div>

        <!-- Install status -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-full" :class="isInstalled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"></div>
            <span class="text-sm text-slate-700 dark:text-slate-300">Terinstall sebagai App</span>
          </div>
          <button
            v-if="canInstall && !isInstalled"
            @click="installApp"
            class="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Install
          </button>
          <span v-else-if="isInstalled" class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Terinstall</span>
          <span v-else class="text-xs text-slate-400 dark:text-slate-500">Buka di browser</span>
        </div>
      </div>
    </div>

    <!-- CSV Import Modal -->
    <CSVImportModal v-if="showImportModal" @close="showImportModal = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { useAuth } from '@/composables/useAuth'
import { usePWA } from '@/composables/usePWA'
import { useToast } from '@/composables/useToast'
import { exportToCSV, exportToPDF, exportToJSON } from '@/utils/exportHelpers'
import CSVImportModal from '@/components/common/CSVImportModal.vue'

const { transactions, loadTransactions } = useTransactions()
const { currentUser } = useAuth()
const { isOnline, canInstall, isInstalled, installApp } = usePWA()
const toast = useToast()
const showExportModal = ref(false)
const showImportModal = ref(false)

const userEmail = computed(() => currentUser.value?.email || '-')

const handleExport = async (format) => {
  try {
    // Load all transactions for export
    await loadTransactions({ limit: 10000 })

    if (!transactions.value || transactions.value.length === 0) {
      toast.warning('Tidak ada data transaksi untuk di-export')
      return
    }

    switch (format) {
      case 'csv':
        exportToCSV(transactions.value)
        toast.success('Data berhasil di-export ke CSV!')
        break
      case 'pdf':
        exportToPDF(transactions.value)
        toast.success('Laporan PDF berhasil dibuat!')
        break
      case 'json':
        exportToJSON(transactions.value)
        toast.success('Data berhasil di-export ke JSON!')
        break
    }

    showExportModal.value = false
  } catch (error) {
    toast.error('Gagal export data: ' + error.message)
  }
}
</script>
