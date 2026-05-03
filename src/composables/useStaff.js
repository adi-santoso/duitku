import { ref } from 'vue'
import { api } from '@/utils/api'
import { useAuth } from './useAuth'

/**
 * Composable for staff management via backend API
 * Only owners can manage staff
 */
export function useStaff() {
  const { isOwner } = useAuth()
  const staffList = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Load all staff for current owner
   */
  const loadStaff = async () => {
    if (!isOwner()) {
      staffList.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await api.staff.list()
      staffList.value = data || []
    } catch (err) {
      console.error('Error loading staff:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new staff account
   */
  const createStaff = async (email, password, name = null) => {
    loading.value = true
    error.value = null

    try {
      const data = await api.staff.create({
        email,
        password,
        displayName: name,
      })

      await loadStaff()
      return data
    } catch (err) {
      console.error('Error creating staff:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove a staff account
   */
  const removeStaff = async (staffUserId) => {
    loading.value = true
    error.value = null

    try {
      await api.staff.remove(staffUserId)
      await loadStaff()
    } catch (err) {
      console.error('Error removing staff:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    staffList,
    loading,
    error,
    loadStaff,
    createStaff,
    removeStaff
  }
}
