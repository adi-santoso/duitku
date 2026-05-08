<template>
  <div v-if="suggestions.length > 0" class="card border-l-4 border-l-blue-500">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-lg">🔄</span>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Transaksi Berulang Terdeteksi</h3>
      </div>
      <span class="text-xs text-slate-400 dark:text-slate-500">{{ suggestions.length }} ditemukan</span>
    </div>

    <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">
      Transaksi berikut terlihat berulang. Tandai sebagai recurring agar lebih mudah dilacak.
    </p>

    <div class="space-y-2">
      <div
        v-for="item in suggestions.slice(0, showAll ? undefined : 3)"
        :key="item.id"
        class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 group"
      >
        <!-- Icon -->
        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 bg-blue-50 dark:bg-blue-500/10">
          {{ item.category_icon || '📋' }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{{ item.description }}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] text-slate-400 dark:text-slate-500">
              ~{{ formatCurrency(item.avgAmount) }}
            </span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium">
              {{ getFrequencyLabel(item.frequency) }}
            </span>
            <span class="text-[10px] text-slate-400 dark:text-slate-500">
              {{ item.occurrences }}x
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click="$emit('mark-recurring', item)"
            class="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Tandai sebagai recurring"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>
          <button
            @click="$emit('dismiss', item.id)"
            class="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
            title="Abaikan"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Show more/less -->
    <button
      v-if="suggestions.length > 3"
      @click="showAll = !showAll"
      class="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
    >
      {{ showAll ? 'Tampilkan lebih sedikit' : `Lihat ${suggestions.length - 3} lainnya` }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  suggestions: { type: Array, default: () => [] },
  getFrequencyLabel: { type: Function, default: (f) => f },
})

defineEmits(['mark-recurring', 'dismiss'])

const showAll = ref(false)
</script>
