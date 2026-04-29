import { ref, computed } from 'vue'
import { queryAll, insert, query } from '@/utils/db'
import { useAuth } from './useAuth'

/**
 * Composable for categories management
 */
export function useCategories() {
  const { getUserId } = useAuth()
  const categories = ref([])

  /**
   * Load all categories
   */
  const loadCategories = () => {
    const userId = getUserId()
    categories.value = queryAll(`
      SELECT * FROM categories
      WHERE is_default = 1 OR user_id = ?
      ORDER BY type, name
    `, [userId])
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
  const addCategory = (name, type, icon, color) => {
    const userId = getUserId()
    const id = insert(`
      INSERT INTO categories (name, type, icon, color, is_default, user_id)
      VALUES (?, ?, ?, ?, 0, ?)
    `, [name, type, icon, color, userId])

    loadCategories()
    return id
  }

  /**
   * Update category
   */
  const updateCategory = (id, name, icon, color) => {
    query(`
      UPDATE categories
      SET name = ?, icon = ?, color = ?
      WHERE id = ? AND is_default = 0
    `, [name, icon, color, id])

    loadCategories()
  }

  /**
   * Delete category
   */
  const deleteCategory = (id) => {
    query(`
      DELETE FROM categories
      WHERE id = ? AND is_default = 0
    `, [id])

    loadCategories()
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
