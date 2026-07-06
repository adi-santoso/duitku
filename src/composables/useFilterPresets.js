import { ref } from 'vue'

/**
 * Composable for managing filter presets
 * Stores presets in localStorage for persistence
 */
export function useFilterPresets() {
  const STORAGE_KEY = 'duitku_filter_presets'
  const presets = ref([])

  /**
   * Default presets that are always available
   */
  const defaultPresets = [
    {
      id: 'this-week',
      name: 'Minggu Ini',
      icon: '📅',
      isDefault: true,
      filters: {
        dateRange: 'this-week'
      }
    },
    {
      id: 'this-month',
      name: 'Bulan Ini',
      icon: '📆',
      isDefault: true,
      filters: {
        dateRange: 'this-month'
      }
    },
    {
      id: 'last-30-days',
      name: '30 Hari Terakhir',
      icon: '📊',
      isDefault: true,
      filters: {
        dateRange: 'last-30-days'
      }
    },
    {
      id: 'high-value',
      name: 'Transaksi Besar',
      icon: '💎',
      isDefault: true,
      filters: {
        amountMin: 500000
      }
    },
    {
      id: 'with-receipt',
      name: 'Ada Struk',
      icon: '📸',
      isDefault: true,
      filters: {
        hasReceipt: true
      }
    },
    {
      id: 'recurring',
      name: 'Berulang',
      icon: '🔄',
      isDefault: true,
      filters: {
        isRecurring: true
      }
    }
  ]

  /**
   * Load presets from localStorage
   */
  const loadPresets = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const custom = stored ? JSON.parse(stored) : []
      presets.value = [...defaultPresets, ...custom]
    } catch (err) {
      console.error('Failed to load filter presets:', err)
      presets.value = [...defaultPresets]
    }
  }

  /**
   * Save custom presets to localStorage
   */
  const savePresetsToStorage = () => {
    try {
      const custom = presets.value.filter(p => !p.isDefault)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
    } catch (err) {
      console.error('Failed to save filter presets:', err)
    }
  }

  /**
   * Create new preset
   */
  const createPreset = (name, icon, filters) => {
    const preset = {
      id: `custom-${Date.now()}`,
      name,
      icon,
      isDefault: false,
      filters,
      createdAt: new Date().toISOString()
    }

    presets.value.push(preset)
    savePresetsToStorage()
    return preset
  }

  /**
   * Update existing preset
   */
  const updatePreset = (id, updates) => {
    const index = presets.value.findIndex(p => p.id === id)
    if (index === -1 || presets.value[index].isDefault) return

    presets.value[index] = {
      ...presets.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    savePresetsToStorage()
  }

  /**
   * Delete preset
   */
  const deletePreset = (id) => {
    const preset = presets.value.find(p => p.id === id)
    if (!preset || preset.isDefault) return

    presets.value = presets.value.filter(p => p.id !== id)
    savePresetsToStorage()
  }

  /**
   * Get preset by ID
   */
  const getPreset = (id) => {
    return presets.value.find(p => p.id === id)
  }

  /**
   * Get custom presets only
   */
  const customPresets = () => {
    return presets.value.filter(p => !p.isDefault)
  }

  /**
   * Apply date range preset
   */
  const getDateRangeForPreset = (dateRange) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (dateRange) {
      case 'today':
        return {
          startDate: formatDate(today),
          endDate: formatDate(today)
        }

      case 'yesterday': {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return {
          startDate: formatDate(yesterday),
          endDate: formatDate(yesterday)
        }
      }

      case 'this-week': {
        const firstDay = new Date(today)
        const dayOfWeek = today.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        firstDay.setDate(today.getDate() + diff)

        return {
          startDate: formatDate(firstDay),
          endDate: formatDate(today)
        }
      }

      case 'last-week': {
        const firstDay = new Date(today)
        const dayOfWeek = today.getDay()
        const diff = dayOfWeek === 0 ? -13 : -6 - dayOfWeek
        firstDay.setDate(today.getDate() + diff)

        const lastDay = new Date(firstDay)
        lastDay.setDate(firstDay.getDate() + 6)

        return {
          startDate: formatDate(firstDay),
          endDate: formatDate(lastDay)
        }
      }

      case 'this-month': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        return {
          startDate: formatDate(firstDay),
          endDate: formatDate(today)
        }
      }

      case 'last-month': {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
        return {
          startDate: formatDate(firstDay),
          endDate: formatDate(lastDay)
        }
      }

      case 'last-30-days': {
        const startDay = new Date(today)
        startDay.setDate(startDay.getDate() - 30)
        return {
          startDate: formatDate(startDay),
          endDate: formatDate(today)
        }
      }

      case 'last-90-days': {
        const startDay = new Date(today)
        startDay.setDate(startDay.getDate() - 90)
        return {
          startDate: formatDate(startDay),
          endDate: formatDate(today)
        }
      }

      default:
        return null
    }
  }

  /**
   * Format date to YYYY-MM-DD
   */
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Initialize
  loadPresets()

  return {
    presets,
    defaultPresets,
    loadPresets,
    createPreset,
    updatePreset,
    deletePreset,
    getPreset,
    customPresets,
    getDateRangeForPreset
  }
}
