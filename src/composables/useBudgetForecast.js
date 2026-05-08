import { ref, computed } from 'vue'

/**
 * Composable for budget forecasting
 * Predicts if budgets will be exceeded based on current spending rate
 */
export function useBudgetForecast() {
  const forecasts = ref([])

  /**
   * Calculate forecast for each budget based on current spending rate
   * @param {Array} budgets - budgets with spent amount
   */
  const calculateForecasts = (budgets) => {
    const now = new Date()
    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemaining = daysInMonth - dayOfMonth
    const progressRatio = dayOfMonth / daysInMonth

    forecasts.value = budgets.map(b => {
      const budgetAmount = Number(b.amount)
      const spent = Number(b.spent || 0)

      // Daily spending rate
      const dailyRate = dayOfMonth > 0 ? spent / dayOfMonth : 0

      // Projected total at end of month
      const projectedTotal = spent + (dailyRate * daysRemaining)

      // Projected percentage
      const projectedPercentage = budgetAmount > 0 ? (projectedTotal / budgetAmount) * 100 : 0

      // Status
      let status = 'safe' // Will stay within budget
      let statusLabel = 'Aman'
      let statusColor = '#10B981'

      if (spent >= budgetAmount) {
        status = 'exceeded'
        statusLabel = 'Terlampaui'
        statusColor = '#EF4444'
      } else if (projectedTotal >= budgetAmount) {
        status = 'at_risk'
        statusLabel = 'Berisiko'
        statusColor = '#F59E0B'
      } else if (projectedTotal >= budgetAmount * 0.85) {
        status = 'warning'
        statusLabel = 'Hati-hati'
        statusColor = '#F97316'
      }

      // Recommended daily limit to stay within budget
      const remaining = Math.max(0, budgetAmount - spent)
      const recommendedDaily = daysRemaining > 0 ? remaining / daysRemaining : 0

      // Days until budget exceeded (at current rate)
      const daysUntilExceeded = dailyRate > 0 ? Math.ceil(remaining / dailyRate) : Infinity

      return {
        ...b,
        dailyRate: Math.round(dailyRate),
        projectedTotal: Math.round(projectedTotal),
        projectedPercentage: Math.round(projectedPercentage),
        status,
        statusLabel,
        statusColor,
        recommendedDaily: Math.round(recommendedDaily),
        daysUntilExceeded: daysUntilExceeded === Infinity ? null : daysUntilExceeded,
        daysRemaining,
        progressRatio,
      }
    })
  }

  const atRiskBudgets = computed(() =>
    forecasts.value.filter(f => f.status === 'at_risk' || f.status === 'warning' || f.status === 'exceeded')
  )

  const safeBudgets = computed(() =>
    forecasts.value.filter(f => f.status === 'safe')
  )

  return {
    forecasts,
    atRiskBudgets,
    safeBudgets,
    calculateForecasts,
  }
}
