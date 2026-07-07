<template>
  <teleport to="body">
    <transition name="confirm-dialog">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        @click.self="handleCancel"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleCancel"
        />

        <!-- Dialog Card -->
        <div
          class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <!-- Icon -->
          <div
            v-if="icon"
            class="flex items-center justify-center pt-6 pb-3"
          >
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center"
              :class="iconBgClass"
            >
              <component
                :is="iconComponent"
                class="w-7 h-7"
                :class="iconColorClass"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="px-6 pb-6" :class="{ 'pt-6': !icon }">
            <h3
              v-if="title"
              class="text-lg font-bold text-slate-900 dark:text-slate-100 text-center mb-2"
            >
              {{ title }}
            </h3>
            <p
              v-if="message"
              class="text-sm text-slate-600 dark:text-slate-400 text-center"
            >
              {{ message }}
            </p>
            <slot />
          </div>

          <!-- Actions -->
          <div class="px-6 pb-6 flex items-center gap-3">
            <button
              @click="handleCancel"
              class="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
              :class="cancelButtonClass"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              class="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
              :class="confirmButtonClass"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, h } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Konfirmasi'
  },
  cancelText: {
    type: String,
    default: 'Batal'
  },
  variant: {
    type: String,
    default: 'danger', // 'danger', 'warning', 'info', 'success'
    validator: (value) => ['danger', 'warning', 'info', 'success'].includes(value)
  },
  icon: {
    type: String,
    default: 'warning' // 'warning', 'trash', 'info', 'check'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const handleConfirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const iconComponent = computed(() => {
  const icons = {
    warning: () => h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 2
    }, [
      h('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
      })
    ]),
    trash: () => h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 2
    }, [
      h('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
      })
    ]),
    info: () => h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 2
    }, [
      h('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ]),
    check: () => h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 2
    }, [
      h('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ])
  }
  return icons[props.icon] || icons.warning
})

const iconBgClass = computed(() => {
  const classes = {
    danger: 'bg-red-100 dark:bg-red-500/15',
    warning: 'bg-amber-100 dark:bg-amber-500/15',
    info: 'bg-blue-100 dark:bg-blue-500/15',
    success: 'bg-emerald-100 dark:bg-emerald-500/15'
  }
  return classes[props.variant] || classes.danger
})

const iconColorClass = computed(() => {
  const classes = {
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-emerald-600 dark:text-emerald-400'
  }
  return classes[props.variant] || classes.danger
})

const cancelButtonClass = computed(() => {
  return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
})

const confirmButtonClass = computed(() => {
  const classes = {
    danger: 'text-white bg-red-500 hover:bg-red-600 shadow-sm',
    warning: 'text-white bg-amber-500 hover:bg-amber-600 shadow-sm',
    info: 'text-white bg-blue-500 hover:bg-blue-600 shadow-sm',
    success: 'text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm'
  }
  return classes[props.variant] || classes.danger
})
</script>

<style scoped>
.confirm-dialog-enter-active,
.confirm-dialog-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-dialog-enter-active > div:last-child,
.confirm-dialog-leave-active > div:last-child {
  transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease;
}

.confirm-dialog-enter-from,
.confirm-dialog-leave-to {
  opacity: 0;
}

.confirm-dialog-enter-from > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}

.confirm-dialog-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}
</style>
