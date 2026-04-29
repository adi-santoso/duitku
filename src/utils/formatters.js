/**
 * Format number to Indonesian Rupiah
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format number with thousand separator
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num)
}

/**
 * Shorten large numbers (1000 -> 1K, 1000000 -> 1M)
 */
export function formatCompactNumber(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'M'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'Jt'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

/**
 * Parse currency string to number
 */
export function parseCurrency(str) {
  return parseFloat(str.replace(/[^0-9.-]+/g, ''))
}
