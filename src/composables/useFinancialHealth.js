import { ref, computed } from 'vue'
import { api } from '@/utils/api'

/**
 * Composable for calculating Financial Health Score (0-100)
 *
 * Scoring criteria:
 * 1. Savings Rate (30 pts) - % of income saved this month
 * 2. Budget Adherence (25 pts) - how well you stay within budgets
 * 3. Expense Ratio (25 pts) - expense vs income ratio
 * 4. Consistency (20 pts) - income regularity over last 3 months
 */
export function useFinancialHealth() {
  const score = ref(0)
  const breakdown = ref({
    savingsRate: { score: 0, max: 30, label: 'Rasio Tabungan', detail: '' },
    budgetAdherence: { score: 0, max: 25, label: 'Kepatuhan Budget', detail: '' },
    expenseRatio: { score: 0, max: 25, label: 'Rasio Pengeluaran', detail: '' },
    consistency: { score: 0, max: 20, label: 'Konsistensi', detail: '' },
  })
  const loading = ref(false)
  const grade = computed(() => {
    if (score.value >= 80) return { label: 'Sangat Sehat', color: '#10B981', emoji: '🌟' }
    if (score.value >= 60) return { label: 'Sehat', color: '#3B82F6', emoji: '👍' }
    if (score.value >= 40) return { label: 'Cukup', color: '#F59E0B', emoji: '⚠️' }
    if (score.value >= 20) return { label: 'Kurang Sehat', color: '#F97316', emoji: '😟' }
    return { label: 'Perlu Perhatian', color: '#EF4444', emoji: '🚨' }
  })

  const tips = computed(() => {
    const t = []
    if (breakdown.value.savingsRate.score < 15) {
      t.push('Coba sisihkan minimal 20% dari pendapatan untuk tabungan')
    }
    if (breakdown.value.budgetAdherence.score < 15) {
      t.push('Beberapa budget terlampaui — review pengeluaran di kategori tersebut')
    }
    if (breakdown.value.expenseRatio.score < 15) {
      t.push('Pengeluaran terlalu tinggi dibanding pendapatan — cari area yang bisa dikurangi')
    }
    if (breakdown.value.consistency.score < 10) {
      t.push('Pendapatan tidak konsisten — pertimbangkan sumber income tambahan')
    }
    if (t.length === 0) {
      t.push('Keuangan kamu dalam kondisi baik! Pertahankan kebiasaan ini.')
    }
    return t
  })

  /**
   * Calculate the financial health score
   */
  const calculateScore = async () => {
    loading.value = true
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()

      // Current month date range
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endOfMonth = new Date(year, month + 1, 0)
      const endDate = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`

      // Fetch current month transactions and budgets in parallel
      const [currentMonthData, budgetData, threeMonthData] = await Promise.all([
        api.transactions.list({ startDate, endDate, limit: '5000' }),
        api.budgets.list(),
        getThreeMonthData(year, month),
      ])

      const transactions = currentMonthData.transactions || currentMonthData || []

      // Calculate income and expense for current month
      const monthIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const monthExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      // 1. Savings Rate Score (30 pts)
      const savingsRateScore = calculateSavingsRate(monthIncome, monthExpense)

      // 2. Budget Adherence Score (25 pts)
      const budgetScore = calculateBudgetAdherence(transactions, budgetData || [])

      // 3. Expense Ratio Score (25 pts)
      const expenseRatioScore = calculateExpenseRatio(monthIncome, monthExpense)

      // 4. Consistency Score (20 pts)
      const consistencyScore = calculateConsistency(threeMonthData)

      // Update breakdown
      breakdown.value = {
        savingsRate: savingsRateScore,
        budgetAdherence: budgetScore,
        expenseRatio: expenseRatioScore,
        consistency: consistencyScore,
      }

      // Total score
      score.value = Math.round(
        savingsRateScore.score +
        budgetScore.score +
        expenseRatioScore.score +
        consistencyScore.score
      )
    } catch (err) {
      console.error('Error calculating financial health:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Get income data for last 3 months
   */
  const getThreeMonthData = async (year, month) => {
    const months = []
    for (let i = 2; i >= 0; i--) {
      const d = new Date(year, month - i, 1)
      const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
      months.push({ start, end: endStr })
    }

    const results = await Promise.all(
      months.map(m => api.transactions.list({ startDate: m.start, endDate: m.end, limit: '5000' }))
    )

    return results.map(r => {
      const txs = r.transactions || r || []
      return {
        income: txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
        expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
      }
    })
  }

  /**
   * Savings Rate: 30 pts
   * 30%+ savings = 30pts, 20% = 25pts, 10% = 15pts, 0% = 5pts, negative = 0pts
   */
  const calculateSavingsRate = (income, expense) => {
    if (income === 0) {
      return { score: 0, max: 30, label: 'Rasio Tabungan', detail: 'Belum ada pendapatan bulan ini' }
    }

    const savings = income - expense
    const rate = (savings / income) * 100

    let pts = 0
    if (rate >= 30) pts = 30
    else if (rate >= 20) pts = 25
    else if (rate >= 10) pts = 18
    else if (rate >= 5) pts = 12
    else if (rate >= 0) pts = 5
    else pts = 0

    return {
      score: pts,
      max: 30,
      label: 'Rasio Tabungan',
      detail: rate >= 0 ? `${rate.toFixed(0)}% dari pendapatan ditabung` : `Pengeluaran melebihi pendapatan`,
    }
  }

  /**
   * Budget Adherence: 25 pts
   * All budgets under limit = 25pts, some over = proportional
   */
  const calculateBudgetAdherence = (transactions, budgets) => {
    if (budgets.length === 0) {
      return { score: 15, max: 25, label: 'Kepatuhan Budget', detail: 'Belum ada budget — buat budget untuk skor lebih akurat' }
    }

    // Calculate spending per category
    const spendingMap = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      spendingMap[t.category_id] = (spendingMap[t.category_id] || 0) + Number(t.amount)
    })

    let totalBudgets = budgets.length
    let withinBudget = 0

    budgets.forEach(b => {
      const spent = spendingMap[b.category_id] || 0
      if (spent <= Number(b.amount)) withinBudget++
    })

    const adherenceRate = withinBudget / totalBudgets
    const pts = Math.round(adherenceRate * 25)

    return {
      score: pts,
      max: 25,
      label: 'Kepatuhan Budget',
      detail: `${withinBudget}/${totalBudgets} kategori dalam batas budget`,
    }
  }

  /**
   * Expense Ratio: 25 pts
   * expense < 50% income = 25pts, < 70% = 20pts, < 90% = 12pts, >= 90% = 5pts
   */
  const calculateExpenseRatio = (income, expense) => {
    if (income === 0) {
      return { score: 0, max: 25, label: 'Rasio Pengeluaran', detail: 'Belum ada pendapatan' }
    }

    const ratio = (expense / income) * 100
    let pts = 0
    if (ratio <= 50) pts = 25
    else if (ratio <= 70) pts = 20
    else if (ratio <= 85) pts = 15
    else if (ratio <= 100) pts = 8
    else pts = 2

    return {
      score: pts,
      max: 25,
      label: 'Rasio Pengeluaran',
      detail: `${ratio.toFixed(0)}% pendapatan digunakan untuk pengeluaran`,
    }
  }

  /**
   * Consistency: 20 pts
   * Stable income over 3 months = 20pts, some variance = proportional
   */
  const calculateConsistency = (threeMonthData) => {
    const incomes = threeMonthData.map(m => m.income)
    const hasIncome = incomes.filter(i => i > 0)

    if (hasIncome.length === 0) {
      return { score: 0, max: 20, label: 'Konsistensi', detail: 'Belum ada data pendapatan' }
    }

    if (hasIncome.length === 1) {
      return { score: 8, max: 20, label: 'Konsistensi', detail: 'Baru 1 bulan ada pendapatan' }
    }

    // Calculate coefficient of variation
    const avg = hasIncome.reduce((s, v) => s + v, 0) / hasIncome.length
    const variance = hasIncome.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / hasIncome.length
    const stdDev = Math.sqrt(variance)
    const cv = avg > 0 ? (stdDev / avg) * 100 : 100

    let pts = 0
    if (cv <= 10) pts = 20
    else if (cv <= 25) pts = 16
    else if (cv <= 50) pts = 12
    else if (cv <= 75) pts = 8
    else pts = 4

    const monthCount = hasIncome.length
    return {
      score: pts,
      max: 20,
      label: 'Konsistensi',
      detail: `Pendapatan ${cv <= 25 ? 'stabil' : 'bervariasi'} selama ${monthCount} bulan terakhir`,
    }
  }

  return {
    score,
    breakdown,
    loading,
    grade,
    tips,
    calculateScore,
  }
}
