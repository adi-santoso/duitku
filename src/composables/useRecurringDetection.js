import { ref } from 'vue'
import { api } from '@/utils/api'

/**
 * Smart Recurring Detection
 * Analyzes transaction history to find patterns that suggest recurring payments
 * (e.g., Netflix, electricity, rent) that aren't already marked as recurring
 */
export function useRecurringDetection() {
  const suggestions = ref([])
  const loading = ref(false)

  /**
   * Detect recurring patterns from transaction history
   * Looks for transactions with same description + similar amount appearing 2+ months
   */
  const detectRecurring = async () => {
    loading.value = true
    try {
      // Fetch last 6 months of transactions
      const now = new Date()
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      const startDate = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`
      const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

      const result = await api.transactions.list({
        startDate,
        endDate,
        limit: '5000',
      })

      const transactions = result.transactions || result || []

      // Only analyze non-recurring expense transactions with descriptions
      const candidates = transactions.filter(
        t => t.type === 'expense' && t.description && !t.is_recurring
      )

      // Group by normalized description
      const groups = {}
      candidates.forEach(t => {
        const key = normalizeDescription(t.description)
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(t)
      })

      // Analyze each group for recurring patterns
      const detected = []

      for (const [key, txs] of Object.entries(groups)) {
        if (txs.length < 2) continue

        const pattern = analyzePattern(txs)
        if (pattern) {
          detected.push({
            id: key,
            description: txs[0].description,
            category_id: txs[0].category_id,
            category_name: txs[0].category_name || txs[0].categories?.name,
            category_icon: txs[0].category_icon || txs[0].categories?.icon,
            avgAmount: pattern.avgAmount,
            frequency: pattern.frequency,
            occurrences: pattern.occurrences,
            lastDate: pattern.lastDate,
            confidence: pattern.confidence,
          })
        }
      }

      // Sort by confidence (highest first)
      suggestions.value = detected
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10) // Max 10 suggestions
    } catch (err) {
      console.error('Error detecting recurring transactions:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Normalize description for grouping
   * Lowercase, trim, remove extra spaces, remove common date patterns
   */
  const normalizeDescription = (desc) => {
    return desc
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g, '') // Remove dates
      .replace(/\b(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)\w*\b/gi, '') // Remove month names
      .replace(/\b\d{4}\b/g, '') // Remove years
      .trim()
  }

  /**
   * Analyze a group of transactions for recurring patterns
   */
  const analyzePattern = (txs) => {
    // Sort by date
    const sorted = [...txs].sort(
      (a, b) => new Date(a.transaction_date) - new Date(b.transaction_date)
    )

    // Calculate average amount
    const amounts = sorted.map(t => Number(t.amount))
    const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length

    // Check amount consistency (within 20% of average)
    const amountVariance = amounts.every(a => Math.abs(a - avgAmount) / avgAmount <= 0.2)
    if (!amountVariance && amounts.length > 2) {
      // Allow some variance for utility bills
      const withinRange = amounts.filter(a => Math.abs(a - avgAmount) / avgAmount <= 0.3)
      if (withinRange.length < amounts.length * 0.7) return null
    }

    // Calculate intervals between transactions (in days)
    const intervals = []
    for (let i = 1; i < sorted.length; i++) {
      const d1 = new Date(sorted[i - 1].transaction_date)
      const d2 = new Date(sorted[i].transaction_date)
      intervals.push(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)))
    }

    if (intervals.length === 0) return null

    const avgInterval = intervals.reduce((s, i) => s + i, 0) / intervals.length

    // Determine frequency
    let frequency = null
    if (avgInterval >= 25 && avgInterval <= 35) frequency = 'monthly'
    else if (avgInterval >= 6 && avgInterval <= 8) frequency = 'weekly'
    else if (avgInterval >= 350 && avgInterval <= 380) frequency = 'yearly'
    else if (avgInterval >= 13 && avgInterval <= 16) frequency = 'biweekly'
    else return null // Not a recognizable pattern

    // Calculate confidence score (0-100)
    let confidence = 0

    // More occurrences = higher confidence
    confidence += Math.min(sorted.length * 15, 45)

    // Consistent amounts = higher confidence
    const amountStdDev = Math.sqrt(
      amounts.reduce((s, a) => s + Math.pow(a - avgAmount, 2), 0) / amounts.length
    )
    const amountCV = avgAmount > 0 ? (amountStdDev / avgAmount) * 100 : 100
    if (amountCV <= 5) confidence += 30
    else if (amountCV <= 10) confidence += 25
    else if (amountCV <= 20) confidence += 15
    else confidence += 5

    // Consistent intervals = higher confidence
    const intervalStdDev = Math.sqrt(
      intervals.reduce((s, i) => s + Math.pow(i - avgInterval, 2), 0) / intervals.length
    )
    if (intervalStdDev <= 3) confidence += 25
    else if (intervalStdDev <= 7) confidence += 15
    else confidence += 5

    if (confidence < 40) return null // Too low confidence

    return {
      avgAmount: Math.round(avgAmount),
      frequency,
      occurrences: sorted.length,
      lastDate: sorted[sorted.length - 1].transaction_date,
      confidence: Math.min(confidence, 100),
    }
  }

  /**
   * Dismiss a suggestion (remove from list)
   */
  const dismissSuggestion = (id) => {
    suggestions.value = suggestions.value.filter(s => s.id !== id)
  }

  /**
   * Get frequency label in Indonesian
   */
  const getFrequencyLabel = (freq) => {
    const labels = {
      daily: 'Harian',
      weekly: 'Mingguan',
      biweekly: '2 Mingguan',
      monthly: 'Bulanan',
      yearly: 'Tahunan',
    }
    return labels[freq] || freq
  }

  return {
    suggestions,
    loading,
    detectRecurring,
    dismissSuggestion,
    getFrequencyLabel,
  }
}
