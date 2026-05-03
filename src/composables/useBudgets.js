import { ref } from 'vue'
import { api } from '@/utils/api'

/**
 * Composable for budget management via backend API
 * Staff and owner share the same budgets (backend handles via ownerId in JWT)
 */
export function useBudgets() {
  const budgets = ref([])

  /**
   * Load all budgets with category info and spending data
   */
  const loadBudgets = async (year, month) => {
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endDate = new Date(year, month + 1, 0)
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

      // Get budgets
      const budgetData = await api.budgets.list()

      // Get spending for this month (expense transactions)
      const spendingResult = await api.transactions.list({
        startDate,
        endDate: endDateStr,
        type: 'expense',
        limit: '1000',
      })

      // Calculate spending per category
      const spendingMap = {}
      ;(spendingResult.transactions || []).forEach(t => {
        if (!spendingMap[t.category_id]) {
          spendingMap[t.category_id] = 0
        }
        spendingMap[t.category_id] += Number(t.amount)
      })

      // Merge budgets with spending
      budgets.value = (budgetData || []).map(b => ({
        ...b,
        category_name: b.categories?.name,
        category_icon: b.categories?.icon,
        category_color: b.categories?.color,
        spent: spendingMap[b.category_id] || 0
      }))
    } catch (err) {
      console.error('Error loading budgets:', err)
    }
  }

  /**
   * Add a new budget
   */
  const addBudget = async (categoryId, amount, period = 'monthly') => {
    const now = new Date()
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const data = await api.budgets.create({
      categoryId,
      amount,
      period,
      startDate,
    })

    return data.id
  }

  /**
   * Update budget amount
   */
  const updateBudget = async (id, amount) => {
    await api.budgets.update(id, { amount })
  }

  /**
   * Delete a budget
   */
  const deleteBudget = async (id) => {
    await api.budgets.delete(id)
  }

  /**
   * Get budget alerts (over budget or near limit)
   */
  const getBudgetAlerts = async (year, month) => {
    // Make sure budgets are loaded first
    if (budgets.value.length === 0) {
      await loadBudgets(year, month)
    }

    return budgets.value
      .map(b => ({
        ...b,
        budget_amount: Number(b.amount),
        percentage: Number(b.amount) > 0 ? (b.spent / Number(b.amount)) * 100 : 0,
        remaining: Number(b.amount) - b.spent,
        status: b.spent >= Number(b.amount) ? 'over' : b.spent >= Number(b.amount) * 0.8 ? 'warning' : 'ok'
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
