import { ref } from 'vue'
import { api } from '@/utils/api'

export interface BudgetAlert {
  budgetId: number
  categoryId: number
  categoryName: string
  categoryIcon: string
  categoryColor: string
  budgetAmount: number
  spent: number
  remaining: number
  ratio: number
  percentage: string
  tier: string
  tierColor: string
  tierIcon: string
  tierMessage: string
  daysLeft: number
  dailyAllowance: number
}

export interface SpendingVelocity {
  dailyRate: number
  currentSpent: number
  projectedTotal: number
  daysLeft: number
  daysPassed: number
  daysInMonth: number
  transactionCount: number
  historicalAvg: number
  percentageVsHistorical: number
  velocity: 'fast' | 'slow' | 'normal'
  isOverpacing: boolean
}

export interface SavingsRateHistory {
  history: Array<{
    month: string
    label: string
    income: number
    expense: number
    saved: number
    savingsRate: number
  }>
  avgSavingsRate: number
  targetRate: number
}

export interface TrendPeriod {
  period: string
  income: number
  expense: number
  balance: number
  transactionCount: number
}

export interface TrendData {
  periods: TrendPeriod[]
  summary: {
    totalIncome: number
    totalExpense: number
    avgIncome: number
    avgExpense: number
    trend: 'increasing' | 'decreasing' | 'stable'
    trendPercentage: number
  }
}

export interface CategoryInsight {
  categoryId: number
  categoryName: string
  categoryIcon: string
  categoryColor: string
  currentMonth: {
    amount: number
    transactionCount: number
    avgPerTransaction: number
  }
  comparison: {
    prevMonth: {
      amount: number
      change: number
    }
    threeMonthAvg: {
      amount: number
      change: number
    }
  }
  patterns: {
    peakDay: string
    peakDayAvg: number
    peakDayCount: number
    topMerchants: Array<{
      name: string
      count: number
      total: number
    }>
  }
  anomaly: {
    detected: boolean
    severity: string | null
    direction: string | null
    zScore: number
    percentageFromMean: number
  }
  trend: {
    consecutiveIncreases: number
    isUptrending: boolean
  }
  recommendations: Array<{
    priority: string
    action: string
    impact: string
    tips?: string[]
  }>
  history: Array<{
    month: string
    amount: number
    transactionCount: number
  }>
}

export interface CashflowForecast {
  forecast: Array<{
    date: string
    label: string
    predictedIncome: number
    predictedExpense: number
    predictedBalance: number
    confidence: number
    range: {
      min: number
      max: number
    }
  }>
  baseData: {
    avgIncome: number
    avgExpense: number
    avgBalance: number
  }
  alerts: Array<{
    month: string
    shortfall: number
    message: string
  }>
}

export function useAnalytics() {
  const budgetAlerts = ref<BudgetAlert[]>([])
  const spendingVelocity = ref<SpendingVelocity | null>(null)
  const savingsRateHistory = ref<SavingsRateHistory | null>(null)
  const trendData = ref<TrendData | null>(null)
  const categoryInsights = ref<CategoryInsight | null>(null)
  const cashflowForecast = ref<CashflowForecast | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch budget alerts
   */
  async function fetchBudgetAlerts(year?: number, month?: number) {
    loading.value = true
    error.value = null

    try {
      const params: Record<string, string> = {}
      if (year) params.year = year.toString()
      if (month) params.month = month.toString()

      const data = await api.analytics.budgetAlerts(params)
      budgetAlerts.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat budget alerts'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch spending velocity
   */
  async function fetchSpendingVelocity() {
    loading.value = true
    error.value = null

    try {
      const data = await api.analytics.spendingVelocity()
      spendingVelocity.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat spending velocity'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch savings rate history
   */
  async function fetchSavingsRateHistory(months: number = 12) {
    loading.value = true
    error.value = null

    try {
      const data = await api.analytics.savingsRateHistory({ months: months.toString() })
      savingsRateHistory.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat savings rate history'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch income vs expense trend
   */
  async function fetchTrend(
    startDate: string,
    endDate: string,
    granularity: 'day' | 'week' | 'month' | 'year' = 'month'
  ) {
    loading.value = true
    error.value = null

    try {
      const data = await api.analytics.trend({ startDate, endDate, granularity })
      trendData.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat trend data'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch category insights
   */
  async function fetchCategoryInsights(categoryId: number, months: number = 6) {
    loading.value = true
    error.value = null

    try {
      const data = await api.analytics.categoryInsights({
        categoryId: categoryId.toString(),
        months: months.toString(),
      })
      categoryInsights.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat category insights'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch cashflow forecast
   */
  async function fetchCashflowForecast(monthsAhead: number = 3) {
    loading.value = true
    error.value = null

    try {
      const data = await api.analytics.forecast({ monthsAhead: monthsAhead.toString() })
      cashflowForecast.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat forecast'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    budgetAlerts,
    spendingVelocity,
    savingsRateHistory,
    trendData,
    categoryInsights,
    cashflowForecast,
    loading,
    error,

    // Actions
    fetchBudgetAlerts,
    fetchSpendingVelocity,
    fetchSavingsRateHistory,
    fetchTrend,
    fetchCategoryInsights,
    fetchCashflowForecast,
  }
}
