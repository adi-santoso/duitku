import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

const currentUser = ref(null)
const isAuthenticated = ref(false)
const authLoading = ref(true)

/**
 * Composable for Supabase authentication
 */
export function useAuth() {
  /**
   * Login user with email and password
   */
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    currentUser.value = data.user
    isAuthenticated.value = true
    return true
  }

  /**
   * Register new user
   */
  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      throw error
    }

    // If email confirmation is disabled, user is logged in immediately
    if (data.user) {
      currentUser.value = data.user
      isAuthenticated.value = true
    }

    return data
  }

  /**
   * Logout user
   */
  const logout = async () => {
    await supabase.auth.signOut()
    currentUser.value = null
    isAuthenticated.value = false
  }

  /**
   * Check if user is logged in (restore session)
   */
  const checkAuth = async () => {
    authLoading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        currentUser.value = session.user
        isAuthenticated.value = true
        return true
      }

      currentUser.value = null
      isAuthenticated.value = false
      return false
    } finally {
      authLoading.value = false
    }
  }

  /**
   * Listen for auth state changes
   */
  const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        currentUser.value = session.user
        isAuthenticated.value = true
      } else {
        currentUser.value = null
        isAuthenticated.value = false
      }
      if (callback) callback(event, session)
    })
  }

  /**
   * Get current user ID (UUID from Supabase Auth)
   */
  const getUserId = () => {
    return currentUser.value?.id || null
  }

  /**
   * Get user display name (email or metadata)
   */
  const getUserDisplayName = () => {
    if (!currentUser.value) return ''
    return currentUser.value.user_metadata?.display_name ||
           currentUser.value.email?.split('@')[0] ||
           'User'
  }

  return {
    currentUser,
    isAuthenticated,
    authLoading,
    login,
    register,
    logout,
    checkAuth,
    onAuthStateChange,
    getUserId,
    getUserDisplayName
  }
}
