import { ref, computed } from 'vue'
import * as projectsApi from '@/utils/projectsApi'

// Shared state
const projects = ref([])
const currentProject = ref(null)
const loading = ref(false)
const error = ref(null)

export function useProjects() {
  // Computed
  const activeProjects = computed(() => projects.value.filter(p => !p.isCompleted))
  const completedProjects = computed(() => projects.value.filter(p => p.isCompleted))

  /**
   * Fetch all projects
   */
  const fetchProjects = async () => {
    loading.value = true
    error.value = null
    try {
      projects.value = await projectsApi.getProjects()
    } catch (err) {
      error.value = err.response?.data?.error || 'Gagal mengambil data project'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch project detail by ID
   * @param {number} id
   */
  const fetchProjectById = async (id) => {
    loading.value = true
    error.value = null
    try {
      currentProject.value = await projectsApi.getProjectById(id)
    } catch (err) {
      error.value = err.response?.data?.error || 'Gagal mengambil detail project'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create new project
   * @param {Object} data
   */
  const createProject = async (data) => {
    loading.value = true
    error.value = null
    try {
      const newProject = await projectsApi.createProject(data)
      projects.value.unshift(newProject)
      return newProject
    } catch (err) {
      error.value = err.response?.data?.error || 'Gagal membuat project'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update project
   * @param {number} id
   * @param {Object} data
   */
  const updateProject = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const updated = await projectsApi.updateProject(id, data)
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...updated }
      }
      if (currentProject.value?.id === id) {
        currentProject.value = { ...currentProject.value, ...updated }
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.error || 'Gagal mengupdate project'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete project
   * @param {number} id
   */
  const deleteProject = async (id) => {
    loading.value = true
    error.value = null
    try {
      await projectsApi.deleteProject(id)
      projects.value = projects.value.filter(p => p.id !== id)
      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Gagal menghapus project'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Add item to project
   * @param {number} projectId
   * @param {Object} data
   */
  const addProjectItem = async (projectId, data) => {
    loading.value = true
    error.value = null
    try {
      const item = await projectsApi.addProjectItem(projectId, data)
      if (currentProject.value?.id === projectId) {
        currentProject.value.items.push(item)
      }
      return item
    } catch (err) {
      error.value = err.response?.data?.error || 'Gagal menambahkan item'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update project item
   * @param {number} itemId
   * @param {Object} data
   */
  const updateProjectItem = async (itemId, data) => {
    loading.value = true
    error.value = null
    try {
      const updated = await projectsApi.updateProjectItem(itemId, data)
      if (currentProject.value) {
        const index = currentProject.value.items.findIndex(i => i.id === itemId)
        if (index !== -1) {
          currentProject.value.items[index] = { ...currentProject.value.items[index], ...updated }
        }
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.error || 'Gagal mengupdate item'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete project item
   * @param {number} itemId
   */
  const deleteProjectItem = async (itemId) => {
    loading.value = true
    error.value = null
    try {
      await projectsApi.deleteProjectItem(itemId)
      if (currentProject.value) {
        currentProject.value.items = currentProject.value.items.filter(i => i.id !== itemId)
        // Refresh to update counts
        await fetchProjectById(currentProject.value.id)
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Gagal menghapus item'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Mark item as purchased
   * @param {number} itemId
   * @param {string} transactionDate - Format: YYYY-MM-DD
   */
  const markItemAsPurchased = async (itemId, transactionDate) => {
    loading.value = true
    error.value = null
    try {
      const result = await projectsApi.markItemAsPurchased(itemId, { transactionDate })
      if (currentProject.value) {
        const index = currentProject.value.items.findIndex(i => i.id === itemId)
        if (index !== -1) {
          currentProject.value.items[index] = result.item
        }
        // Refresh to update total spent
        await fetchProjectById(currentProject.value.id)
      }
      return result
    } catch (err) {
      error.value = err.response?.data?.error || 'Gagal menandai item sebagai dibeli'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    projects,
    currentProject,
    loading,
    error,

    // Computed
    activeProjects,
    completedProjects,

    // Actions
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    addProjectItem,
    updateProjectItem,
    deleteProjectItem,
    markItemAsPurchased
  }
}
