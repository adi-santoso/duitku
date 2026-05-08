<template>
  <teleport to="body">
    <transition name="fade-overlay">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
        <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-slide-up">
          <!-- Header -->
          <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">⌨️</span>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
            </div>
            <button @click="$emit('close')" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Shortcuts List -->
          <div class="p-5 max-h-[60vh] overflow-y-auto space-y-4">
            <div v-for="category in groupedShortcuts" :key="category.name">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{{ category.name }}</p>
              <div class="space-y-1.5">
                <div
                  v-for="shortcut in category.items"
                  :key="shortcut.keys"
                  class="flex items-center justify-between py-1.5"
                >
                  <span class="text-sm text-slate-600 dark:text-slate-400">{{ shortcut.description }}</span>
                  <div class="flex items-center gap-1">
                    <kbd
                      v-for="(key, i) in shortcut.keys.split(' → ')"
                      :key="i"
                      class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >{{ key }}</kbd>
                    <span v-if="shortcut.keys.includes('→')" class="text-[10px] text-slate-400 mx-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <p class="text-[10px] text-slate-400 dark:text-slate-500 text-center">
              Tekan <kbd class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-700">?</kbd> untuk toggle bantuan ini
            </p>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  shortcuts: { type: Array, default: () => [] },
})

defineEmits(['close'])

const groupedShortcuts = computed(() => {
  const groups = {}
  props.shortcuts.forEach(s => {
    if (!groups[s.category]) groups[s.category] = []
    groups[s.category].push(s)
  })
  return Object.entries(groups).map(([name, items]) => ({ name, items }))
})
</script>

<style scoped>
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.2s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}
</style>
