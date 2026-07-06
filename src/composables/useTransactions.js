import { ref, computed } from 'vue'
import { api } from '@/utils/api'
import { useAuth } from './useAuth'

/**
 * Composable for transactions management via backend API
 * Staff and owner share the same data (backend handles via ownerId in JWT)
 */
export function useTransactions() {
  const { getDataOwnerId } = useAuth()
  const transactions = ref([])
  const totalTransactions = ref(0)
  const isLoading = ref(false)
  const isSaving = ref(false)

  /**
   * Normalize transaction data (flatten category info)
   */
  const normalizeTransaction = (t) => ({
    ...t,
    category_name: t.categories?.name,
    category_icon: t.categories?.icon,
    category_color: t.categories?.color
  })

  /**
   * Load transactions with pagination and filters (server-side)
   * @param {Object} filters - { type, categoryId, startDate, endDate, search, limit, offset }
   * @returns {{ transactions: Array, total: number }}
   */
  const loadTransactions = async (filters = {}) => {
    try {
      isLoading.value = true
      const params = {}
      if (filters.type) params.type = filters.type
      if (filters.categoryId) params.categoryId = String(filters.categoryId)
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.search) params.search = filters.search
      if (filters.limit) params.limit = String(filters.limit)
      if (filters.offset != null) params.offset = String(filters.offset)

      const result = await api.transactions.list(params)

      // Flatten category data to match old format
      transactions.value = (result.transactions || []).map(normalizeTransaction)

      // Use total from backend if available, otherwise fallback
      if (result.total != null) {
        totalTransactions.value = result.total
      } else {
        // Fallback: if returned count equals limit, there might be more
        const limit = parseInt(params.limit) || 50
        totalTransactions.value = transactions.value.length < limit
          ? (parseInt(params.offset || '0') + transactions.value.length)
          : (parseInt(params.offset || '0') + transactions.value.length + 1)
      }

      return {
        transactions: transactions.value,
        total: totalTransactions.value
      }
    } catch (err) {
      console.error('Error loading transactions:', err)
      return { transactions: [], total: 0 }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get transactions for specific month (all, no pagination)
   */
  const getTransactionsByMonth = async (year, month) => {
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endDate = new Date(year, month + 1, 0)
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

      const result = await api.transactions.list({ startDate, endDate: endDateStr, limit: '10000' })

      return (result.transactions || []).map(normalizeTransaction)
    } catch (err) {
      console.error('Error loading monthly transactions:', err)
      return []
    }
  }

  /**
   * Add new transaction with optimistic update
   */
  const addTransaction = async (data) => {
    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`

    // Create optimistic transaction
    const optimisticTransaction = normalizeTransaction({
      id: tempId,
      ...data,
      created_at: new Date().toISOString(),
      categories: {
        name: data.category_name || 'Loading...',
        icon: data.category_icon || '📝',
        color: data.category_color || '#6B7280'
      },
      _optimistic: true
    })

    // Add to local state immediately
    transactions.value.unshift(optimisticTransaction)
    totalTransactions.value++

    try {
      isSaving.value = true
      const result = await api.transactions.create({
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description || undefined,
        receiptImage: data.receiptImage || undefined,
        transactionDate: data.transactionDate,
        isRecurring: data.isRecurring || false,
        recurringFrequency: data.recurringFrequency || undefined,
      })

      // Replace optimistic with real data
      const index = transactions.value.findIndex(t => t.id === tempId)
      if (index > -1) {
        transactions.value[index] = normalizeTransaction({
          ...result,
          id: result.id,
          categories: {
            name: data.category_name,
            icon: data.category_icon,
            color: data.category_color
          }
        })
      }

      return result.id
    } catch (err) {
      // Rollback optimistic update on error
      const index = transactions.value.findIndex(t => t.id === tempId)
      if (index > -1) {
        transactions.value.splice(index, 1)
        totalTransactions.value--
      }
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Update transaction with optimistic update
   */
  const updateTransaction = async (id, data) => {
    // Store original transaction for rollback
    const index = transactions.value.findIndex(t => t.id === id)
    if (index === -1) return

    const originalTransaction = { ...transactions.value[index] }

    // Optimistic update with merged data
    transactions.value[index] = normalizeTransaction({
      ...originalTransaction,
      ...data,
      category_id: data.categoryId,
      category_name: data.category_name || originalTransaction.category_name,
      category_icon: data.category_icon || originalTransaction.category_icon,
      category_color: data.category_color || originalTransaction.category_color,
      transaction_date: data.transactionDate,
      receipt_image: data.receiptImage,
      is_recurring: data.isRecurring,
      recurring_frequency: data.recurringFrequency,
      _optimistic: true
    })

    try {
      isSaving.value = true
      await api.transactions.update(id, {
        categoryId: data.categoryId,
        amount: data.amount,
        description: data.description || undefined,
        receiptImage: data.receiptImage || undefined,
        transactionDate: data.transactionDate,
        isRecurring: data.isRecurring || false,
        recurringFrequency: data.recurringFrequency || undefined,
      })

      // Remove optimistic flag
      if (transactions.value[index]) {
        delete transactions.value[index]._optimistic
      }
    } catch (err) {
      // Rollback on error
      transactions.value[index] = originalTransaction
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Delete transaction with optimistic update
   */
  const deleteTransaction = async (id) => {
    // Store for rollback
    const index = transactions.value.findIndex(t => t.id === id)
    if (index === -1) return

    const deletedTransaction = transactions.value[index]

    // Optimistic delete
    transactions.value.splice(index, 1)
    totalTransactions.value--

    try {
      await api.transactions.delete(id)
      return deletedTransaction // Return for undo functionality
    } catch (err) {
      // Rollback on error
      transactions.value.splice(index, 0, deletedTransaction)
      totalTransactions.value++
      throw err
    }
  }

  /**
   * Restore deleted transaction (for undo)
   */
  const restoreTransaction = async (transaction) => {
    try {
      // Re-create the transaction
      const result = await api.transactions.create({
        categoryId: transaction.category_id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        receiptImage: transaction.receipt_image,
        transactionDate: transaction.transaction_date,
        isRecurring: transaction.is_recurring,
        recurringFrequency: transaction.recurring_frequency,
      })

      // Add back to list
      const restored = normalizeTransaction({
        ...result,
        categories: {
          name: transaction.category_name,
          icon: transaction.category_icon,
          color: transaction.category_color
        }
      })

      transactions.value.unshift(restored)
      totalTransactions.value++

      return restored
    } catch (err) {
      throw err
    }
  }

  /**
   * Get transaction by ID
   */
  const getTransactionById = async (id) => {
    // Find from loaded transactions
    const found = transactions.value.find(t => t.id === id)
    return found || null
  }

  /**
   * Get summary statistics
   */
  const getSummary = async (startDate, endDate) => {
    try {
      const result = await api.transactions.summary({ startDate, endDate })
      return {
        income: result.totalIncome || 0,
        expense: result.totalExpense || 0,
        balance: result.balance || 0
      }
    } catch (err) {
      console.error('Error getting summary:', err)
      return { income: 0, expense: 0, balance: 0 }
    }
  }

  /**
   * Get expense by category
   */
  const getExpenseByCategory = async (startDate, endDate) => {
    try {
      const result = await api.transactions.list({
        startDate,
        endDate,
        type: 'expense',
        limit: '1000',
      })

      // Group by category
      const categoryMap = {}
      ;(result.transactions || []).forEach(t => {
        const catId = t.category_id
        if (!categoryMap[catId]) {
          categoryMap[catId] = {
            id: t.categories?.id || catId,
            name: t.categories?.name || 'Unknown',
            icon: t.categories?.icon || '',
            color: t.categories?.color || '#B2BEC3',
            total: 0,
            count: 0
          }
        }
        categoryMap[catId].total += Number(t.amount)
        categoryMap[catId].count++
      })

      return Object.values(categoryMap).sort((a, b) => b.total - a.total)
    } catch (err) {
      console.error('Error getting expense by category:', err)
      return []
    }
  }

  /**
   * Total income
   */
  const totalIncome = computed(() => {
    return transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  })

  /**
   * Total expense
   */
  const totalExpense = computed(() => {
    return transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  })

  /**
   * Balance
   */
  const balance = computed(() => {
    return totalIncome.value - totalExpense.value
  })

  /**
   * Bulk import transactions from array
   */
  const bulkImport = async (dataArray) => {
    let imported = 0

    // Process in batches of 20 (to avoid overwhelming the API)
    const batchSize = 20
    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize)

      const results = await Promise.allSettled(
        batch.map(item =>
          api.transactions.create({
            categoryId: item.category_id,
            type: item.type,
            amount: item.amount,
            description: item.description || undefined,
            transactionDate: item.date,
            isRecurring: false,
          })
        )
      )

      imported += results.filter(r => r.status === 'fulfilled').length
    }

    return imported
  }

  return {
    transactions,
    totalTransactions,
    totalIncome,
    totalExpense,
    balance,
    isLoading,
    isSaving,
    loadTransactions,
    getTransactionsByMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    restoreTransaction,
    getTransactionById,
    getSummary,
    getExpenseByCategory,
    bulkImport
  }
}
