import { api as apiClient } from './api'

/**
 * Helper function to make API requests with proper response handling
 */
async function request(method, endpoint, data = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  const token = localStorage.getItem('duitku_token')
  if (token) {
    options.headers.Authorization = `Bearer ${token}`
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  const response = await fetch(`${apiBase}${endpoint}`, options)

  const result = await response.json()

  if (!response.ok || !result.success) {
    const error = new Error(result.error || 'Request failed')
    error.response = { data: result }
    throw error
  }

  return { data: result }
}

/**
 * Get all projects
 * @returns {Promise<Array>}
 */
export async function getProjects() {
  const response = await request('GET', '/projects')
  return response.data.data
}

/**
 * Get project detail by ID
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function getProjectById(id) {
  const response = await request('GET', `/projects/${id}`)
  return response.data.data
}

/**
 * Create new project
 * @param {Object} data
 * @param {string} data.name
 * @param {string} [data.description]
 * @param {number} data.totalBudget
 * @returns {Promise<Object>}
 */
export async function createProject(data) {
  const response = await request('POST', '/projects', data)
  return response.data.data
}

/**
 * Update project
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateProject(id, data) {
  const response = await request('PUT', `/projects/${id}`, data)
  return response.data.data
}

/**
 * Delete project
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteProject(id) {
  await request('DELETE', `/projects/${id}`)
}

/**
 * Add item to project
 * @param {number} projectId
 * @param {Object} data
 * @param {number} data.categoryId
 * @param {string} data.name
 * @param {number} data.estimatedPrice
 * @param {string} [data.notes]
 * @returns {Promise<Object>}
 */
export async function addProjectItem(projectId, data) {
  const response = await request('POST', `/projects/${projectId}/items`, data)
  return response.data.data
}

/**
 * Update project item
 * @param {number} itemId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateProjectItem(itemId, data) {
  const response = await request('PUT', `/projects/items/${itemId}`, data)
  return response.data.data
}

/**
 * Delete project item
 * @param {number} itemId
 * @returns {Promise<void>}
 */
export async function deleteProjectItem(itemId) {
  await request('DELETE', `/projects/items/${itemId}`)
}

/**
 * Mark item as purchased (creates transaction automatically)
 * @param {number} itemId
 * @param {Object} data
 * @param {string} data.transactionDate - Format: YYYY-MM-DD
 * @returns {Promise<Object>}
 */
export async function markItemAsPurchased(itemId, data) {
  const response = await request('POST', `/projects/items/${itemId}/purchase`, data)
  return response.data.data
}

