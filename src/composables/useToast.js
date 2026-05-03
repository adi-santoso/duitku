import { ref } from 'vue'

/**
 * Global toast notifications
 * Types: success, error, warning, info
 */
const toasts = ref([])
let toastId = 0

export function useToast() {
  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {'success'|'error'|'warning'|'info'} type - Toast type
   * @param {number} duration - Duration in ms (default 3000)
   */
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = ++toastId
    const toast = { id, message, type, visible: true }
    toasts.value.push(toast)

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }

    return id
  }

  const dismissToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value[index].visible = false
      // Remove from array after animation
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }
  }

  // Shorthand methods
  const success = (message, duration) => showToast(message, 'success', duration)
  const error = (message, duration = 4000) => showToast(message, 'error', duration)
  const warning = (message, duration) => showToast(message, 'warning', duration)
  const info = (message, duration) => showToast(message, 'info', duration)

  return {
    toasts,
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info
  }
}
