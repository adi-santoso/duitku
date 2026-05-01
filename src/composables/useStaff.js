import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuth } from './useAuth'

/**
 * Composable for staff management
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
      const { data, error: err } = await supabase
        .rpc('get_my_staff')

      if (err) throw err
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
      const { data, error: err } = await supabase
        .rpc('create_staff_account', {
          staff_email: email,
          staff_password: password,
          staff_name: name
        })

      if (err) throw err

      if (!data.success) {
        throw new Error(data.error)
      }

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
      const { data, error: err } = await supabase
        .rpc('remove_staff_account', {
          staff_user_id: staffUserId
        })

      if (err) throw err

      if (!data.success) {
        throw new Error(data.error)
      }

      await loadStaff()
      return data
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
