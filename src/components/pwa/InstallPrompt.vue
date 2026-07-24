<template>
  <!-- Install Banner -->
  <Transition
    enter-active-class="transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)"
    enter-from-class="translate-y-10 opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-10 opacity-0 scale-95"
  >
    <div
      v-if="canInstall && !dismissed"
      class="fixed bottom-24 sm:bottom-8 left-4 right-4 sm:left-auto sm:right-8 sm:w-[400px] z-50 pointer-events-auto"
    >
      <div class="relative bg-surface/95 dark:bg-ink-900/95 backdrop-blur-2xl rounded-3xl border border-ink-900/10 dark:border-white/10 p-5 md:p-6 shadow-2xl space-y-4">
        <!-- Header Row: Icon, Title, Badge & Close Button -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3.5">
            <!-- Brand Icon -->
            <div class="w-12 h-12 rounded-2xl bg-lime text-ink-900 flex items-center justify-center font-display font-extrabold text-2xl shadow-md -rotate-2 flex-shrink-0">
              D
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-display text-base font-extrabold text-ink-900 dark:text-white">Install App DuitKu</h3>
                <span class="px-2 py-0.5 rounded-full bg-lime/20 text-ink-900 dark:text-lime text-[10px] font-extrabold uppercase tracking-wider">PWA</span>
              </div>
              <p class="text-xs text-ink-500 dark:text-slate-400 font-medium">Aplikasi Kas Keuangan</p>
            </div>
          </div>

          <!-- Close Button -->
          <button
            @click="dismiss"
            class="p-2 rounded-2xl hover:bg-canvas dark:hover:bg-ink-800 text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors flex-shrink-0"
            aria-label="Tutup banner install"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Description -->
        <p class="text-xs text-ink-600 dark:text-slate-300 leading-relaxed bg-canvas/60 dark:bg-ink-800/60 p-3.5 rounded-2xl border border-ink-900/5 dark:border-white/5">
          Dapatkan akses instan langsung dari layar utama gadget kamu & tetap dapat mencatat keuangan meski tanpa koneksi internet.
        </p>

        <!-- Actions -->
        <div class="flex items-center gap-2.5 pt-1">
          <button
            @click="handleInstall"
            class="flex-1 h-11 bg-ink-900 text-white dark:bg-lime dark:text-ink-900 text-xs font-extrabold rounded-2xl shadow-md hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Install Sekarang
          </button>
          <button
            @click="dismiss"
            class="h-11 px-4 text-ink-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-white text-xs font-bold rounded-2xl hover:bg-canvas dark:hover:bg-ink-800 transition-colors"
          >
            Nanti saja
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
