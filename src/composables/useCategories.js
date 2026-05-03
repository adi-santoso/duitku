import { ref, computed } from 'vue'
import { api } from '@/utils/api'

/**
 * Composable for categories management via backend API
 * Staff and owner share the same categories (backend handles via ownerId in JWT)
 */
export function useCategories() {
  const categories = ref([])

  /**
   * Load all categories (default + owner's custom)
   */
  const loadCategories = async () => {
    try {
      const data = await api.categories.list()
      categories.value = data || []
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  /**
   * Get categories by type
   */
  const getCategoriesByType = (type) => {
    return computed(() => {
      return categories.value.filter(cat => cat.type === type)
    })
  }

  /**
   * Get expense categories
   */
  const expenseCategories = computed(() => {
    return categories.value.filter(cat => cat.type === 'expense')
  })

  /**
   * Get income categories
   */
  const incomeCategories = computed(() => {
    return categories.value.filter(cat => cat.type === 'income')
  })

  /**
   * Add new category
   */
  const addCategory = async (name, type, icon, color) => {
    const data = await api.categories.create({ name, type, icon, color })
    await loadCategories()
    return data.id
  }

  /**
   * Update category
   */
  const updateCategory = async (id, name, icon, color) => {
    await api.categories.update(id, { name, icon, color })
    await loadCategories()
  }

  /**
   * Delete category
   */
  const deleteCategory = async (id) => {
    await api.categories.delete(id)
    await loadCategories()
  }

  /**
   * Get category by ID
   */
  const getCategoryById = (id) => {
    return categories.value.find(cat => cat.id === id)
  }

  return {
    categories,
    expenseCategories,
    incomeCategories,
    loadCategories,
    getCategoriesByType,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
  }
}
