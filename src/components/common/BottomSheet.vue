<template>
  <teleport to="body">
    <transition name="bottom-sheet">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center"
        @click.self="handleClose"
        @touchmove.prevent
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleClose"
          @touchmove.prevent
        />

        <!-- Bottom Sheet Container -->
        <div
          ref="sheetRef"
          class="relative w-full bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-float lg:max-w-xl lg:rounded-3xl overflow-hidden flex flex-col"
          :class="[
            fullHeight ? 'h-full lg:h-auto' : 'max-h-[90vh]',
            'rounded-t-3xl lg:rounded-b-3xl',
            snapToTop ? 'h-[95vh]' : ''
          ]"
          :style="{ transform: `translateY(${dragOffset}px)` }"
          @touchstart.passive="handleTouchStart"
          @touchmove.passive="handleTouchMove"
          @touchend.passive="handleTouchEnd"
          @wheel.stop
        >
          <!-- Drag Handle (Mobile Only) -->
          <div class="lg:hidden sticky top-0 z-10 bg-surface dark:bg-ink-900 pt-2.5 pb-2 px-4">
            <div class="w-12 h-1 bg-ink-900/20 dark:bg-white/20 rounded-full mx-auto" />
          </div>

          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="sticky top-10 lg:top-0 z-10 bg-surface/95 dark:bg-ink-900/95 backdrop-blur-md px-6 py-4 border-b border-ink-900/10 dark:border-white/10"
          >
            <slot name="header">
              <div class="flex items-center justify-between">
                <h3 class="font-display text-lg font-extrabold text-ink-900 dark:text-white">
                  {{ title }}
                </h3>
                <button
                  v-if="showClose"
                  @click="handleClose"
                  class="p-2 -mr-2 rounded-xl hover:bg-canvas dark:hover:bg-ink-800 text-ink-500 dark:text-slate-400 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </slot>
          </div>

          <!-- Content -->
          <div
            ref="contentRef"
            class="overflow-y-auto flex-1"
            :class="contentClass"
            @touchstart.stop
            @touchmove.stop
          >
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="sticky bottom-0 z-10 bg-surface/95 dark:bg-ink-900/95 backdrop-blur-md px-6 border-t border-ink-900/10 dark:border-white/10 safe-area-bottom"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  showClose: {
    type: Boolean,
    default: true
  },
  fullHeight: {
    type: Boolean,
    default: false
  },
  snapToTop: {
    type: Boolean,
    default: false
  },
  contentClass: {
    type: String,
    default: 'p-5'
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  swipeToClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const sheetRef = ref(null)
const contentRef = ref(null)
const dragOffset = ref(0)
const startY = ref(0)
const isDragging = ref(false)
const isDraggingFromHandle = ref(false)

const handleClose = () => {
  if (!props.closeOnBackdrop) return
  emit('update:modelValue', false)
  emit('close')
}

const handleTouchStart = (e) => {
  if (!props.swipeToClose) return

  const touch = e.touches[0]
  startY.value = touch.clientY
  isDragging.value = true

  // Check if dragging from drag handle area (top 60px)
  const rect = sheetRef.value?.getBoundingClientRect()
  if (rect && touch.clientY - rect.top < 60) {
    isDraggingFromHandle.value = true
  } else {
    // Check if content is scrolled to top
    if (contentRef.value) {
      isDraggingFromHandle.value = contentRef.value.scrollTop === 0
    }
  }
}

const handleTouchMove = (e) => {
  if (!isDragging.value || !props.swipeToClose) return

  const currentY = e.touches[0].clientY
  const diff = currentY - startY.value

  // Only allow dragging down from handle or when content is at top
  if (diff > 0 && isDraggingFromHandle.value) {
    dragOffset.value = diff
    // Prevent content scroll when dragging
    e.preventDefault()
  } else if (diff < 0) {
    // Allow scrolling up
    isDraggingFromHandle.value = false
  }
}

const handleTouchEnd = () => {
  if (!isDragging.value || !props.swipeToClose) return

  isDragging.value = false
  isDraggingFromHandle.value = false

  // Close if dragged more than 150px
  if (dragOffset.value > 150) {
    handleClose()
  }

  // Reset position
  dragOffset.value = 0
}

// Lock body scroll when bottom sheet is open
watch(() => props.modelValue, async (isOpen) => {
  await nextTick()
  if (isOpen) {
    // Store current scroll position
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
  } else {
    // Restore scroll position
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
    dragOffset.value = 0
  }
})
</script>

<style scoped>
.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: opacity 0.3s ease;
}

.bottom-sheet-enter-active > div:last-child,
.bottom-sheet-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}

.bottom-sheet-enter-from > div:last-child {
  transform: translateY(100%);
}

.bottom-sheet-leave-to > div:last-child {
  transform: translateY(100%);
}

@media (min-width: 1024px) {
  .bottom-sheet-enter-from > div:last-child,
  .bottom-sheet-leave-to > div:last-child {
    transform: translateY(0) scale(0.95);
  }
}

.safe-area-bottom {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  padding-top: 1rem;
}
</style>
