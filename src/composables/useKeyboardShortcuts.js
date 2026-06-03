import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Global keyboard shortcuts composable
 *
 * Shortcuts:
 * - N: New transaction (opens FAB)
 * - /: Focus search (on transactions page)
 * - G then H: Go to Home/Dashboard
 * - G then T: Go to Transactions
 * - G then R: Go to Reports
 * - G then B: Go to Budgets
 * - G then S: Go to Savings Goals
 * - ?: Show shortcuts help
 * - Escape: Close modals
 */
export function useKeyboardShortcuts() {
  const router = useRouter()
  const showHelp = ref(false)
  const pendingPrefix = ref(null)
  let prefixTimer = null

  const shortcuts = [
    { keys: 'N', description: 'Transaksi baru', category: 'Aksi' },
    { keys: '/', description: 'Fokus pencarian', category: 'Aksi' },
    { keys: '?', description: 'Tampilkan bantuan shortcut', category: 'Aksi' },
    { keys: 'Esc', description: 'Tutup modal/popup', category: 'Aksi' },
    { keys: 'G → H', description: 'Ke Dashboard', category: 'Navigasi' },
    { keys: 'G → T', description: 'Ke Transaksi', category: 'Navigasi' },
    { keys: 'G → R', description: 'Ke Laporan', category: 'Navigasi' },
    { keys: 'G → B', description: 'Ke Anggaran', category: 'Navigasi' },
    { keys: 'G → S', description: 'Ke Target Tabungan', category: 'Navigasi' },
    { keys: 'G → C', description: 'Ke Kategori', category: 'Navigasi' },
  ]

  const isInputFocused = () => {
    const el = document.activeElement
    if (!el) return false
    const tag = el.tagName.toLowerCase()
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable
  }

  const handleKeydown = (e) => {
    // Guard against undefined key
    if (!e.key) return

    // Don't trigger shortcuts when typing in inputs
    if (isInputFocused() && e.key !== 'Escape') return

    // Don't trigger on modifier keys (except shift for ?)
    if (e.ctrlKey || e.altKey || e.metaKey) return

    const key = e.key.toLowerCase()

    // Handle Escape
    if (e.key === 'Escape') {
      showHelp.value = false
      // Dispatch custom event for modals to listen to
      window.dispatchEvent(new CustomEvent('shortcut-escape'))
      return
    }

    // Handle ? (show help)
    if (e.key === '?') {
      e.preventDefault()
      showHelp.value = !showHelp.value
      return
    }

    // Handle prefix sequences (G → ...)
    if (pendingPrefix.value === 'g') {
      e.preventDefault()
      clearTimeout(prefixTimer)
      pendingPrefix.value = null

      const routes = {
        h: '/',
        t: '/transactions',
        r: '/reports',
        b: '/budgets',
        s: '/savings',
        c: '/categories',
      }

      if (routes[key]) {
        router.push(routes[key])
      }
      return
    }

    // Start prefix sequence
    if (key === 'g') {
      e.preventDefault()
      pendingPrefix.value = 'g'
      prefixTimer = setTimeout(() => {
        pendingPrefix.value = null
      }, 1000) // 1 second to press next key
      return
    }

    // Handle N (new transaction)
    if (key === 'n') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('shortcut-new-transaction'))
      return
    }

    // Handle / (focus search)
    if (e.key === '/') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('shortcut-focus-search'))
      return
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    clearTimeout(prefixTimer)
  })

  return {
    showHelp,
    shortcuts,
  }
}
