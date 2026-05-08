import { ref } from 'vue'
import { api } from '@/utils/api'

/**
 * Composable for importing transactions from CSV files
 * Supports common bank statement formats and custom CSV
 */
export function useCSVImport() {
  const parsedData = ref([])
  const columnMapping = ref({})
  const importing = ref(false)
  const importProgress = ref(0)
  const importResult = ref(null)
  const parseError = ref('')

  // Common column name patterns
  const columnPatterns = {
    date: ['date', 'tanggal', 'tgl', 'transaction_date', 'trans_date', 'posting_date'],
    amount: ['amount', 'jumlah', 'nominal', 'value', 'debit', 'kredit', 'credit'],
    description: ['description', 'deskripsi', 'keterangan', 'narasi', 'memo', 'note', 'remarks'],
    type: ['type', 'tipe', 'jenis', 'dc', 'db/cr'],
  }

  /**
   * Parse CSV string into array of objects
   */
  const parseCSV = (csvText) => {
    parseError.value = ''
    parsedData.value = []

    try {
      const lines = csvText.trim().split(/\r?\n/)
      if (lines.length < 2) {
        parseError.value = 'File CSV harus memiliki minimal 1 baris header dan 1 baris data'
        return false
      }

      // Parse header
      const headers = parseCSVLine(lines[0])

      // Auto-detect column mapping
      const mapping = {}
      headers.forEach((header, idx) => {
        const normalized = header.toLowerCase().trim()
        for (const [field, patterns] of Object.entries(columnPatterns)) {
          if (patterns.some(p => normalized.includes(p))) {
            if (!mapping[field]) mapping[field] = idx
          }
        }
      })
      columnMapping.value = { headers, mapping }

      // Parse data rows
      const rows = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = parseCSVLine(line)
        const row = {}
        headers.forEach((h, idx) => {
          row[h] = values[idx] || ''
        })
        row._index = i
        rows.push(row)
      }

      parsedData.value = rows
      return true
    } catch (err) {
      parseError.value = `Error parsing CSV: ${err.message}`
      return false
    }
  }

  /**
   * Parse a single CSV line (handles quoted fields)
   */
  const parseCSVLine = (line) => {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if ((char === ',' || char === ';' || char === '\t') && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  /**
   * Parse file and return parsed data
   */
  const parseFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const success = parseCSV(e.target.result)
        resolve(success)
      }
      reader.onerror = () => reject(new Error('Gagal membaca file'))
      reader.readAsText(file)
    })
  }

  /**
   * Import parsed data as transactions
   * @param {Object} config - { dateCol, amountCol, descCol, typeCol, defaultType, categoryId, dateFormat }
   */
  const importTransactions = async (config) => {
    importing.value = true
    importProgress.value = 0
    importResult.value = null

    const { dateCol, amountCol, descCol, typeCol, defaultType, categoryId, dateFormat } = config
    const headers = columnMapping.value.headers

    let success = 0
    let failed = 0
    const errors = []

    for (let i = 0; i < parsedData.value.length; i++) {
      const row = parsedData.value[i]

      try {
        // Parse date
        const rawDate = row[headers[dateCol]]
        const transactionDate = parseDate(rawDate, dateFormat)
        if (!transactionDate) {
          errors.push(`Baris ${i + 2}: Format tanggal tidak valid "${rawDate}"`)
          failed++
          continue
        }

        // Parse amount
        let rawAmount = row[headers[amountCol]]
        rawAmount = rawAmount.replace(/[^\d.,\-]/g, '').replace(/\./g, '').replace(',', '.')
        const amount = Math.abs(parseFloat(rawAmount))
        if (isNaN(amount) || amount <= 0) {
          errors.push(`Baris ${i + 2}: Jumlah tidak valid "${row[headers[amountCol]]}"`)
          failed++
          continue
        }

        // Determine type
        let type = defaultType
        if (typeCol !== null && typeCol !== undefined) {
          const typeVal = (row[headers[typeCol]] || '').toLowerCase()
          if (typeVal.includes('cr') || typeVal.includes('credit') || typeVal.includes('masuk') || typeVal.includes('income')) {
            type = 'income'
          } else if (typeVal.includes('db') || typeVal.includes('debit') || typeVal.includes('keluar') || typeVal.includes('expense')) {
            type = 'expense'
          }
        } else if (rawAmount.startsWith('-')) {
          type = 'expense'
        }

        // Description
        const description = descCol !== null && descCol !== undefined
          ? row[headers[descCol]] || ''
          : ''

        await api.transactions.create({
          type,
          categoryId,
          amount,
          transactionDate,
          description: description.substring(0, 500),
        })

        success++
      } catch (err) {
        errors.push(`Baris ${i + 2}: ${err.message}`)
        failed++
      }

      importProgress.value = Math.round(((i + 1) / parsedData.value.length) * 100)
    }

    importResult.value = { success, failed, errors: errors.slice(0, 10), total: parsedData.value.length }
    importing.value = false
  }

  /**
   * Parse date string to YYYY-MM-DD format
   */
  const parseDate = (dateStr, format = 'auto') => {
    if (!dateStr) return null

    const cleaned = dateStr.trim()

    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned

    // DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/)
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }

    // MM/DD/YYYY
    if (format === 'mdy') {
      const mdyMatch = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/)
      if (mdyMatch) {
        const [, m, d, y] = mdyMatch
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
      }
    }

    // YYYY/MM/DD
    const ymdMatch = cleaned.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/)
    if (ymdMatch) {
      const [, y, m, d] = ymdMatch
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }

    // Try native Date parsing as fallback
    const d = new Date(cleaned)
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0]
    }

    return null
  }

  /**
   * Reset state
   */
  const reset = () => {
    parsedData.value = []
    columnMapping.value = {}
    importProgress.value = 0
    importResult.value = null
    parseError.value = ''
  }

  return {
    parsedData,
    columnMapping,
    importing,
    importProgress,
    importResult,
    parseError,
    parseFile,
    parseCSV,
    importTransactions,
    reset,
  }
}
