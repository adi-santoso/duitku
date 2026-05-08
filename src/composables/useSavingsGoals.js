import { ref, computed } from 'vue'
import { api } from '@/utils/api'

/**
 * Composable for savings goals management
 */
export function useSavingsGoals() {
  const goals = ref([])
  const loading = ref(false)
  const contributions = ref([])

  /**
   * Load all savings goals
   */
  const loadGoals = async () => {
    loading.value = true
    try {
      const data = await api.savingsGoals.list()
      goals.value = (data || []).map(g => ({
        ...g,
        target_amount: Number(g.target_amount),
        current_amount: Number(g.current_amount),
        percentage: Number(g.target_amount) > 0
          ? Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100)
          : 0,
        remaining: Math.max(0, Number(g.target_amount) - Number(g.current_amount)),
      }))
    } catch (err) {
      console.error('Error loading savings goals:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new savings goal
   */
  const createGoal = async ({ name, targetAmount, targetDate, icon, color }) => {
    const data = await api.savingsGoals.create({
      name,
      targetAmount,
      targetDate: targetDate || undefined,
      icon: icon || '🎯',
      color: color || '#10B981',
    })
    await loadGoals()
    return data
  }

  /**
   * Update a savings goal
   */
  const updateGoal = async (id, updates) => {
    const data = await api.savingsGoals.update(id, updates)
    await loadGoals()
    return data
  }

  /**
   * Delete a savings goal
   */
  const deleteGoal = async (id) => {
    await api.savingsGoals.delete(id)
    await loadGoals()
  }

  /**
   * Add contribution (deposit) to a goal
   */
  const addContribution = async (goalId, amount, note) => {
    const data = await api.savingsGoals.addContribution(goalId, {
      amount,
      note: note || undefined,
    })
    await loadGoals()
    return data
  }

  /**
   * Load contribution history for a goal
   */
  const loadContributions = async (goalId) => {
    try {
      const data = await api.savingsGoals.getContributions(goalId)
      contributions.value = (data || []).map(c => ({
        ...c,
        amount: Number(c.amount),
      }))
    } catch (err) {
      console.error('Error loading contributions:', err)
      throw err
    }
  }

  /**
   * Computed: active (not completed) goals
   */
  const activeGoals = computed(() => goals.value.filter(g => !g.is_completed))

  /**
   * Computed: completed goals
   */
  const completedGoals = computed(() => goals.value.filter(g => g.is_completed))

  /**
   * Computed: total saved across all active goals
   */
  const totalSaved = computed(() =>
    activeGoals.value.reduce((sum, g) => sum + g.current_amount, 0)
  )

  /**
   * Computed: total target across all active goals
   */
  const totalTarget = computed(() =>
    activeGoals.value.reduce((sum, g) => sum + g.target_amount, 0)
  )

  return {
    goals,
    loading,
    contributions,
    activeGoals,
    completedGoals,
    totalSaved,
    totalTarget,
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    loadContributions,
  }
}
