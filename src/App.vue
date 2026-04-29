<template>
  <div v-if="isAuthRoute" class="min-h-screen">
    <router-view />
  </div>

  <div v-else class="min-h-screen bg-slate-100 dark:bg-slate-950">
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDarkMode } from '@/composables/useDarkMode'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import BottomNav from '@/components/layout/BottomNav.vue'

const route = useRoute()
const { initTheme } = useDarkMode()
const sidebarOpen = ref(false)

const isAuthRoute = computed(() => {
  return route.path === '/login'
})

onMounted(() => {
  initTheme()
})
</script>
