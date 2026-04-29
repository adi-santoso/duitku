import { ref } from 'vue'
import { queryAll, queryOne, insert, query } from '@/utils/db'
import { useAuth } from './useAuth'

/**
 * Composable for budget management
 */
export function useBudgets() {
  const { getUserId } = useAuth()
  const budgets = ref([])

  /**
   * Load all budgets with category info and spending data
   */
  const loadBudgets = (year, month) => {
    const userId = getUserId()
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = new Date(year, month + 1, 0)
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

    budgets.value = queryAll(`
      SELECT
        b.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        COALESCE(
          (SELECT SUM(t.amount)
           FROM transactions t
           WHERE t.category_id = b.category_id
             AND t.user_id = b.user_id
             AND t.type = 'expense'
             AND t.transaction_date >= ?
             AND t.transaction_date <= ?
          ), 0
        ) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY c.name
    `, [startDate, endDateStr, userId])
  }

  /**
   * Add a new budget
   */
  const addBudget = (categoryId, amount, period = 'monthly') => {
    const userId = getUserId()
    const now = new Date()
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    // Check if budget already exists for this category
    const existing = queryOne(`
      SELECT id FROM budgets
      WHERE user_id = ? AND category_id = ?
    `, [userId, categoryId])

    if (existing) {
      // Update existing
      query(`
        UPDATE budgets SET amount = ?, period = ?, start_date = ?
        WHERE id = ?
      `, [amount, period, startDate, existing.id])
      return existing.id
    }

    return insert(`
      INSERT INTO budgets (user_id, category_id, amount, period, start_date)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, categoryId, amount, period, startDate])
  }

  /**
   * Update budget amount
   */
  const updateBudget = (id, amount) => {
    query(`
      UPDATE budgets SET amount = ?
      WHERE id = ?
    `, [amount, id])
  }

  /**
   * Delete a budget
   */
  const deleteBudget = (id) => {
    query('DELETE FROM budgets WHERE id = ?', [id])
  }

  /**
   * Get budget alerts (over budget or near limit)
   */
  const getBudgetAlerts = (year, month) => {
    const userId = getUserId()
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = new Date(year, month + 1, 0)
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

    const results = queryAll(`
      SELECT
        b.id,
        b.amount as budget_amount,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        COALESCE(
          (SELECT SUM(t.amount)
           FROM transactions t
           WHERE t.category_id = b.category_id
             AND t.user_id = b.user_id
             AND t.type = 'expense'
             AND t.transaction_date >= ?
             AND t.transaction_date <= ?
          ), 0
        ) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
    `, [startDate, endDateStr, userId])

    return results
      .map(b => ({
        ...b,
        percentage: b.budget_amount > 0 ? (b.spent / b.budget_amount) * 100 : 0,
        remaining: b.budget_amount - b.spent,
        status: b.spent >= b.budget_amount ? 'over' : b.spent >= b.budget_amount * 0.8 ? 'warning' : 'ok'
      }))
      .filter(b => b.status !== 'ok')
      .sort((a, b) => b.percentage - a.percentage)
  }

  return {
    budgets,
    loadBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetAlerts
  }
}
