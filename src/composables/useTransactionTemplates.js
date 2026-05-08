import { ref } from 'vue'

const STORAGE_KEY = 'duitku_templates'

/**
 * Composable for managing transaction templates
 * Templates are stored in localStorage for quick access
 */
export function useTransactionTemplates() {
  const templates = ref(loadTemplates())

  /**
   * Load templates from localStorage
   */
  function loadTemplates() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  /**
   * Save templates to localStorage
   */
  function saveTemplates() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value))
  }

  /**
   * Add a new template
   */
  const addTemplate = ({ name, type, categoryId, amount, description }) => {
    const template = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name,
      type,
      categoryId,
      amount,
      description: description || '',
      usageCount: 0,
      createdAt: new Date().toISOString(),
    }
    templates.value.unshift(template)
    saveTemplates()
    return template
  }

  /**
   * Update a template
   */
  const updateTemplate = (id, updates) => {
    const idx = templates.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      templates.value[idx] = { ...templates.value[idx], ...updates }
      saveTemplates()
    }
  }

  /**
   * Delete a template
   */
  const deleteTemplate = (id) => {
    templates.value = templates.value.filter(t => t.id !== id)
    saveTemplates()
  }

  /**
   * Use a template (increment usage count for sorting)
   */
  const useTemplate = (id) => {
    const idx = templates.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      templates.value[idx].usageCount = (templates.value[idx].usageCount || 0) + 1
      templates.value[idx].lastUsed = new Date().toISOString()
      saveTemplates()
      return templates.value[idx]
    }
    return null
  }

  /**
   * Get templates sorted by usage (most used first)
   */
  const getSortedTemplates = (type = null) => {
    let filtered = templates.value
    if (type) {
      filtered = filtered.filter(t => t.type === type)
    }
    return [...filtered].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
  }

  /**
   * Save current transaction as template
   */
  const saveAsTemplate = (transaction, templateName) => {
    return addTemplate({
      name: templateName,
      type: transaction.type,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      description: transaction.description,
    })
  }

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    getSortedTemplates,
    saveAsTemplate,
  }
}
