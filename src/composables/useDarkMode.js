import { ref, onMounted } from 'vue'

const isDark = ref(false)
let transitionTimer

/**
 * Composable for dark mode
 */
export function useDarkMode() {
  /**
   * Toggle dark mode
   */
  const toggleDark = () => {
    startThemeTransition()
    isDark.value = !isDark.value
    updateTheme()
  }

  /**
   * Set dark mode
   */
  const setDark = (value) => {
    if (isDark.value === value) return
    startThemeTransition()
    isDark.value = value
    updateTheme()
  }

  /**
   * Enable color transitions only while the theme changes.
   */
  const startThemeTransition = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.documentElement.classList.add('theme-transitioning')
    window.clearTimeout(transitionTimer)
    transitionTimer = window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 350)
  }

  /**
   * Update theme in DOM and localStorage
   */
  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('duitku_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('duitku_theme', 'light')
    }
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  const initTheme = () => {
    const savedTheme = localStorage.getItem('duitku_theme')

    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    updateTheme()
  }

  onMounted(() => {
    initTheme()
  })

  return {
    isDark,
    toggleDark,
    setDark,
    initTheme
  }
}
