<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 w-[254px] bg-ink-900 dark:bg-[#090e1a] text-white flex flex-col transition-transform duration-300 lg:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-6 h-20 flex-shrink-0">
      <div class="w-10 h-10 rounded-[14px] rounded-bl-md bg-lime text-ink-900 flex items-center justify-center font-display text-xl font-extrabold -rotate-3">D</div>
      <div>
        <h1 class="font-display text-base font-extrabold text-white">DuitKu</h1>
        <p class="text-[11px] text-slate-400 -mt-0.5">uang terasa ringan.</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-4 py-3 space-y-1">
      <p class="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Ruang utama</p>

      <router-link
        v-for="item in mainNavItems"
        :key="item.name"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-[13px] text-sm font-medium text-slate-400 hover:bg-white/[0.07] hover:text-white transition-all duration-200"
        :class="{ 'nav-active': isActive(item.path) }"
        @click="closeMobile"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span>{{ item.label }}</span>
      </router-link>

      <div class="pt-4 pb-2">
        <p class="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
      </div>

      <router-link
        v-for="item in secondaryNavItems"
        :key="item.name"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-[13px] text-sm font-medium text-slate-400 hover:bg-white/[0.07] hover:text-white transition-all duration-200"
        :class="{ 'nav-active': isActive(item.path) }"
        @click="closeMobile"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- User Section -->
    <div class="p-4 flex-shrink-0">
      <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-4 mb-3">
        <p class="text-[11px] text-slate-400">Target bulan ini</p>
        <p class="font-display text-2xl font-extrabold mt-1.5 mb-2.5">78%</p>
        <div class="h-1.5 rounded-full bg-white/10 overflow-hidden"><div class="h-full w-[78%] bg-lime rounded-full"></div></div>
        <p class="text-[10px] text-slate-300 mt-2">Sedikit lagi, pertahankan ritme.</p>
      </div>
      <!-- Dark Mode Toggle -->
      <button
        @click="toggleDark"
        class="flex items-center gap-3 px-3 py-2.5 rounded-[13px] w-full mb-1 text-sm text-slate-400 hover:bg-white/[0.07] hover:text-white transition-colors"
      >
        <SunIcon v-if="isDark" class="w-5 h-5 flex-shrink-0" />
        <MoonIcon v-else class="w-5 h-5 flex-shrink-0" />
        <span>{{ isDark ? 'Mode Terang' : 'Mode Gelap' }}</span>
      </button>

      <!-- Logout -->
      <button
        @click="showLogoutModal = true"
        class="flex items-center gap-3 px-3 py-2.5 rounded-[13px] w-full text-sm text-coral hover:bg-coral/10 transition-colors"
      >
        <ArrowRightOnRectangleIcon class="w-5 h-5 flex-shrink-0" />
        <span>Keluar</span>
      </button>
    </div>
  </aside>

  <!-- Mobile Overlay -->
  <transition name="fade-overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
      @click="closeMobile"
    />
  </transition>

  <!-- Logout Confirmation Modal -->
  <teleport to="body">
    <transition name="fade-overlay">
      <div v-if="showLogoutModal" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="showLogoutModal = false"></div>
        <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5">
          <div class="text-center mb-4">
            <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Keluar dari Akun?</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Kamu perlu login kembali untuk mengakses data.</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="showLogoutModal = false" class="btn btn-secondary flex-1">Batal</button>
            <button @click="handleLogout" class="btn btn-danger flex-1">Keluar</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useDarkMode } from '@/composables/useDarkMode'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const { logout } = useAuth()
const { isDark, toggleDark } = useDarkMode()

const showLogoutModal = ref(false)

// SVG Icon Components
const HomeIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' })]) }
const BanknotesIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' })]) }
const ChartBarIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' })]) }
const TagIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z' }), h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M6 6h.008v.008H6V6z' })]) }
const WalletIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3' })]) }
const UsersIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' })]) }
const CogIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z' }), h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })]) }
const SunIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' })]) }
const MoonIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z' })]) }
const ArrowRightOnRectangleIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9' })]) }
const SavingsIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' })]) }
const AnalyticsIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z' }), h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z' })]) }
const ClipboardIcon = { render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.5', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z' })]) }

const mainNavItems = [
  { name: 'Dashboard', path: '/', icon: HomeIcon, label: 'Dashboard' },
  { name: 'Transactions', path: '/transactions', icon: BanknotesIcon, label: 'Transaksi' },
  { name: 'Analytics', path: '/analytics', icon: AnalyticsIcon, label: 'Analytics' },
  { name: 'Reports', path: '/reports', icon: ChartBarIcon, label: 'Laporan' },
  { name: 'Categories', path: '/categories', icon: TagIcon, label: 'Kategori' },
  { name: 'Budgets', path: '/budgets', icon: WalletIcon, label: 'Anggaran' },
  { name: 'Projects', path: '/projects', icon: ClipboardIcon, label: 'Project Planning' },
  { name: 'SavingsGoals', path: '/savings', icon: SavingsIcon, label: 'Target Tabungan' },
  { name: 'Team', path: '/team', icon: UsersIcon, label: 'Tim' },
]

const secondaryNavItems = [
  { name: 'Settings', path: '/settings', icon: CogIcon, label: 'Pengaturan' },
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const closeMobile = () => {
  emit('close')
}

const handleLogout = async () => {
  showLogoutModal.value = false
  await logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-active {
  background: #c8f16d;
  color: #17213f;
  font-weight: 700;
  box-shadow: 0 9px 24px rgba(200, 241, 109, 0.16);
}
.nav-active:hover {
  background: #c8f16d;
  color: #17213f;
}
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.2s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}
</style>
