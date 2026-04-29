import { ref, computed } from 'vue'
import { queryAll, queryOne, insert, query } from '@/utils/db'
import { useAuth } from './useAuth'
import { formatDateInput } from '@/utils/dateHelpers'

/**
 * Composable for transactions management
 */
export function useTransactions() {
  const { getUserId } = useAuth()
  const transactions = ref([])

  /**
   * Load all transactions
   */
  const loadTransactions = (filters = {}) => {
    const userId = getUserId()
    let sql = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `
    const params = [userId]

    if (filters.type) {
      sql += ' AND t.type = ?'
      params.push(filters.type)
    }

    if (filters.categoryId) {
      sql += ' AND t.category_id = ?'
      params.push(filters.categoryId)
    }

    if (filters.startDate) {
      sql += ' AND t.transaction_date >= ?'
      params.push(filters.startDate)
    }

    if (filters.endDate) {
      sql += ' AND t.transaction_date <= ?'
      params.push(filters.endDate)
    }

    sql += ' ORDER BY t.transaction_date DESC, t.created_at DESC'

    transactions.value = queryAll(sql, params)
  }

  /**
   * Get transactions for specific month
   */
  const getTransactionsByMonth = (year, month) => {
    const userId = getUserId()
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = new Date(year, month + 1, 0)
    const endDateStr = formatDateInput(endDate)

    return queryAll(`
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
        AND t.transaction_date >= ?
        AND t.transaction_date <= ?
      ORDER BY t.transaction_date DESC
    `, [userId, startDate, endDateStr])
  }

  /**
   * Add new transaction
   */
  const addTransaction = (data) => {
    const userId = getUserId()
    const id = insert(`
      INSERT INTO transactions (
        user_id, category_id, type, amount, description,
        receipt_image, transaction_date, is_recurring, recurring_frequency
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      data.categoryId,
      data.type,
      data.amount,
      data.description || null,
      data.receiptImage || null,
      data.transactionDate,
      data.isRecurring ? 1 : 0,
      data.recurringFrequency || null
    ])

    loadTransactions()
    return id
  }

  /**
   * Update transaction
   */
  const updateTransaction = (id, data) => {
    query(`
      UPDATE transactions
      SET category_id = ?,
          amount = ?,
          description = ?,
          receipt_image = ?,
          transaction_date = ?,
          is_recurring = ?,
          recurring_frequency = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      data.categoryId,
      data.amount,
      data.description || null,
      data.receiptImage || null,
      data.transactionDate,
      data.isRecurring ? 1 : 0,
      data.recurringFrequency || null,
      id
    ])

    loadTransactions()
  }

  /**
   * Delete transaction
   */
  const deleteTransaction = (id) => {
    query('DELETE FROM transactions WHERE id = ?', [id])
    loadTransactions()
  }

  /**
   * Get transaction by ID
   */
  const getTransactionById = (id) => {
    return queryOne(`
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [id])
  }

  /**
   * Get summary statistics
   */
  const getSummary = (startDate, endDate) => {
    const userId = getUserId()

    const income = queryOne(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ?
        AND type = 'income'
        AND transaction_date >= ?
        AND transaction_date <= ?
    `, [userId, startDate, endDate])

    const expense = queryOne(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ?
        AND type = 'expense'
        AND transaction_date >= ?
        AND transaction_date <= ?
    `, [userId, startDate, endDate])

    return {
      income: income.total,
      expense: expense.total,
      balance: income.total - expense.total
    }
  }

  /**
   * Get expense by category
   */
  const getExpenseByCategory = (startDate, endDate) => {
    const userId = getUserId()

    return queryAll(`
      SELECT
        c.id,
        c.name,
        c.icon,
        c.color,
        COALESCE(SUM(t.amount), 0) as total,
        COUNT(t.id) as count
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id
        AND t.user_id = ?
        AND t.type = 'expense'
        AND t.transaction_date >= ?
        AND t.transaction_date <= ?
      WHERE c.type = 'expense'
      GROUP BY c.id
      HAVING total > 0
      ORDER BY total DESC
    `, [userId, startDate, endDate])
  }

  /**
   * Total income
   */
  const totalIncome = computed(() => {
    return transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  })

  /**
   * Total expense
   */
  const totalExpense = computed(() => {
    return transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
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
  const bulkImport = (dataArray) => {
    const userId = getUserId()
    let imported = 0

    dataArray.forEach(item => {
      try {
        insert(`
          INSERT INTO transactions (
            user_id, category_id, type, amount, description,
            receipt_image, transaction_date, is_recurring, recurring_frequency
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL)
        `, [
          userId,
          item.category_id,
          item.type,
          item.amount,
          item.description || null,
          null,
          item.date
        ])
        imported++
      } catch (e) {
        console.warn('Failed to import:', item, e)
      }
    })

    loadTransactions()
    return imported
  }

  return {
    transactions,
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
