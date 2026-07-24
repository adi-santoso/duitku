<template>
  <div v-if="suggestions.length > 0" class="card border border-amber-200/60 bg-[#fff7e5] dark:bg-[#d8b866] !text-ink-900 shadow-soft p-4.5">
    <!-- Card Header (Full Width) -->
    <div class="flex items-center gap-3 mb-3">
      <div class="w-8 h-8 rounded-xl bg-[#ffd77c] text-amber-950 flex items-center justify-center font-bold text-base flex-shrink-0 shadow-sm">
        ✦
      </div>
      <div class="min-w-0 flex-1">
        <strong class="block text-xs font-extrabold text-amber-950 dark:text-ink-900 leading-none">Insight & Transaksi Berulang</strong>
        <span class="block text-[10px] text-amber-900/80 dark:text-ink-900/70 mt-1">Konfirmasi transaksi rutin otomatis</span>
      </div>
      <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-950 dark:bg-ink-900/20 dark:text-ink-900 flex-shrink-0">
        {{ suggestions.length }} terdeteksi
      </span>
    </div>

    <!-- Suggestions List (Full Width, No Indent) -->
    <div class="space-y-2">
      <div
        v-for="item in suggestions.slice(0, showAll ? undefined : 2)"
        :key="item.id"
        class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/80 dark:bg-ink-900/15 border border-amber-200/40 dark:border-ink-900/10 shadow-sm transition-all hover:bg-white dark:hover:bg-ink-900/25"
      >
        <!-- Icon & Description -->
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 bg-amber-100 dark:bg-ink-900/20 shadow-inner">
            {{ item.category_icon || '📋' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-ink-900 truncate leading-tight">{{ item.description }}</p>
            <div class="flex items-center gap-1.5 mt-1 text-[10px] text-ink-900/70">
              <span class="font-extrabold text-ink-900">~{{ formatCurrency(item.avgAmount) }}</span>
              <span>·</span>
              <span class="px-1.5 py-0.5 rounded-md bg-amber-200/80 dark:bg-ink-900/20 font-bold text-[9px]">
                {{ getFrequencyLabel(item.frequency) }}
              </span>
              <span>·</span>
              <span>{{ item.occurrences }}x muncul</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <button
            @click="$emit('mark-recurring', item)"
            class="px-2.5 py-1.5 rounded-xl bg-ink-900 text-white dark:bg-ink-900 dark:text-lime text-[10px] font-extrabold hover:opacity-90 transition-opacity shadow-sm"
            title="Tandai sebagai transaksi berulang"
          >
            + Set Recurring
          </button>
          <button
            @click="$emit('dismiss', item.id)"
            class="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-black/10 text-ink-900/60 font-bold text-xs transition-colors"
            title="Abaikan rekomendasi"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Toggle Show All -->
    <button
      v-if="suggestions.length > 2"
      @click="showAll = !showAll"
      class="mt-2.5 text-[11px] font-extrabold text-amber-950 dark:text-ink-900 hover:underline transition-colors block text-center w-full"
    >
      {{ showAll ? 'Sembunyikan' : `Lihat ${suggestions.length - 2} rekomendasi lainnya` }}
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
