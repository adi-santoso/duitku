<template>
  <!-- PWA: Offline indicator & update banner -->
  <OfflineIndicator
    :isOnline="isOnline"
    :needsUpdate="needsUpdate"
    @update="applyUpdate"
  />

  <!-- Wait for auth to be ready before rendering app -->
  <div v-if="authLoading" class="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
    <div class="text-center">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm shadow-primary-500/25 mx-auto mb-3">
        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  </div>

  <template v-else>
    <div v-if="isAuthRoute" class="min-h-screen" :class="{ 'pt-8': !isOnline || needsUpdate }">
      <router-view />
    </div>

    <div v-else class="min-h-screen bg-slate-100 dark:bg-slate-950" :class="{ 'pt-8': !isOnline || needsUpdate }">
      <!-- Sidebar (desktop) -->
      <Sidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />

      <!-- Main Content Area -->
      <div class="lg:pl-[260px] min-h-screen flex flex-col transition-all duration-300">
        <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

        <main class="flex-1 p-4 lg:p-6">
          <div class="max-w-7xl mx-auto">
            <router-view />
          </div>
        </main>
      </div>

      <!-- Bottom Nav (mobile) -->
      <BottomNav />

      <!-- Quick Add FAB (hidden on transactions page which has its own) -->
      <QuickAddFAB v-if="route.path !== '/transactions'" @saved="handleFABSaved" />
    </div>
  </template>

  <!-- PWA: Install prompt -->
  <InstallPrompt
    :canInstall="canInstall"
    @install="installApp"
  />

  <!-- Global Toast Notifications -->
  <Toast />

  <!-- Keyboard Shortcuts Help -->
  <KeyboardShortcutsHelp
    :show="showShortcutsHelp"
    :shortcuts="shortcuts"
    @close="showShortcutsHelp = false"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useDarkMode } from '@/composables/useDarkMode'
import { usePWA } from '@/composables/usePWA'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import InstallPrompt from '@/components/pwa/InstallPrompt.vue'
import OfflineIndicator from '@/components/pwa/OfflineIndicator.vue'
import Toast from '@/components/common/Toast.vue'
import QuickAddFAB from '@/components/common/QuickAddFAB.vue'
import KeyboardShortcutsHelp from '@/components/common/KeyboardShortcutsHelp.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const route = useRoute()
const { authLoading } = useAuth()
const { initTheme } = useDarkMode()
const { isOnline, canInstall, needsUpdate, installApp, applyUpdate } = usePWA()
const { showHelp: showShortcutsHelp, shortcuts } = useKeyboardShortcuts()
const sidebarOpen = ref(false)

const isAuthRoute = computed(() => {
  return route.path === '/login'
})

const handleFABSaved = () => {
  // Trigger a page reload to refresh data after quick add
  window.dispatchEvent(new CustomEvent('transaction-saved'))
}

onMounted(() => {
  initTheme()
})
</script>
