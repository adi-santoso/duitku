<template>
  <div class="card overflow-hidden !bg-lime !border-ink-900/10 !text-ink-900 shadow-soft p-5.5 relative">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold text-ink-900/80">Kesehatan finansial</span>
      <div class="flex items-center gap-1.5">
        <span class="px-2.5 py-1 rounded-full bg-white/60 text-[10px] font-extrabold text-ink-900 shadow-sm">
          {{ grade.label || 'Sangat baik' }}
        </span>
        <button
          @click="$emit('refresh')"
          class="p-1 rounded-lg hover:bg-white/40 transition-colors text-ink-900/70"
          aria-label="Perbarui skor kesehatan keuangan"
          :class="{ 'animate-spin': loading }"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-6">
      <div class="w-8 h-8 rounded-full border-2 border-ink-900 border-t-transparent animate-spin" />
    </div>

    <template v-else>
      <!-- Score Display -->
      <div class="flex items-baseline gap-1.5 my-3.5">
        <strong class="font-display text-5xl font-extrabold tracking-[-0.06em] text-ink-900 leading-none">{{ score }}</strong>
        <span class="text-xs font-bold text-ink-900/60">/100</span>
      </div>

      <!-- Recommendation Summary -->
      <p class="text-xs text-ink-900/85 leading-relaxed font-medium">
        {{ tips[0] || 'Rasio tabungan baik dan pengeluaran tetap di bawah batas aman bulan ini.' }}
      </p>

      <!-- Score Track -->
      <div class="h-2 mt-4 rounded-full bg-ink-900/15 overflow-hidden">
        <div
          class="h-full bg-ink-900 rounded-full transition-all duration-1000"
          :style="{ width: `${Math.min(100, Math.max(0, score))}%` }"
        />
      </div>

      <!-- Breakdown Bars (Collapsible) -->
      <div class="mt-4 pt-3 border-t border-ink-900/10">
        <button
          @click="showDetails = !showDetails"
          class="flex items-center justify-between w-full text-[11px] font-bold text-ink-900/80 hover:text-ink-900 transition-colors"
        >
          <span>Detail Indikator ({{ Object.keys(breakdown).length }})</span>
          <svg class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': showDetails }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <div v-if="showDetails" class="mt-3 space-y-2.5">
          <div v-for="(item, key) in breakdown" :key="key">
            <div class="flex items-center justify-between mb-0.5">
              <span class="text-[10px] font-medium text-ink-900/70">{{ item.label }}</span>
              <span class="text-[10px] font-bold text-ink-900">{{ item.score }}/{{ item.max }}</span>
            </div>
            <div class="w-full bg-ink-900/15 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full transition-all duration-700 bg-ink-900"
                :style="{ width: `${item.max > 0 ? (item.score / item.max) * 100 : 0}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  score: { type: Number, default: 0 },
  breakdown: { type: Object, default: () => ({}) },
  grade: { type: Object, default: () => ({ label: '', color: '#17213f', emoji: '' }) },
  tips: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['refresh'])

const showDetails = ref(false)
</script>
