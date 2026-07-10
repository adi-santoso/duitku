import api from './api'

/**
 * Get all projects
 * @returns {Promise<Array>}
 */
export async function getProjects() {
  const response = await api.get('/projects')
  return response.data.data
}

/**
 * Get project detail by ID
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function getProjectById(id) {
  const response = await api.get(`/projects/${id}`)
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
  const response = await api.post('/projects', data)
  return response.data.data
}

/**
 * Update project
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateProject(id, data) {
  const response = await api.put(`/projects/${id}`, data)
  return response.data.data
}

/**
 * Delete project
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteProject(id) {
  await api.delete(`/projects/${id}`)
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
  const response = await api.post(`/projects/${projectId}/items`, data)
  return response.data.data
}

/**
 * Update project item
 * @param {number} itemId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateProjectItem(itemId, data) {
  const response = await api.put(`/projects/items/${itemId}`, data)
  return response.data.data
}

/**
 * Delete project item
 * @param {number} itemId
 * @returns {Promise<void>}
 */
export async function deleteProjectItem(itemId) {
  await api.delete(`/projects/items/${itemId}`)
}

/**
 * Mark item as purchased (creates transaction automatically)
 * @param {number} itemId
 * @param {Object} data
 * @param {string} data.transactionDate - Format: YYYY-MM-DD
 * @returns {Promise<Object>}
 */
export async function markItemAsPurchased(itemId, data) {
  const response = await api.post(`/projects/items/${itemId}/purchase`, data)
  return response.data.data
}
