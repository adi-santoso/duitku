import { ref } from 'vue'
import { api } from '@/utils/api'

/**
 * Composable for analyzing spending patterns
 * Provides insights on:
 * - Day of week spending distribution
 * - Top spending categories trending up/down
 * - Average daily spending
 * - Peak spending days
 */
export function useSpendingPatterns() {
  const patterns = ref(null)
  const loading = ref(false)

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

  /**
   * Analyze spending patterns from last 3 months of data
   */
  const analyzePatterns = async () => {
    loading.value = true
    try {
      const now = new Date()
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      const startDate = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`
      const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

      const result = await api.transactions.list({
        startDate,
        endDate,
        type: 'expense',
        limit: '5000',
      })

      const transactions = result.transactions || result || []

      if (transactions.length === 0) {
        patterns.value = null
        return
      }

      // Analyze by day of week
      const daySpending = Array(7).fill(0).map(() => ({ total: 0, count: 0 }))
      transactions.forEach(t => {
        const day = new Date(t.transaction_date).getDay()
        daySpending[day].total += Number(t.amount)
        daySpending[day].count++
      })

      const dayOfWeek = daySpending.map((d, i) => ({
        day: dayNames[i],
        dayIndex: i,
        total: d.total,
        count: d.count,
        average: d.count > 0 ? Math.round(d.total / d.count) : 0,
      }))

      // Find peak day
      const peakDay = [...dayOfWeek].sort((a, b) => b.total - a.total)[0]
      const lowestDay = [...dayOfWeek].sort((a, b) => a.total - b.total).find(d => d.count > 0)

      // Category trends (compare this month vs last month)
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

      const thisMonthTxs = transactions.filter(t => {
        const d = new Date(t.transaction_date)
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
      })

      const lastMonthTxs = transactions.filter(t => {
        const d = new Date(t.transaction_date)
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
      })

      // Group by category
      const thisMonthByCat = groupByCategory(thisMonthTxs)
      const lastMonthByCat = groupByCategory(lastMonthTxs)

      // Calculate trends
      const categoryTrends = []
      const allCatIds = new Set([...Object.keys(thisMonthByCat), ...Object.keys(lastMonthByCat)])

      allCatIds.forEach(catId => {
        const thisTotal = thisMonthByCat[catId]?.total || 0
        const lastTotal = lastMonthByCat[catId]?.total || 0
        const info = thisMonthByCat[catId] || lastMonthByCat[catId]

        if (lastTotal > 0) {
          const change = ((thisTotal - lastTotal) / lastTotal) * 100
          categoryTrends.push({
            categoryId: catId,
            categoryName: info.name,
            categoryIcon: info.icon,
            categoryColor: info.color,
            thisMonth: thisTotal,
            lastMonth: lastTotal,
            change: Math.round(change),
            direction: change > 10 ? 'up' : change < -10 ? 'down' : 'stable',
          })
        } else if (thisTotal > 0) {
          categoryTrends.push({
            categoryId: catId,
            categoryName: info.name,
            categoryIcon: info.icon,
            categoryColor: info.color,
            thisMonth: thisTotal,
            lastMonth: 0,
            change: 100,
            direction: 'new',
          })
        }
      })

      // Sort by absolute change
      categoryTrends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))

      // Calculate daily average
      const totalDays = Math.ceil((now - threeMonthsAgo) / (1000 * 60 * 60 * 24))
      const totalSpending = transactions.reduce((s, t) => s + Number(t.amount), 0)
      const dailyAverage = Math.round(totalSpending / totalDays)

      // Time of month analysis (early/mid/late)
      const periodSpending = { early: 0, mid: 0, late: 0 }
      transactions.forEach(t => {
        const day = new Date(t.transaction_date).getDate()
        if (day <= 10) periodSpending.early += Number(t.amount)
        else if (day <= 20) periodSpending.mid += Number(t.amount)
        else periodSpending.late += Number(t.amount)
      })

      const totalPeriod = periodSpending.early + periodSpending.mid + periodSpending.late
      const periodAnalysis = [
        { label: 'Awal bulan (1-10)', amount: periodSpending.early, percentage: totalPeriod > 0 ? Math.round((periodSpending.early / totalPeriod) * 100) : 0 },
        { label: 'Tengah bulan (11-20)', amount: periodSpending.mid, percentage: totalPeriod > 0 ? Math.round((periodSpending.mid / totalPeriod) * 100) : 0 },
        { label: 'Akhir bulan (21-31)', amount: periodSpending.late, percentage: totalPeriod > 0 ? Math.round((periodSpending.late / totalPeriod) * 100) : 0 },
      ]

      patterns.value = {
        dayOfWeek,
        peakDay,
        lowestDay,
        categoryTrends: categoryTrends.slice(0, 8),
        dailyAverage,
        totalTransactions: transactions.length,
        periodAnalysis,
      }
    } catch (err) {
      console.error('Error analyzing spending patterns:', err)
    } finally {
      loading.value = false
    }
  }

  const groupByCategory = (txs) => {
    const map = {}
    txs.forEach(t => {
      const catId = t.category_id
      if (!map[catId]) {
        map[catId] = {
          total: 0,
          name: t.category_name || t.categories?.name || 'Unknown',
          icon: t.category_icon || t.categories?.icon || '📋',
          color: t.category_color || t.categories?.color || '#94a3b8',
        }
      }
      map[catId].total += Number(t.amount)
    })
    return map
  }

  return {
    patterns,
    loading,
    analyzePatterns,
    dayNames,
  }
}
