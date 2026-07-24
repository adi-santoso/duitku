<template>
  <div class="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-[55]">
    <!-- Expanded Options -->
    <transition name="fab-expand">
      <div v-if="isExpanded" class="absolute bottom-16 right-0 space-y-2.5 mb-2 z-50">
        <!-- Income -->
        <button
          @click="handleAdd('income')"
          class="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-lime text-ink-900 font-extrabold text-xs shadow-lg shadow-lime/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap animate-fab-item"
          style="animation-delay: 0.05s"
        >
          <div class="w-6 h-6 rounded-xl bg-ink-900/10 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span>+ Pemasukan</span>
        </button>

        <!-- Expense -->
        <button
          @click="handleAdd('expense')"
          class="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-coral text-white font-extrabold text-xs shadow-lg shadow-coral/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap animate-fab-item"
          style="animation-delay: 0.1s"
        >
          <div class="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
            </svg>
          </div>
          <span>− Pengeluaran</span>
        </button>
      </div>
    </transition>

    <!-- Backdrop -->
    <transition name="fade">
      <div
        v-if="isExpanded"
        class="fixed inset-0 bg-ink-900/30 backdrop-blur-[2px] z-40"
        @click="isExpanded = false"
      />
    </transition>

    <!-- Main FAB Button -->
    <button
      @click="isExpanded = !isExpanded"
      class="w-14 h-14 rounded-2xl bg-ink-900 text-white dark:bg-lime dark:text-ink-900 shadow-float border border-white/10 dark:border-ink-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
      :class="{ 'rotate-45': isExpanded }"
      aria-label="Tambah Transaksi Cepat"
    >
      <svg class="w-6 h-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>
  </div>

  <!-- Quick Transaction Modal -->
  <TransactionModal
    v-if="showModal"
    :type="transactionType"
    @close="showModal = false"
    @saved="handleSaved"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TransactionModal from '@/components/transaction/TransactionModal.vue'

const emit = defineEmits(['saved'])

const isExpanded = ref(false)
const showModal = ref(false)
const transactionType = ref('expense')

const handleAdd = (type) => {
  transactionType.value = type
  isExpanded.value = false
  showModal.value = true
}

const handleSaved = () => {
  showModal.value = false
  emit('saved')
}

// Listen for keyboard shortcut
const onShortcutNew = () => {
  isExpanded.value = !isExpanded.value
}

const onShortcutEscape = () => {
  if (showModal.value) {
    showModal.value = false
  } else if (isExpanded.value) {
    isExpanded.value = false
  }
}

onMounted(() => {
  window.addEventListener('shortcut-new-transaction', onShortcutNew)
  window.addEventListener('shortcut-escape', onShortcutEscape)
})

onUnmounted(() => {
  window.removeEventListener('shortcut-new-transaction', onShortcutNew)
  window.removeEventListener('shortcut-escape', onShortcutEscape)
})
</script>

<style scoped>
.fab-expand-enter-active,
.fab-expand-leave-active {
  transition: all 0.2s ease;
}
.fab-expand-enter-from,
.fab-expand-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fabItemIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fab-item {
  animation: fabItemIn 0.2s ease forwards;
  opacity: 0;
}
</style>
