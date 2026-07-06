<template>
  <div class="swipeable-item" ref="containerRef">
    <!-- Background Actions (revealed on swipe) -->
    <div class="swipe-actions">
      <!-- Left Action (Edit) -->
      <div class="swipe-action swipe-action-left">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
        <span class="text-xs font-semibold">Edit</span>
      </div>

      <!-- Right Action (Delete) -->
      <div class="swipe-action swipe-action-right">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        <span class="text-xs font-semibold">Hapus</span>
      </div>
    </div>

    <!-- Foreground Content (swipeable) -->
    <div
      class="swipe-content"
      ref="contentRef"
      :style="{ transform: `translateX(${translateX}px)` }"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @click="handleClick"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'click'])

const containerRef = ref(null)
const contentRef = ref(null)
const translateX = ref(0)
const startX = ref(0)
const isDragging = ref(false)
const lastTapTime = ref(0)

const SWIPE_THRESHOLD = 80 // Minimum swipe distance to trigger action
const MAX_SWIPE = 100 // Maximum swipe distance

const handleTouchStart = (e) => {
  if (props.disabled) return

  startX.value = e.touches[0].clientX
  isDragging.value = true
  contentRef.value.style.transition = 'none'
}

const handleTouchMove = (e) => {
  if (!isDragging.value || props.disabled) return

  const currentX = e.touches[0].clientX
  const deltaX = currentX - startX.value

  // Limit swipe range
  if (deltaX > 0) {
    // Swipe right (edit)
    translateX.value = Math.min(deltaX, MAX_SWIPE)
  } else {
    // Swipe left (delete)
    translateX.value = Math.max(deltaX, -MAX_SWIPE)
  }
}

const handleTouchEnd = () => {
  if (!isDragging.value || props.disabled) return

  isDragging.value = false
  contentRef.value.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'

  // Trigger action if swipe exceeds threshold
  if (translateX.value > SWIPE_THRESHOLD) {
    // Swipe right - edit
    vibrate(10)
    emit('edit')
    resetPosition()
  } else if (translateX.value < -SWIPE_THRESHOLD) {
    // Swipe left - delete
    vibrate(10)
    emit('delete')
    resetPosition()
  } else {
    // Return to original position
    resetPosition()
  }
}

const handleClick = (e) => {
  // Prevent click if we just swiped
  if (Math.abs(translateX.value) > 5) {
    e.stopPropagation()
    resetPosition()
    return
  }

  // Handle double-tap to edit (for accessibility)
  const now = Date.now()
  const timeSinceLastTap = now - lastTapTime.value
  lastTapTime.value = now

  if (timeSinceLastTap < 300) {
    // Double tap - edit
    emit('edit')
  } else {
    // Single tap - view
    emit('click')
  }
}

const resetPosition = () => {
  translateX.value = 0
}

const vibrate = (duration) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration)
  }
}

// Expose reset method for parent
defineExpose({ resetPosition })
</script>

<style scoped>
.swipeable-item {
  position: relative;
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;
}

.swipe-actions {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
}

.swipe-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100px;
  flex-shrink: 0;
}

.swipe-action-left {
  background: linear-gradient(to right, #10b981, #059669);
  color: white;
}

.swipe-action-right {
  background: linear-gradient(to left, #ef4444, #dc2626);
  color: white;
  margin-left: auto;
}

.swipe-content {
  position: relative;
  background: inherit;
  z-index: 1;
  cursor: grab;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.swipe-content:active {
  cursor: grabbing;
}

/* Disable swipe on desktop */
@media (min-width: 768px) {
  .swipeable-item {
    overflow: visible;
  }

  .swipe-actions {
    display: none;
  }

  .swipe-content {
    cursor: pointer;
  }
}
</style>
