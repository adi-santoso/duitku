/**
 * API Client for DuitKu Backend
 * Replaces direct Supabase calls with backend API requests
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Get stored auth token
 */
function getToken() {
  return localStorage.getItem('duitku_token')
}

/**
 * Set auth token
 */
export function setToken(token) {
  localStorage.setItem('duitku_token', token)
}

/**
 * Remove auth token
 */
export function removeToken() {
  localStorage.removeItem('duitku_token')
}

/**
 * Get stored user data
 */
export function getStoredUser() {
  const data = localStorage.getItem('duitku_user')
  return data ? JSON.parse(data) : null
}

/**
 * Set user data
 */
export function setStoredUser(user) {
  localStorage.setItem('duitku_user', JSON.stringify(user))
}

/**
 * Remove user data
 */
export function removeStoredUser() {
  localStorage.removeItem('duitku_user')
}

/**
 * Callback for handling auth expiry (set by router)
 */
let onAuthExpired = null

export function setAuthExpiredHandler(handler) {
  onAuthExpired = handler
}

/**
 * Make API request with auth header
 */
async function request(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    // Auto-logout on 401 (token expired/invalid)
    if (response.status === 401 && !endpoint.startsWith('/auth/')) {
      removeToken()
      localStorage.removeItem('duitku_user')
      if (onAuthExpired) onAuthExpired()
    }

    const error = new Error(data.error || 'Request failed')
    error.status = response.status
    throw error
  }

  return data.data
}

/**
 * API methods
 */
export const api = {
  // Auth
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
  },

  // Staff
  staff: {
    list: () => request('/staff'),
    create: (body) => request('/staff', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id) => request(`/staff/${id}`, { method: 'DELETE' }),
  },

  // Transactions
  transactions: {
    list: (params = {}) => {
      const query = new URLSearchParams()
      if (params.startDate) query.set('startDate', params.startDate)
      if (params.endDate) query.set('endDate', params.endDate)
      if (params.type) query.set('type', params.type)
      if (params.categoryId) query.set('categoryId', params.categoryId)
      if (params.limit) query.set('limit', params.limit)
      if (params.offset) query.set('offset', params.offset)
      const qs = query.toString()
      return request(`/transactions${qs ? '?' + qs : ''}`)
    },
    summary: (params = {}) => {
      const query = new URLSearchParams()
      if (params.startDate) query.set('startDate', params.startDate)
      if (params.endDate) query.set('endDate', params.endDate)
      const qs = query.toString()
      return request(`/transactions/summary${qs ? '?' + qs : ''}`)
    },
    create: (body) => request('/transactions', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
  },

  // Categories
  categories: {
    list: () => request('/categories'),
    create: (body) => request('/categories', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  },

  // Budgets
  budgets: {
    list: () => request('/budgets'),
    create: (body) => request('/budgets', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),
  },
}
