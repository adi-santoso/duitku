import { ref, onMounted } from 'vue'

const isDark = ref(false)

/**
 * Composable for dark mode
 */
export function useDarkMode() {
  /**
   * Toggle dark mode
   */
  const toggleDark = () => {
    isDark.value = !isDark.value
    updateTheme()
  }

  /**
   * Set dark mode
   */
  const setDark = (value) => {
    isDark.value = value
    updateTheme()
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
