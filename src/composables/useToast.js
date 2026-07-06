import { ref } from 'vue'

/**
 * Global toast notifications with undo action support
 * Types: success, error, warning, info
 */
const toasts = ref([])
let toastId = 0

export function useToast() {
  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   * @param {string} options.type - Toast type (success, error, warning, info)
   * @param {number} options.duration - Duration in ms (default 3000, 0 = no auto dismiss)
   * @param {Object} options.action - Action button { label: string, handler: function }
   * @param {boolean} options.dismissible - Can be manually dismissed (default true)
   */
  const showToast = (message, options = {}) => {
    const id = ++toastId
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration !== undefined ? options.duration : 3000,
      action: options.action || null,
      dismissible: options.dismissible !== false,
      visible: true
    }

    toasts.value.push(toast)

    // Auto dismiss
    if (toast.duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, toast.duration)
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
  const success = (message, options = {}) => showToast(message, { ...options, type: 'success' })
  const error = (message, options = {}) => showToast(message, { ...options, type: 'error', duration: options.duration || 4000 })
  const warning = (message, options = {}) => showToast(message, { ...options, type: 'warning' })
  const info = (message, options = {}) => showToast(message, { ...options, type: 'info' })

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
