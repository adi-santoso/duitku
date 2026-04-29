<template>
  <!-- Offline Banner -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 right-0 z-[60] bg-amber-500 dark:bg-amber-600 text-white"
    >
      <div class="flex items-center justify-center gap-2 px-4 py-2">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
        </svg>
        <span class="text-xs font-medium">Kamu sedang offline — data tetap tersimpan</span>
      </div>
    </div>
  </Transition>

  <!-- Update Available Banner -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="needsUpdate && isOnline"
      class="fixed top-0 left-0 right-0 z-[60] bg-blue-500 dark:bg-blue-600 text-white"
    >
      <div class="flex items-center justify-center gap-3 px-4 py-2">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
        </svg>
        <span class="text-xs font-medium">Versi baru tersedia</span>
        <button
          @click="$emit('update')"
          class="px-3 py-0.5 bg-white/20 hover:bg-white/30 rounded-md text-xs font-semibold transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  isOnline: {
    type: Boolean,
    default: true
  },
  needsUpdate: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update'])
</script>
