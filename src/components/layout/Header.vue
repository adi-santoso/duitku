<template>
  <header class="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
    <div class="flex items-center justify-between h-16 px-4 lg:px-6">
      <!-- Left: Menu button (mobile) + Page title -->
      <div class="flex items-center gap-3">
        <button
          @click="$emit('toggle-sidebar')"
          class="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <svg class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-white">{{ pageTitle }}</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{{ pageSubtitle }}</p>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-1">
        <!-- Dark mode toggle (mobile only, desktop is in sidebar) -->
        <button
          @click="toggleDark"
          class="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
        >
          <svg v-if="isDark" class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
          <svg v-else class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        </button>

        <!-- User avatar -->
        <div class="flex items-center gap-2 ml-1 pl-3 border-l border-slate-200 dark:border-slate-700">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            S
          </div>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">Santoso</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDarkMode } from '@/composables/useDarkMode'

defineEmits(['toggle-sidebar'])

const route = useRoute()
const { isDark, toggleDark } = useDarkMode()

const pageMeta = computed(() => {
  const meta = {
    Dashboard: { title: 'Dashboard', subtitle: 'Ringkasan keuangan bulan ini' },
    Transactions: { title: 'Transaksi', subtitle: 'Riwayat pemasukan & pengeluaran' },
    Categories: { title: 'Kategori', subtitle: 'Kelola kategori transaksi' },
    Budgets: { title: 'Anggaran', subtitle: 'Atur budget per kategori' },
    Reports: { title: 'Laporan', subtitle: 'Analisis keuangan bulanan' },
    Settings: { title: 'Pengaturan', subtitle: 'Konfigurasi aplikasi' }
  }
  return meta[route.name] || { title: 'DuitKu', subtitle: '' }
})

const pageTitle = computed(() => pageMeta.value.title)
const pageSubtitle = computed(() => pageMeta.value.subtitle)
</script>
