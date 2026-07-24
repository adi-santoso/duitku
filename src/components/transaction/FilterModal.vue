<template>
  <BottomSheet
    v-model="isOpen"
    title="Filter Transaksi"
    :show-close="true"
    @close="handleClose"
  >
    <div class="space-y-5 p-1">
      <!-- Category Filter -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-slate-400 mb-2">
          Kategori
        </label>
        <BaseSelect v-model="localFilters.category" size="sm" custom-class="w-full !rounded-2xl !bg-surface/80 dark:!bg-ink-800/80 !border-ink-900/10 dark:!border-white/10 text-xs font-bold">
          <option :value="null">Semua Kategori</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.icon }} {{ cat.name }}
          </option>
        </BaseSelect>
      </div>

      <!-- Month Filter -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-slate-400 mb-2">
          Bulan
        </label>
        <BaseSelect v-model="localFilters.month" size="sm" custom-class="w-full !rounded-2xl !bg-surface/80 dark:!bg-ink-800/80 !border-ink-900/10 dark:!border-white/10 text-xs font-bold">
          <option :value="null">Semua Bulan</option>
          <option v-for="m in availableMonths" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </BaseSelect>
      </div>

      <!-- Sort -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-slate-400 mb-2">
          Urutkan
        </label>
        <BaseSelect v-model="localFilters.sortBy" size="sm" custom-class="w-full !rounded-2xl !bg-surface/80 dark:!bg-ink-800/80 !border-ink-900/10 dark:!border-white/10 text-xs font-bold">
          <option value="date_desc">Terbaru</option>
          <option value="date_asc">Terlama</option>
          <option value="amount_desc">Terbesar</option>
          <option value="amount_asc">Terkecil</option>
        </BaseSelect>
      </div>

      <!-- Amount Range -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-slate-400 mb-2">
          Rentang Jumlah
        </label>
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-ink-400">Min</span>
            <input
              v-model="localFilters.amountMin"
              type="number"
              class="input h-12 !rounded-2xl !bg-surface/80 dark:!bg-ink-800/80 !border-ink-900/10 dark:!border-white/10 text-xs font-bold pl-10 w-full"
              placeholder="0"
              min="0"
              step="10000"
            />
          </div>
          <span class="text-xs text-ink-400 font-bold">—</span>
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-ink-400">Max</span>
            <input
              v-model="localFilters.amountMax"
              type="number"
              class="input h-12 !rounded-2xl !bg-surface/80 dark:!bg-ink-800/80 !border-ink-900/10 dark:!border-white/10 text-xs font-bold pl-11 w-full"
              placeholder="∞"
              min="0"
              step="10000"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center gap-3 py-3">
        <button
          @click="handleReset"
          class="btn btn-secondary flex-1 h-12 !rounded-2xl font-extrabold text-xs"
        >
          Reset Filter
        </button>
        <button
          @click="handleApply"
          class="flex-1 h-12 rounded-2xl font-extrabold text-xs bg-ink-900 text-white dark:bg-lime dark:text-ink-900 hover:opacity-90 active:scale-95 transition-all shadow-md"
        >
          Terapkan Filter
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup>
import { ref, watch } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  filters: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  },
  availableMonths: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'apply', 'reset'])

const isOpen = ref(props.modelValue)
const localFilters = ref({
  category: props.filters.category,
  month: props.filters.month,
  sortBy: props.filters.sortBy,
  amountMin: props.filters.amountMin,
  amountMax: props.filters.amountMax
})

watch(() => props.modelValue, (val) => {
  isOpen.value = val
  if (val) {
    // Reset local filters to current props when opening
    localFilters.value = {
      category: props.filters.category,
      month: props.filters.month,
      sortBy: props.filters.sortBy,
      amountMin: props.filters.amountMin,
      amountMax: props.filters.amountMax
    }
  }
})

watch(isOpen, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  isOpen.value = false
}

const handleApply = () => {
  emit('apply', { ...localFilters.value })
  isOpen.value = false
}

const handleReset = () => {
  localFilters.value = {
    category: null,
    month: null,
    sortBy: 'date_desc',
    amountMin: '',
    amountMax: ''
  }
  emit('reset')
  isOpen.value = false
}
</script>
