import { ref } from 'vue'

const PINS_KEY = 'duitku_pinned_transactions'
const TAGS_KEY = 'duitku_transaction_tags'

/**
 * Composable for transaction metadata (pins & tags)
 * Stored in localStorage to avoid backend changes
 */
export function useTransactionMeta() {
  const pinnedIds = ref(loadPins())
  const transactionTags = ref(loadTags())

  // ==================== PINS ====================

  function loadPins() {
    try {
      const data = localStorage.getItem(PINS_KEY)
      return data ? JSON.parse(data) : []
    } catch { return [] }
  }

  function savePins() {
    localStorage.setItem(PINS_KEY, JSON.stringify(pinnedIds.value))
  }

  /**
   * Toggle pin status for a transaction
   */
  const togglePin = (transactionId) => {
    const idx = pinnedIds.value.indexOf(transactionId)
    if (idx !== -1) {
      pinnedIds.value.splice(idx, 1)
    } else {
      pinnedIds.value.push(transactionId)
    }
    savePins()
  }

  /**
   * Check if a transaction is pinned
   */
  const isPinned = (transactionId) => {
    return pinnedIds.value.includes(transactionId)
  }

  /**
   * Get all pinned transaction IDs
   */
  const getPinnedIds = () => pinnedIds.value

  // ==================== TAGS ====================

  function loadTags() {
    try {
      const data = localStorage.getItem(TAGS_KEY)
      return data ? JSON.parse(data) : {}
    } catch { return {} }
  }

  function saveTags() {
    localStorage.setItem(TAGS_KEY, JSON.stringify(transactionTags.value))
  }

  /**
   * Add a tag to a transaction
   */
  const addTag = (transactionId, tag) => {
    const normalizedTag = tag.toLowerCase().trim().replace(/^#/, '')
    if (!normalizedTag) return

    if (!transactionTags.value[transactionId]) {
      transactionTags.value[transactionId] = []
    }

    if (!transactionTags.value[transactionId].includes(normalizedTag)) {
      transactionTags.value[transactionId].push(normalizedTag)
      saveTags()
    }
  }

  /**
   * Remove a tag from a transaction
   */
  const removeTag = (transactionId, tag) => {
    if (!transactionTags.value[transactionId]) return
    transactionTags.value[transactionId] = transactionTags.value[transactionId].filter(t => t !== tag)
    if (transactionTags.value[transactionId].length === 0) {
      delete transactionTags.value[transactionId]
    }
    saveTags()
  }

  /**
   * Get tags for a transaction
   */
  const getTags = (transactionId) => {
    return transactionTags.value[transactionId] || []
  }

  /**
   * Get all unique tags used across all transactions
   */
  const getAllTags = () => {
    const allTags = new Set()
    Object.values(transactionTags.value).forEach(tags => {
      tags.forEach(t => allTags.add(t))
    })
    return [...allTags].sort()
  }

  /**
   * Get transaction IDs that have a specific tag
   */
  const getTransactionsByTag = (tag) => {
    return Object.entries(transactionTags.value)
      .filter(([, tags]) => tags.includes(tag))
      .map(([id]) => parseInt(id))
  }

  return {
    pinnedIds,
    transactionTags,
    togglePin,
    isPinned,
    getPinnedIds,
    addTag,
    removeTag,
    getTags,
    getAllTags,
    getTransactionsByTag,
  }
}
