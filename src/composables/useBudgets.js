import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuth } from './useAuth'

/**
 * Composable for budget management with Supabase
 */
export function useBudgets() {
  const { getUserId } = useAuth()
  const budgets = ref([])

  /**
   * Load all budgets with category info and spending data
   */
  const loadBudgets = async (year, month) => {
    const userId = getUserId()
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = new Date(year, month + 1, 0)
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

    // Get budgets with category info
    const { data: budgetData, error: budgetError } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('created_at')

    if (budgetError) {
      console.error('Error loading budgets:', budgetError)
      return
    }

    // Get spending per category for this month
    const { data: spendingData, error: spendingError } = await supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDateStr)

    if (spendingError) {
      console.error('Error loading spending:', spendingError)
    }

    // Calculate spending per category
    const spendingMap = {}
    ;(spendingData || []).forEach(t => {
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
  }

  /**
   * Add a new budget
   */
  const addBudget = async (categoryId, amount, period = 'monthly') => {
    const userId = getUserId()
    const now = new Date()
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    // Upsert: insert or update if exists
    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        {
          user_id: userId,
          category_id: categoryId,
          amount,
          period,
          start_date: startDate
        },
        {
          onConflict: 'user_id,category_id'
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error adding budget:', error)
      throw error
    }

    return data.id
  }

  /**
   * Update budget amount
   */
  const updateBudget = async (id, amount) => {
    const { error } = await supabase
      .from('budgets')
      .update({ amount })
      .eq('id', id)

    if (error) {
      console.error('Error updating budget:', error)
      throw error
    }
  }

  /**
   * Delete a budget
   */
  const deleteBudget = async (id) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting budget:', error)
      throw error
    }
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
