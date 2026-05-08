import { ref } from 'vue'
import { api } from '@/utils/api'

/**
 * Composable for Year-in-Review summary
 * Provides annual financial overview
 */
export function useYearReview() {
  const review = ref(null)
  const loading = ref(false)

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  /**
   * Generate year-in-review for a given year
   */
  const generateReview = async (year) => {
    loading.value = true
    try {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`

      const result = await api.transactions.list({
        startDate,
        endDate,
        limit: '10000',
      })

      const transactions = result.transactions || result || []

      if (transactions.length === 0) {
        review.value = null
        return
      }

      // Total income & expense
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      const totalSaved = totalIncome - totalExpense

      // Monthly breakdown
      const monthlyData = Array(12).fill(null).map((_, i) => ({
        month: i,
        label: monthNames[i],
        income: 0,
        expense: 0,
      }))

      transactions.forEach(t => {
        const month = new Date(t.transaction_date).getMonth()
        if (t.type === 'income') monthlyData[month].income += Number(t.amount)
        else monthlyData[month].expense += Number(t.amount)
      })

      // Best & worst months
      const monthsWithData = monthlyData.filter(m => m.income > 0 || m.expense > 0)
      const bestMonth = [...monthsWithData].sort((a, b) => (b.income - b.expense) - (a.income - a.expense))[0]
      const worstMonth = [...monthsWithData].sort((a, b) => (a.income - a.expense) - (b.income - b.expense))[0]
      const highestExpenseMonth = [...monthsWithData].sort((a, b) => b.expense - a.expense)[0]
      const highestIncomeMonth = [...monthsWithData].sort((a, b) => b.income - a.income)[0]

      // Top expense categories
      const catMap = {}
      transactions.filter(t => t.type === 'expense').forEach(t => {
        const key = t.category_id
        if (!catMap[key]) {
          catMap[key] = {
            id: key,
            name: t.category_name || t.categories?.name || 'Unknown',
            icon: t.category_icon || t.categories?.icon || '📋',
            color: t.category_color || t.categories?.color || '#94a3b8',
            total: 0,
            count: 0,
          }
        }
        catMap[key].total += Number(t.amount)
        catMap[key].count++
      })

      const topCategories = Object.values(catMap).sort((a, b) => b.total - a.total).slice(0, 5)

      // Transaction stats
      const totalTransactions = transactions.length
      const avgTransactionAmount = totalTransactions > 0 ? (totalIncome + totalExpense) / totalTransactions : 0
      const largestExpense = transactions.filter(t => t.type === 'expense').sort((a, b) => Number(b.amount) - Number(a.amount))[0]
      const largestIncome = transactions.filter(t => t.type === 'income').sort((a, b) => Number(b.amount) - Number(a.amount))[0]

      // Savings rate
      const savingsRate = totalIncome > 0 ? ((totalSaved / totalIncome) * 100) : 0

      // Active months count
      const activeMonths = monthsWithData.length

      review.value = {
        year,
        totalIncome,
        totalExpense,
        totalSaved,
        savingsRate: Math.round(savingsRate),
        totalTransactions,
        avgTransactionAmount: Math.round(avgTransactionAmount),
        activeMonths,
        bestMonth,
        worstMonth,
        highestExpenseMonth,
        highestIncomeMonth,
        topCategories,
        largestExpense,
        largestIncome,
        monthlyData,
      }
    } catch (err) {
      console.error('Error generating year review:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    review,
    loading,
    generateReview,
    monthNames,
  }
}
