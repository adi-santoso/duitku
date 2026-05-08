<template>
  <div class="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40">
    <!-- Expanded Options -->
    <transition name="fab-expand">
      <div v-if="isExpanded" class="absolute bottom-16 right-0 space-y-2 mb-2">
        <!-- Income -->
        <button
          @click="handleAdd('income')"
          class="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all whitespace-nowrap animate-fab-item"
          style="animation-delay: 0.05s"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span class="text-sm font-semibold">Pemasukan</span>
        </button>

        <!-- Expense -->
        <button
          @click="handleAdd('expense')"
          class="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all whitespace-nowrap animate-fab-item"
          style="animation-delay: 0.1s"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
          </svg>
          <span class="text-sm font-semibold">Pengeluaran</span>
        </button>
      </div>
    </transition>

    <!-- Backdrop -->
    <transition name="fade">
      <div
        v-if="isExpanded"
        class="fixed inset-0 bg-black/20 backdrop-blur-[1px] -z-10"
        @click="isExpanded = false"
      />
    </transition>

    <!-- Main FAB Button -->
    <button
      @click="isExpanded = !isExpanded"
      class="w-14 h-14 rounded-full bg-primary-500 text-white shadow-xl shadow-primary-500/30 hover:bg-primary-600 hover:shadow-primary-500/40 transition-all flex items-center justify-center active:scale-95"
      :class="{ 'rotate-45': isExpanded }"
    >
      <svg class="w-6 h-6 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
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
