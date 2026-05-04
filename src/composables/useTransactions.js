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
   * Add new transaction
   */
  const addTransaction = async (data) => {
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

    return result.id
  }

  /**
   * Update transaction
   */
  const updateTransaction = async (id, data) => {
    await api.transactions.update(id, {
      categoryId: data.categoryId,
      amount: data.amount,
      description: data.description || undefined,
      receiptImage: data.receiptImage || undefined,
      transactionDate: data.transactionDate,
      isRecurring: data.isRecurring || false,
      recurringFrequency: data.recurringFrequency || undefined,
    })
  }

  /**
   * Delete transaction
   */
  const deleteTransaction = async (id) => {
    await api.transactions.delete(id)
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
    loadTransactions,
    getTransactionsByMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getSummary,
    getExpenseByCategory,
    bulkImport
  }
}
