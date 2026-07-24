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
      class="fixed top-0 left-0 right-0 z-[60] bg-ink-900 text-white dark:bg-ink-800 border-b border-white/10 shadow-md backdrop-blur-md"
    >
      <div class="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold">
        <span class="w-2 h-2 rounded-full bg-coral animate-ping"></span>
        <span>Kamu sedang offline — data tetap tersimpan lokal</span>
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
      class="fixed top-0 left-0 right-0 z-[60] bg-ink-900 text-white dark:bg-ink-800 border-b border-white/10 shadow-md backdrop-blur-md"
    >
      <div class="flex items-center justify-center gap-3 px-4 py-2 text-xs font-bold">
        <span>⚡ Versi baru DuitKu telah tersedia</span>
        <button
          @click="$emit('update')"
          class="px-3 py-1 bg-lime text-ink-900 rounded-lg text-xs font-extrabold shadow-sm hover:opacity-90 transition-opacity"
        >
          Perbarui Sekarang
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
