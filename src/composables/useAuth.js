import { ref } from 'vue'
import { api, setToken, removeToken, getStoredUser, setStoredUser, removeStoredUser } from '@/utils/api'

const currentUser = ref(null)
const isAuthenticated = ref(false)
const authLoading = ref(true)
const userProfile = ref(null)

// Restore session from localStorage on module load
const storedUser = getStoredUser()
if (storedUser) {
  currentUser.value = storedUser
  isAuthenticated.value = true
  userProfile.value = storedUser
}
authLoading.value = false

/**
 * Composable for authentication via backend API
 */
export function useAuth() {
  /**
   * Login user with email and password
   */
  const login = async (email, password) => {
    const result = await api.auth.login({ email, password })

    setToken(result.token)
    setStoredUser(result.user)
    currentUser.value = result.user
    userProfile.value = result.user
    isAuthenticated.value = true

    return true
  }

  /**
   * Register new owner account
   */
  const register = async (email, password, displayName) => {
    const result = await api.auth.register({ email, password, displayName })

    setToken(result.token)
    setStoredUser(result.user)
    currentUser.value = result.user
    userProfile.value = result.user
    isAuthenticated.value = true

    return result
  }

  /**
   * Logout user
   */
  const logout = async () => {
    removeToken()
    removeStoredUser()
    currentUser.value = null
    isAuthenticated.value = false
    userProfile.value = null
  }

  /**
   * Check if user is logged in (verify token)
   */
  const checkAuth = async () => {
    authLoading.value = true
    try {
      const stored = getStoredUser()
      if (!stored) {
        currentUser.value = null
        isAuthenticated.value = false
        return false
      }

      // Verify token is still valid
      const user = await api.auth.me()
      currentUser.value = stored
      userProfile.value = stored
      isAuthenticated.value = true
      return true
    } catch {
      // Token expired or invalid
      removeToken()
      removeStoredUser()
      currentUser.value = null
      isAuthenticated.value = false
      return false
    } finally {
      authLoading.value = false
    }
  }

  /**
   * Get current user ID
   */
  const getUserId = () => {
    return currentUser.value?.id || null
  }

  /**
   * Get the "data owner" ID.
   * If user is owner → returns own id
   * If user is staff → returns owner's id
   */
  const getDataOwnerId = () => {
    return currentUser.value?.ownerId || currentUser.value?.id || null
  }

  /**
   * Check if current user is an owner (not staff)
   */
  const isOwner = () => {
    return currentUser.value?.role === 'owner'
  }

  /**
   * Check if current user is staff
   */
  const isStaff = () => {
    return currentUser.value?.role === 'staff'
  }

  /**
   * Get user display name
   */
  const getUserDisplayName = () => {
    if (!currentUser.value) return ''
    return currentUser.value.displayName ||
           currentUser.value.email?.split('@')[0] ||
           'User'
  }

  return {
    currentUser,
    isAuthenticated,
    authLoading,
    userProfile,
    login,
    register,
    logout,
    checkAuth,
    getUserId,
    getDataOwnerId,
    isOwner,
    isStaff,
    getUserDisplayName
  }
}
