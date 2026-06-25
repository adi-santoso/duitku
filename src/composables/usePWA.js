import { ref, onMounted, onUnmounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

/**
 * PWA composable — handles service worker, install prompt, and online/offline status
 */

const isOnline = ref(navigator.onLine)
const canInstall = ref(false)
const isInstalled = ref(false)

/** @type {BeforeInstallPromptEvent|null} */
let deferredPrompt = null

/**
 * Check if app is already installed as PWA
 */
function checkIfInstalled() {
  // Check display-mode media query
  if (window.matchMedia('(display-mode: standalone)').matches) {
    isInstalled.value = true
    return
  }
  // iOS Safari
  if (window.navigator.standalone === true) {
    isInstalled.value = true
    return
  }
  isInstalled.value = false
}

/**
 * Trigger the install prompt
 */
async function installApp() {
  if (!deferredPrompt) return false

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  if (outcome === 'accepted') {
    console.log('[PWA] App installed')
    canInstall.value = false
    isInstalled.value = true
  }

  deferredPrompt = null
  return outcome === 'accepted'
}

export function usePWA() {
  // Use vite-plugin-pwa's built-in registration
  const {
    needRefresh: needsUpdate,
    updateServiceWorker: applyUpdate
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[PWA] Service worker registered:', r?.scope)
      // Check for updates every 60 minutes
      if (r) {
        setInterval(() => {
          r.update()
        }, 60 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration failed:', error)
    }
  })

  let onlineHandler = null
  let offlineHandler = null
  let beforeInstallHandler = null
  let appInstalledHandler = null

  onMounted(() => {
    checkIfInstalled()

    // Online/offline listeners
    onlineHandler = () => { isOnline.value = true }
    offlineHandler = () => { isOnline.value = false }
    window.addEventListener('online', onlineHandler)
    window.addEventListener('offline', offlineHandler)

    // Install prompt listener
    beforeInstallHandler = (e) => {
      e.preventDefault()
      deferredPrompt = e
      canInstall.value = true
      console.log('[PWA] Install prompt available')
    }
    window.addEventListener('beforeinstallprompt', beforeInstallHandler)

    // App installed listener
    appInstalledHandler = () => {
      canInstall.value = false
      isInstalled.value = true
      deferredPrompt = null
      console.log('[PWA] App was installed')
    }
    window.addEventListener('appinstalled', appInstalledHandler)
  })

  onUnmounted(() => {
    if (onlineHandler) window.removeEventListener('online', onlineHandler)
    if (offlineHandler) window.removeEventListener('offline', offlineHandler)
    if (beforeInstallHandler) window.removeEventListener('beforeinstallprompt', beforeInstallHandler)
    if (appInstalledHandler) window.removeEventListener('appinstalled', appInstalledHandler)
  })

  return {
    isOnline,
    canInstall,
    isInstalled,
    needsUpdate,
    installApp,
    applyUpdate
  }
}

