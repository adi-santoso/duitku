import { formatCurrency } from './formatters'

/**
 * Export transactions to CSV format
 * @param {Array} transactions - Array of transaction objects
 * @returns {void} - Downloads CSV file
 */
export function exportToCSV(transactions) {
  if (!transactions || transactions.length === 0) {
    throw new Error('Tidak ada data untuk di-export')
  }

  const headers = ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah', 'Recurring']
  const rows = transactions.map(t => [
    t.transaction_date,
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.category_name || '-',
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.type === 'income' ? t.amount : -t.amount,
    t.is_recurring ? `Ya (${getFrequencyLabel(t.recurring_frequency)})` : 'Tidak'
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Add BOM for Excel compatibility with Indonesian characters
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `duitku-export-${getDateStamp()}.csv`)
}

/**
 * Export transactions to PDF format (simple table layout)
 * Uses browser print API for PDF generation (no external dependency)
 * @param {Array} transactions - Array of transaction objects
 * @param {Object} summary - Summary data { totalIncome, totalExpense, balance }
 * @returns {void} - Opens print dialog for PDF
 */
export function exportToPDF(transactions, summary = {}) {
  if (!transactions || transactions.length === 0) {
    throw new Error('Tidak ada data untuk di-export')
  }

  const totalIncome = summary.totalIncome || transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = summary.totalExpense || transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  const tableRows = transactions.slice(0, 1000).map(t => `
    <tr>
      <td>${t.transaction_date}</td>
      <td><span class="${t.type === 'income' ? 'income' : 'expense'}">${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
      <td>${t.category_name || '-'}</td>
      <td>${t.description || '-'}</td>
      <td class="${t.type === 'income' ? 'income' : 'expense'}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>DuitKu - Laporan Keuangan</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
        .header h1 { font-size: 24px; color: #10b981; margin-bottom: 4px; }
        .header p { color: #64748b; font-size: 13px; }
        .summary { display: flex; gap: 20px; margin-bottom: 30px; }
        .summary-card { flex: 1; padding: 16px; border-radius: 12px; text-align: center; }
        .summary-card.income { background: #ecfdf5; border: 1px solid #a7f3d0; }
        .summary-card.expense { background: #fef2f2; border: 1px solid #fecaca; }
        .summary-card.balance { background: #f0f9ff; border: 1px solid #bae6fd; }
        .summary-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-card .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
        .summary-card.income .value { color: #059669; }
        .summary-card.expense .value { color: #dc2626; }
        .summary-card.balance .value { color: #0284c7; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 2px solid #e2e8f0; }
        td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
        tr:hover { background: #f8fafc; }
        .income { color: #059669; }
        .expense { color: #dc2626; }
        .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        @media print { body { padding: 20px; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>DuitKu</h1>
        <p>Laporan Keuangan - Diekspor ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div class="summary">
        <div class="summary-card income">
          <div class="label">Total Pemasukan</div>
          <div class="value">${formatCurrency(totalIncome)}</div>
        </div>
        <div class="summary-card expense">
          <div class="label">Total Pengeluaran</div>
          <div class="value">${formatCurrency(totalExpense)}</div>
        </div>
        <div class="summary-card balance">
          <div class="label">Saldo</div>
          <div class="value">${formatCurrency(balance)}</div>
        </div>
      </div>

      <h3 style="margin-bottom: 10px; font-size: 14px;">Detail Transaksi (${transactions.length} data)</h3>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Tipe</th>
            <th>Kategori</th>
            <th>Deskripsi</th>
            <th>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        <p>DuitKu v2.0.0 - Aplikasi Pencatatan Keuangan Personal</p>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.print()
  }
}

/**
 * Export transactions to JSON format
 * @param {Array} transactions - Array of transaction objects
 * @returns {void} - Downloads JSON file
 */
export function exportToJSON(transactions) {
  if (!transactions || transactions.length === 0) {
    throw new Error('Tidak ada data untuk di-export')
  }

  const data = {
    appName: 'DuitKu',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    totalTransactions: transactions.length,
    transactions
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `duitku-export-${getDateStamp()}.json`)
}

/**
 * Helper: Download blob as file
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Helper: Get date stamp for filename
 */
function getDateStamp() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Helper: Get frequency label in Indonesian
 */
function getFrequencyLabel(freq) {
  const labels = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan'
  }
  return labels[freq] || freq || ''
}
