import { ref, watch, onMounted } from 'vue'

/**
 * Animates number transitions with easing
 * @param {number} target - Target number to animate to
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration in ms (default: 800)
 * @param {Function} options.easing - Easing function (default: easeOutQuad)
 * @returns {Object} - { displayValue, restart }
 */
export function useCountUp(target, options = {}) {
  const {
    duration = 800,
    easing = easeOutQuad,
    decimals = 0,
    prefix = '',
    suffix = ''
  } = options

  const displayValue = ref(0)
  const startValue = ref(0)
  const endValue = ref(target)
  let animationFrame = null

  function easeOutQuad(t) {
    return t * (2 - t)
  }

  function animate(startTime) {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const easedProgress = easing(progress)
    const diff = endValue.value - startValue.value
    displayValue.value = startValue.value + (diff * easedProgress)

    if (progress < 1) {
      animationFrame = requestAnimationFrame(() => animate(startTime))
    } else {
      displayValue.value = endValue.value
    }
  }

  function start(newTarget) {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }

    startValue.value = displayValue.value
    endValue.value = newTarget

    const startTime = Date.now()
    animate(startTime)
  }

  // Watch for target changes
  watch(() => target, (newValue) => {
    start(newValue)
  })

  // Initialize on mount
  onMounted(() => {
    start(target)
  })

  const formattedValue = ref('')
  watch(displayValue, (val) => {
    const fixed = val.toFixed(decimals)
    formattedValue.value = `${prefix}${fixed}${suffix}`
  })

  return {
    displayValue,
    formattedValue,
    restart: start
  }
}
