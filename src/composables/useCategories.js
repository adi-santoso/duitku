import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuth } from './useAuth'

/**
 * Composable for categories management with Supabase
 * Staff and owner share the same categories via getDataOwnerId()
 */
export function useCategories() {
  const { getDataOwnerId } = useAuth()
  const categories = ref([])

  /**
   * Load all categories (default + owner's custom)
   */
  const loadCategories = async () => {
    const ownerId = getDataOwnerId()
    if (!ownerId) {
      console.warn('loadCategories: user not authenticated yet')
      return
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${ownerId}`)
      .order('type')
      .order('name')

    if (error) {
      console.error('Error loading categories:', error)
      return
    }

    categories.value = data || []
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
    const ownerId = getDataOwnerId()
    if (!ownerId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        type,
        icon,
        color,
        is_default: false,
        user_id: ownerId
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding category:', error)
      throw error
    }

    await loadCategories()
    return data.id
  }

  /**
   * Update category
   */
  const updateCategory = async (id, name, icon, color) => {
    const { error } = await supabase
      .from('categories')
      .update({ name, icon, color })
      .eq('id', id)
      .eq('is_default', false)

    if (error) {
      console.error('Error updating category:', error)
      throw error
    }

    await loadCategories()
  }

  /**
   * Delete category
   */
  const deleteCategory = async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('is_default', false)

    if (error) {
      console.error('Error deleting category:', error)
      throw error
    }

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
