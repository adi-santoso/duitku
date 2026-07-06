/**
 * Composable for mobile touch interactions
 * Provides utilities for touch gestures, haptic feedback, and mobile UX enhancements
 */

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Detect if device is mobile
 */
export function useMobileDetection() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isTouch = ref(false)

  const detectDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera

    // Check for mobile devices
    isMobile.value = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())

    // Check for tablets
    isTablet.value = /ipad|android(?!.*mobile)|tablet/i.test(userAgent.toLowerCase())

    // Check for touch support
    isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  onMounted(() => {
    detectDevice()
  })

  return {
    isMobile,
    isTablet,
    isTouch,
    isDesktop: ref(!isMobile.value && !isTablet.value)
  }
}

/**
 * Haptic feedback for mobile devices
 */
export function useHapticFeedback() {
  const vibrate = (pattern = [10]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  const lightTap = () => vibrate([5])
  const mediumTap = () => vibrate([10])
  const heavyTap = () => vibrate([15])
  const success = () => vibrate([10, 50, 10])
  const error = () => vibrate([15, 50, 15, 50, 15])
  const warning = () => vibrate([10, 30, 10])

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    success,
    error,
    warning
  }
}

/**
 * Long press gesture
 */
export function useLongPress(callback, delay = 500) {
  let timeout = null
  let startPos = { x: 0, y: 0 }
  const threshold = 10 // pixels

  const start = (e) => {
    const touch = e.touches ? e.touches[0] : e
    startPos = { x: touch.clientX, y: touch.clientY }

    timeout = setTimeout(() => {
      callback()
    }, delay)
  }

  const move = (e) => {
    const touch = e.touches ? e.touches[0] : e
    const dx = Math.abs(touch.clientX - startPos.x)
    const dy = Math.abs(touch.clientY - startPos.y)

    // Cancel if moved too much
    if (dx > threshold || dy > threshold) {
      cancel()
    }
  }

  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: cancel,
    onMouseLeave: cancel
  }
}

/**
 * Pull to refresh gesture
 */
export function usePullToRefresh(callback, threshold = 80) {
  const isPulling = ref(false)
  const pullDistance = ref(0)
  const canRefresh = ref(false)

  let startY = 0
  let scrollTop = 0

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    startY = touch.clientY
    scrollTop = window.scrollY || document.documentElement.scrollTop
  }

  const handleTouchMove = (e) => {
    // Only trigger at top of page
    if (scrollTop > 0) return

    const touch = e.touches[0]
    const diff = touch.clientY - startY

    if (diff > 0) {
      isPulling.value = true
      pullDistance.value = Math.min(diff * 0.5, threshold * 1.5)
      canRefresh.value = pullDistance.value >= threshold

      // Prevent default scroll when pulling
      if (pullDistance.value > 10) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = async () => {
    if (canRefresh.value) {
      await callback()
    }

    isPulling.value = false
    pullDistance.value = 0
    canRefresh.value = false
  }

  return {
    isPulling,
    pullDistance,
    canRefresh,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}

/**
 * Double tap gesture
 */
export function useDoubleTap(callback, delay = 300) {
  let lastTap = 0

  const handleTap = (e) => {
    const now = Date.now()

    if (now - lastTap < delay) {
      callback(e)
      lastTap = 0
    } else {
      lastTap = now
    }
  }

  return {
    onTouchEnd: handleTap,
    onClick: handleTap
  }
}

/**
 * Prevent zoom on double tap (iOS)
 */
export function usePreventZoom() {
  onMounted(() => {
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }, { passive: false })

    let lastTouchEnd = 0
    document.addEventListener('touchend', (e) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }, false)
  })
}

/**
 * Safe area insets for notched devices
 */
export function useSafeAreaInsets() {
  const safeAreaTop = ref(0)
  const safeAreaBottom = ref(0)
  const safeAreaLeft = ref(0)
  const safeAreaRight = ref(0)

  onMounted(() => {
    const computedStyle = getComputedStyle(document.documentElement)
    safeAreaTop.value = parseInt(computedStyle.getPropertyValue('--sat') || '0')
    safeAreaBottom.value = parseInt(computedStyle.getPropertyValue('--sab') || '0')
    safeAreaLeft.value = parseInt(computedStyle.getPropertyValue('--sal') || '0')
    safeAreaRight.value = parseInt(computedStyle.getPropertyValue('--sar') || '0')
  })

  return {
    safeAreaTop,
    safeAreaBottom,
    safeAreaLeft,
    safeAreaRight
  }
}

/**
 * Handle iOS keyboard resize
 */
export function useKeyboardResize() {
  const keyboardHeight = ref(0)
  const isKeyboardOpen = ref(false)

  onMounted(() => {
    const visualViewport = window.visualViewport

    if (!visualViewport) return

    const handleResize = () => {
      const windowHeight = window.innerHeight
      const viewportHeight = visualViewport.height

      keyboardHeight.value = windowHeight - viewportHeight
      isKeyboardOpen.value = keyboardHeight.value > 100
    }

    visualViewport.addEventListener('resize', handleResize)

    onUnmounted(() => {
      visualViewport.removeEventListener('resize', handleResize)
    })
  })

  return {
    keyboardHeight,
    isKeyboardOpen
  }
}
