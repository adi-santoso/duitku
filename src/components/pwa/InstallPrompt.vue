<template>
  <!-- Install Banner -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="canInstall && !dismissed"
      class="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Install DuitKu</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Akses lebih cepat & bisa dipakai offline
            </p>

            <div class="flex items-center gap-2 mt-3">
              <button
                @click="handleInstall"
                class="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Install
              </button>
              <button
                @click="dismiss"
                class="px-4 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-medium transition-colors"
              >
                Nanti
              </button>
            </div>
          </div>

          <!-- Close -->
          <button
            @click="dismiss"
            class="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  canInstall: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['install'])
const dismissed = ref(false)

function handleInstall() {
  emit('install')
}

function dismiss() {
  dismissed.value = true
  // Show again after 24 hours
  localStorage.setItem('duitku_install_dismissed', Date.now().toString())
}
</script>
