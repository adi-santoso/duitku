import { ref } from 'vue'
import { queryOne } from '@/utils/db'

const currentUser = ref(null)
const isAuthenticated = ref(false)

/**
 * Composable for authentication
 */
export function useAuth() {
  /**
   * Login user
   */
  const login = (username, password) => {
    const user = queryOne(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    )

    if (user) {
      currentUser.value = user
      isAuthenticated.value = true
      localStorage.setItem('duitku_user', JSON.stringify(user))
      return true
    }

    return false
  }

  /**
   * Logout user
   */
  const logout = () => {
    currentUser.value = null
    isAuthenticated.value = false
    localStorage.removeItem('duitku_user')
  }

  /**
   * Check if user is logged in
   */
  const checkAuth = () => {
    const savedUser = localStorage.getItem('duitku_user')
    if (savedUser) {
      currentUser.value = JSON.parse(savedUser)
      isAuthenticated.value = true
      return true
    }
    return false
  }

  /**
   * Get current user ID
   */
  const getUserId = () => {
    return currentUser.value?.id || null
  }

  return {
    currentUser,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    getUserId
  }
}
