import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

const currentUser = ref(null)
const isAuthenticated = ref(false)
const authLoading = ref(true)
const userProfile = ref(null)

// Promise that resolves when auth initialization is complete
// Other modules (e.g. router) can await this before checking auth state
let _resolveAuthReady
const authReady = new Promise((resolve) => {
  _resolveAuthReady = resolve
})

/**
 * Load user profile (owner_id, display_name)
 */
async function loadProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!error && data) {
      userProfile.value = data
    } else {
      // Profile doesn't exist yet (new user) — use default
      userProfile.value = { id: userId, owner_id: null, display_name: null }
    }
  } catch (e) {
    console.error('loadProfile error:', e)
    userProfile.value = { id: userId, owner_id: null, display_name: null }
  }
}

/**
 * Set auth state from a session object
 */
async function setSessionState(session) {
  if (session?.user) {
    currentUser.value = session.user
    isAuthenticated.value = true
    await loadProfile(session.user.id)
  } else {
    currentUser.value = null
    isAuthenticated.value = false
    userProfile.value = null
  }
}

// ── Bootstrap: get the current session once, then mark auth as ready ──
;(async () => {
  try {
    // Add timeout to prevent infinite loading if Supabase is unreachable
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 100000)
    )
    const sessionPromise = supabase.auth.getSession()

    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])
    await setSessionState(session)
  } catch (e) {
    console.error('Auth init error:', e)
    currentUser.value = null
    isAuthenticated.value = false
    userProfile.value = null
  } finally {
    authLoading.value = false
    _resolveAuthReady()
  }
})()

// ── Listener: handle subsequent changes (login, logout, token refresh) ──
supabase.auth.onAuthStateChange(async (event, session) => {
  // INITIAL_SESSION is already handled by the bootstrap above
  if (event === 'INITIAL_SESSION') return

  try {
    await setSessionState(session)
  } catch (e) {
    console.error('Auth state change error:', e)
  }
})

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
   * Get the "data owner" ID.
   * If user is owner → returns own id
   * If user is staff → returns owner's id
   * All data queries should use this instead of getUserId()
   */
  const getDataOwnerId = () => {
    if (userProfile.value?.owner_id) {
      return userProfile.value.owner_id
    }
    return currentUser.value?.id || null
  }

  /**
   * Check if current user is an owner (not staff)
   */
  const isOwner = () => {
    return !userProfile.value?.owner_id
  }

  /**
   * Check if current user is staff
   */
  const isStaff = () => {
    return !!userProfile.value?.owner_id
  }

  /**
   * Get user display name (email or metadata)
   */
  const getUserDisplayName = () => {
    if (!currentUser.value) return ''
    return userProfile.value?.display_name ||
           currentUser.value.user_metadata?.display_name ||
           currentUser.value.email?.split('@')[0] ||
           'User'
  }

  return {
    currentUser,
    isAuthenticated,
    authLoading,
    authReady,
    userProfile,
    login,
    register,
    logout,
    checkAuth,
    onAuthStateChange,
    getUserId,
    getDataOwnerId,
    isOwner,
    isStaff,
    getUserDisplayName
  }
}
