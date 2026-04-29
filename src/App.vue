<template>
  <!-- PWA: Offline indicator & update banner -->
  <OfflineIndicator
    :isOnline="isOnline"
    :needsUpdate="needsUpdate"
    @update="applyUpdate"
  />

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
  </div>

  <!-- PWA: Install prompt -->
  <InstallPrompt
    :canInstall="canInstall"
    @install="installApp"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDarkMode } from '@/composables/useDarkMode'
import { usePWA } from '@/composables/usePWA'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import InstallPrompt from '@/components/pwa/InstallPrompt.vue'
import OfflineIndicator from '@/components/pwa/OfflineIndicator.vue'

const route = useRoute()
const { initTheme } = useDarkMode()
const { isOnline, canInstall, needsUpdate, installApp, applyUpdate } = usePWA()
const sidebarOpen = ref(false)

const isAuthRoute = computed(() => {
  return route.path === '/login'
})

onMounted(() => {
  initTheme()
})
</script>
