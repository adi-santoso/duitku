import { ref, onMounted, onUnmounted } from 'vue'

/**
 * PWA composable — handles service worker, install prompt, and online/offline status
 */

const isOnline = ref(navigator.onLine)
const canInstall = ref(false)
const isInstalled = ref(false)
const needsUpdate = ref(false)
const swRegistration = ref(null)

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
 * Register the service worker
 */
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service workers not supported')
    return
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    swRegistration.value = registration
    console.log('[PWA] Service worker registered:', registration.scope)

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          needsUpdate.value = true
          console.log('[PWA] New version available')
        }
      })
    })

    // Check for updates periodically (every 60 minutes)
    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error)
  }
}

/**
 * Apply pending update — reload with new service worker
 */
function applyUpdate() {
  if (swRegistration.value && swRegistration.value.waiting) {
    swRegistration.value.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
  window.location.reload()
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

    // Register service worker
    registerServiceWorker()
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
