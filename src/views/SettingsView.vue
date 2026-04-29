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

        <button @click="exportData" class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Export Data</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Download data transaksi (JSON)</p>
            </div>
          </div>
          <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <button @click="importFromSpreadsheet" class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group" :disabled="importing">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ importing ? 'Mengimport...' : 'Import Data Spreadsheet' }}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Import 413 transaksi (Ags 2025 - Apr 2026)</p>
            </div>
          </div>
          <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <button @click="clearData" class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-red-600 dark:text-red-400">Hapus Semua Data</p>
              <p class="text-xs text-red-400 dark:text-red-500/70">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
          <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-red-300 dark:group-hover:text-red-500/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
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
          <p class="text-xs text-slate-500 dark:text-slate-400">Versi 1.0.0</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Aplikasi pencatatan keuangan personal</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { clearDatabase } from '@/utils/db'
import { importData } from '@/utils/importData'

const { transactions, bulkImport } = useTransactions()
const importing = ref(false)

const importFromSpreadsheet = async () => {
  if (importing.value) return

  const count = importData.length
  if (!confirm(`Import ${count} transaksi dari spreadsheet?\n\nData: Agustus 2025 - April 2026\nTransaksi yang sudah ada tidak akan terduplikasi jika Anda sudah pernah import sebelumnya.`)) {
    return
  }

  importing.value = true

  try {
    const imported = bulkImport(importData)
    alert(`Berhasil import ${imported} transaksi!`)
    window.location.reload()
  } catch (error) {
    alert('Gagal import: ' + error.message)
  } finally {
    importing.value = false
  }
}

const exportData = () => {
  try {
    const data = {
      transactions: transactions.value,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `duitku-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    alert('Data berhasil di-export!')
  } catch (error) {
    alert('Gagal export data: ' + error.message)
  }
}

const clearData = () => {
  if (confirm('Yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!')) {
    if (confirm('Konfirmasi sekali lagi. Semua transaksi akan hilang!')) {
      clearDatabase()
      alert('Semua data telah dihapus. Aplikasi akan reload.')
      window.location.reload()
    }
  }
}
</script>
