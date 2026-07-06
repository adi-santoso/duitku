<template>
  <div class="space-y-3">
    <!-- Preset Pills -->
    <div class="flex items-center gap-2 flex-wrap">
      <button
        v-for="preset in visiblePresets"
        :key="preset.id"
        @click="$emit('apply', preset)"
        class="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
        :class="isActivePreset(preset.id)
          ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25'
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700'"
      >
        <span>{{ preset.icon }}</span>
        <span>{{ preset.name }}</span>
        <button
          v-if="!preset.isDefault"
          @click.stop="$emit('delete', preset.id)"
          class="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
          title="Hapus preset"
        >
          ×
        </button>
      </button>

      <!-- Show More Toggle -->
      <button
        v-if="presets.length > maxVisible"
        @click="showAll = !showAll"
        class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        {{ showAll ? '← Tutup' : `+${presets.length - maxVisible} lagi` }}
      </button>

      <!-- Create New Preset Button -->
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-primary-500 to-blue-500 text-white hover:shadow-md transition-all active:scale-95"
        title="Buat preset baru"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span class="hidden sm:inline">Buat</span>
      </button>
    </div>

    <!-- Create Preset Modal -->
    <teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
        @click.self="showCreateModal = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in">
          <div class="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">Buat Filter Preset</h3>
            <button
              @click="showCreateModal = false"
              class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-5 space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Nama Preset
              </label>
              <input
                v-model="newPreset.name"
                type="text"
                placeholder="Contoh: Belanja Bulanan"
                class="input"
                maxlength="30"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Icon
              </label>
              <div class="flex items-center gap-2 flex-wrap">
                <button
                  v-for="icon in iconOptions"
                  :key="icon"
                  @click="newPreset.icon = icon"
                  class="w-10 h-10 rounded-lg text-xl transition-all"
                  :class="newPreset.icon === icon
                    ? 'bg-primary-500 ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900 scale-110'
                    : 'bg-slate-100 dark:bg-slate-800 hover:scale-105'"
                >
                  {{ icon }}
                </button>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
              <p class="text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
                <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <span>Preset akan menyimpan filter yang sedang aktif saat ini (kategori, tanggal, jumlah, dll)</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-5 border-t border-slate-200 dark:border-slate-800">
            <button
              @click="showCreateModal = false"
              class="btn btn-secondary flex-1"
            >
              Batal
            </button>
            <button
              @click="handleCreatePreset"
              :disabled="!newPreset.name.trim()"
              class="btn btn-primary flex-1"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  presets: {
    type: Array,
    required: true
  },
  activePresetId: {
    type: String,
    default: null
  },
  currentFilters: {
    type: Object,
    default: () => ({})
  },
  maxVisible: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['apply', 'create', 'delete'])

const showAll = ref(false)
const showCreateModal = ref(false)
const newPreset = ref({
  name: '',
  icon: '⭐'
})

const iconOptions = [
  '⭐', '📌', '🎯', '💎', '🔥', '⚡',
  '🎨', '🎭', '🎪', '🎸', '🎮', '🎲',
  '🍕', '☕', '🍜', '🍱', '🎂', '🍰',
  '🏠', '🚗', '✈️', '🚀', '⚽', '🏆'
]

const visiblePresets = computed(() => {
  if (showAll.value) return props.presets
  return props.presets.slice(0, props.maxVisible)
})

const isActivePreset = (presetId) => {
  return props.activePresetId === presetId
}

const handleCreatePreset = () => {
  if (!newPreset.value.name.trim()) return

  emit('create', {
    name: newPreset.value.name.trim(),
    icon: newPreset.value.icon,
    filters: props.currentFilters
  })

  // Reset form
  newPreset.value = {
    name: '',
    icon: '⭐'
  }
  showCreateModal.value = false
}
</script>
