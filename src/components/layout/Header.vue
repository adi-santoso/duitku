<template>
  <header class="sticky top-0 z-30 bg-canvas/80 dark:bg-ink-950/80 backdrop-blur-xl">
    <div class="flex items-center justify-between h-20 px-4 lg:px-8 max-w-[1544px] mx-auto">
      <!-- Left: Menu button (mobile) + Page title -->
      <div class="flex items-center gap-3">
        <button
          @click="$emit('toggle-sidebar')"
          class="lg:hidden p-2 -ml-2 rounded-xl border border-ink-900/10 dark:border-white/10 bg-surface/70 dark:bg-ink-900/70 transition-colors"
          aria-label="Buka menu"
        >
          <svg class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div>
          <p class="text-xs text-ink-500 dark:text-slate-400 hidden sm:block">{{ todayLabel }}</p>
          <h1 class="font-display text-xl lg:text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white">{{ pageTitle }}</h1>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-2">
        <!-- Staff badge -->
        <span v-if="isStaffUser" class="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs font-medium text-amber-700 dark:text-amber-400">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Staff
        </span>

        <!-- Dark mode toggle -->
        <button
          @click="toggleDark"
          class="p-2.5 rounded-xl border border-ink-900/10 dark:border-white/10 bg-surface/70 dark:bg-ink-900/70 hover:-translate-y-0.5 transition-all"
          :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
        >
          <svg v-if="isDark" class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
          <svg v-else class="w-5 h-5 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        </button>

        <!-- User avatar -->
        <div class="flex items-center gap-2 ml-1">
          <div class="w-10 h-10 rounded-[14px] bg-violet flex items-center justify-center text-ink-900 text-sm font-extrabold shadow-sm">
            {{ getUserDisplayName().charAt(0).toUpperCase() }}
          </div>
          <div class="hidden sm:block leading-tight"><span class="block text-xs font-bold text-ink-900 dark:text-white">{{ getUserDisplayName() }}</span><span class="text-[10px] text-ink-500 dark:text-slate-400">{{ isStaffUser ? 'Staff account' : 'Owner account' }}</span></div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDarkMode } from '@/composables/useDarkMode'
import { useAuth } from '@/composables/useAuth'

defineEmits(['toggle-sidebar'])

const route = useRoute()
const { isDark, toggleDark } = useDarkMode()
const { getUserDisplayName, isStaff } = useAuth()

const isStaffUser = computed(() => isStaff())
const todayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

const pageMeta = computed(() => {
  const meta = {
    Dashboard: { title: `Selamat datang, ${getUserDisplayName()}.`, subtitle: 'Ringkasan keuangan' },
    Transactions: { title: 'Transaksi', subtitle: 'Riwayat pemasukan & pengeluaran' },
    Categories: { title: 'Kategori', subtitle: 'Kelola kategori transaksi' },
    Budgets: { title: 'Anggaran', subtitle: 'Atur budget per kategori' },
    Reports: { title: 'Laporan', subtitle: 'Analisis keuangan bulanan' },
    Settings: { title: 'Pengaturan', subtitle: 'Konfigurasi aplikasi' },
    Team: { title: 'Staff', subtitle: 'Kelola akun staff' },
    Analytics: { title: 'Analitik', subtitle: 'Insight keuangan mendalam' },
    SavingsGoals: { title: 'Target Tabungan', subtitle: 'Wujudkan rencana keuangan' },
    Projects: { title: 'Project Planning', subtitle: 'Rencanakan pembelian besar' },
    ProjectDetail: { title: 'Detail Project', subtitle: 'Pantau progres project' }
  }
  return meta[route.name] || { title: 'DuitKu', subtitle: '' }
})

const pageTitle = computed(() => pageMeta.value.title)
</script>
