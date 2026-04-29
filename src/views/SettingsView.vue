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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { useAuth } from '@/composables/useAuth'
import { usePWA } from '@/composables/usePWA'

const { transactions, loadTransactions } = useTransactions()
const { currentUser } = useAuth()
const { isOnline, canInstall, isInstalled, installApp } = usePWA()

const userEmail = computed(() => currentUser.value?.email || '-')

onMounted(async () => {
  await loadTransactions()
})

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
</script>
