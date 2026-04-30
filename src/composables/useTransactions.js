import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuth } from './useAuth'

/**
 * Composable for transactions management with Supabase
 * Supports personal and team-shared transactions
 */
export function useTransactions() {
  const { getUserId } = useAuth()
  const transactions = ref([])
  const activeTeamId = ref(null)

  /**
   * Set active team filter for shared transactions
   * Pass null to show only personal transactions
   */
  const setActiveTeam = (teamId) => {
    activeTeamId.value = teamId
  }

  /**
   * Load all transactions with category info
   * If activeTeamId is set, also loads team-shared transactions
   */
  const loadTransactions = async (filters = {}) => {
    const userId = getUserId()

    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          icon,
          color
        )
      `)

    // If team is active, load both personal and team transactions
    if (activeTeamId.value) {
      query = query.or(`user_id.eq.${userId},team_id.eq.${activeTeamId.value}`)
    } else {
      query = query.eq('user_id', userId)
    }

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    if (filters.startDate) {
      query = query.gte('transaction_date', filters.startDate)
    }

    if (filters.endDate) {
      query = query.lte('transaction_date', filters.endDate)
    }

    query = query
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error loading transactions:', error)
      return
    }

    // Flatten category data to match old format
    transactions.value = (data || []).map(t => ({
      ...t,
      category_name: t.categories?.name,
      category_icon: t.categories?.icon,
      category_color: t.categories?.color,
      is_team: !!t.team_id
    }))
  }

  /**
   * Get transactions for specific month
   */
  const getTransactionsByMonth = async (year, month) => {
    const userId = getUserId()
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = new Date(year, month + 1, 0)
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDateStr)
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('Error loading monthly transactions:', error)
      return []
    }

    return (data || []).map(t => ({
      ...t,
      category_name: t.categories?.name,
      category_icon: t.categories?.icon,
      category_color: t.categories?.color
    }))
  }

  /**
   * Add new transaction
   * Optionally assign to a team for shared visibility
   */
  const addTransaction = async (data) => {
    const userId = getUserId()

    const { data: result, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        category_id: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        receipt_image: data.receiptImage || null,
        transaction_date: data.transactionDate,
        is_recurring: data.isRecurring || false,
        recurring_frequency: data.recurringFrequency || null,
        team_id: data.teamId || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding transaction:', error)
      throw error
    }

    await loadTransactions()
    return result.id
  }

  /**
   * Update transaction
   */
  const updateTransaction = async (id, data) => {
    const { error } = await supabase
      .from('transactions')
      .update({
        category_id: data.categoryId,
        amount: data.amount,
        description: data.description || null,
        receipt_image: data.receiptImage || null,
        transaction_date: data.transactionDate,
        is_recurring: data.isRecurring || false,
        recurring_frequency: data.recurringFrequency || null
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating transaction:', error)
      throw error
    }

    await loadTransactions()
  }

  /**
   * Delete transaction
   */
  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }

    await loadTransactions()
  }

  /**
   * Get transaction by ID
   */
  const getTransactionById = async (id) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          icon,
          color
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error getting transaction:', error)
      return null
    }

    return {
      ...data,
      category_name: data.categories?.name,
      category_icon: data.categories?.icon,
      category_color: data.categories?.color
    }
  }

  /**
   * Get summary statistics
   */
  const getSummary = async (startDate, endDate) => {
    const userId = getUserId()

    // Get income total
    const { data: incomeData, error: incomeError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'income')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)

    // Get expense total
    const { data: expenseData, error: expenseError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)

    if (incomeError || expenseError) {
      console.error('Error getting summary:', incomeError || expenseError)
      return { income: 0, expense: 0, balance: 0 }
    }

    const income = (incomeData || []).reduce((sum, t) => sum + Number(t.amount), 0)
    const expense = (expenseData || []).reduce((sum, t) => sum + Number(t.amount), 0)

    return {
      income,
      expense,
      balance: income - expense
    }
  }

  /**
   * Get expense by category
   */
  const getExpenseByCategory = async (startDate, endDate) => {
    const userId = getUserId()

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        category_id,
        categories (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)

    if (error) {
      console.error('Error getting expense by category:', error)
      return []
    }

    // Group by category
    const categoryMap = {}
    ;(data || []).forEach(t => {
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
    const userId = getUserId()
    let imported = 0

    // Process in batches of 50
    const batchSize = 50
    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize).map(item => ({
        user_id: userId,
        category_id: item.category_id,
        type: item.type,
        amount: item.amount,
        description: item.description || null,
        receipt_image: null,
        transaction_date: item.date,
        is_recurring: false,
        recurring_frequency: null
      }))

      const { data, error } = await supabase
        .from('transactions')
        .insert(batch)
        .select()

      if (error) {
        console.warn('Batch import error:', error)
      } else {
        imported += (data || []).length
      }
    }

    await loadTransactions()
    return imported
  }

  return {
    transactions,
    totalIncome,
    totalExpense,
    balance,
    activeTeamId,
    setActiveTeam,
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
