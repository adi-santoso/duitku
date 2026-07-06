/**
 * Smart search utility for transactions
 * Searches across multiple fields with fuzzy matching
 */

/**
 * Search transactions with smart matching
 * @param {Array} transactions - Array of transactions
 * @param {String} query - Search query
 * @returns {Array} - Filtered transactions
 */
export function smartSearchTransactions(transactions, query) {
  if (!query || !query.trim()) return transactions

  const searchTerms = query.toLowerCase().trim().split(/\s+/)

  return transactions.filter(transaction => {
    const searchableText = [
      transaction.description || '',
      transaction.category_name || '',
      transaction.amount?.toString() || '',
      transaction.type || '',
      formatAmount(transaction.amount),
      transaction.is_recurring ? 'berulang recurring' : '',
      transaction.receipt_image ? 'struk receipt foto' : ''
    ].join(' ').toLowerCase()

    // All search terms must match
    return searchTerms.every(term => {
      // Direct match
      if (searchableText.includes(term)) return true

      // Amount matching with shorthand (50k, 1jt, etc)
      if (matchAmount(term, transaction.amount)) return true

      // Date matching
      if (matchDate(term, transaction.transaction_date)) return true

      return false
    })
  })
}

/**
 * Match amount with shorthand notation
 * Examples: "50k" matches 50000, "1jt" matches 1000000
 */
function matchAmount(term, amount) {
  if (!amount) return false

  // Match exact amount
  const cleanTerm = term.replace(/[.,]/g, '')
  if (amount.toString().includes(cleanTerm)) return true

  // Match "k" notation (thousands)
  const kMatch = term.match(/^(\d+(?:\.\d+)?)k$/i)
  if (kMatch) {
    const value = parseFloat(kMatch[1]) * 1000
    return Math.abs(amount - value) < 100
  }

  // Match "jt" or "juta" notation (millions)
  const jtMatch = term.match(/^(\d+(?:\.\d+)?)(jt|juta)$/i)
  if (jtMatch) {
    const value = parseFloat(jtMatch[1]) * 1000000
    return Math.abs(amount - value) < 10000
  }

  // Match "rb" or "ribu" notation (thousands)
  const rbMatch = term.match(/^(\d+(?:\.\d+)?)(rb|ribu)$/i)
  if (rbMatch) {
    const value = parseFloat(rbMatch[1]) * 1000
    return Math.abs(amount - value) < 100
  }

  return false
}

/**
 * Match date with various formats
 * Examples: "jan", "januari", "2024", "12/01"
 */
function matchDate(term, dateString) {
  if (!dateString) return false

  const date = new Date(dateString)
  const monthNames = [
    'januari', 'februari', 'maret', 'april', 'mei', 'juni',
    'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
  ]
  const monthShort = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des']

  // Match month name
  const monthIndex = monthNames.findIndex(m => m.startsWith(term))
  if (monthIndex !== -1 && date.getMonth() === monthIndex) return true

  const shortIndex = monthShort.findIndex(m => m.startsWith(term))
  if (shortIndex !== -1 && date.getMonth() === shortIndex) return true

  // Match year
  if (term.length === 4 && date.getFullYear().toString() === term) return true

  // Match day
  if (term.length <= 2 && date.getDate().toString() === term) return true

  return false
}

/**
 * Format amount for display
 */
function formatAmount(amount) {
  if (!amount) return '0'

  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}jt`
  }

  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`
  }

  return amount.toString()
}

/**
 * Get search suggestions based on transactions
 */
export function getSearchSuggestions(transactions) {
  const suggestions = new Set()

  transactions.forEach(transaction => {
    // Add category names
    if (transaction.category_name) {
      suggestions.add(transaction.category_name)
    }

    // Add common descriptions (min 3 chars)
    if (transaction.description && transaction.description.length >= 3) {
      suggestions.add(transaction.description)
    }

    // Add amount ranges
    if (transaction.amount >= 1000000) {
      suggestions.add(`> 1jt`)
    } else if (transaction.amount >= 500000) {
      suggestions.add(`> 500k`)
    } else if (transaction.amount >= 100000) {
      suggestions.add(`> 100k`)
    }

    // Add month names
    const date = new Date(transaction.transaction_date)
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    suggestions.add(monthNames[date.getMonth()])
  })

  return Array.from(suggestions).slice(0, 20)
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text, query) {
  if (!query || !query.trim() || !text) return text

  const terms = query.toLowerCase().trim().split(/\s+/)
  let highlighted = text

  terms.forEach(term => {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi')
    highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-500/30 px-0.5 rounded">$1</mark>')
  })

  return highlighted
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
