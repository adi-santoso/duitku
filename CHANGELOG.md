# Changelog - DuitKu

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-04-28

### 🎉 Initial Release

#### ✨ Features
- **Authentication**
  - Login dengan dummy account (santoso/santoso123)
  - Session persistence dengan localStorage
  - Protected routes

- **Dashboard**
  - Summary cards (Pemasukan, Pengeluaran, Saldo)
  - Quick action buttons
  - Top 5 expense by category
  - Recent 5 transactions
  - Interactive cards

- **Transactions**
  - Add income/expense
  - Category selection (15 default categories)
  - Amount input with Rupiah format
  - Date picker
  - Description field
  - Receipt image upload (compressed)
  - Recurring transactions (daily/weekly/monthly/yearly)
  - Transaction list with filters
  - Transaction detail view
  - Delete transaction

- **Reports**
  - Monthly summary
  - Expense breakdown by category
  - Progress bars with percentages
  - Monthly comparison (last 6 months)
  - Month selector

- **Categories**
  - 10 default expense categories
  - 5 default income categories
  - Visual category display with icons

- **Settings**
  - Export data to JSON
  - Clear all data
  - Dark mode toggle
  - About section

- **UI/UX**
  - Mobile-first responsive design
  - Bottom navigation for mobile
  - Dark mode support
  - Smooth transitions
  - Modern gradient cards
  - Touch-friendly buttons
  - Modal dialogs
  - FAB (Floating Action Button)

#### 🛠️ Technical
- Vue 3 with Composition API
- Tailwind CSS for styling
- SQL.js for client-side database
- Vue Router for navigation
- Browser image compression
- LocalStorage persistence
- Vite for build tool
- Code splitting
- Lazy loading

#### 📦 Dependencies
- vue: ^3.4.21
- vue-router: ^4.3.0
- sql.js: ^1.10.3
- browser-image-compression: ^2.0.2
- tailwindcss: ^3.4.3

#### 📝 Documentation
- CLAUDE.md - Development guidelines
- README.md - Project overview
- DEPLOYMENT.md - Deployment guide
- QUICKSTART.md - Quick start guide
- TESTING.md - Testing checklist
- PROJECT_SUMMARY.md - Complete summary

---

## [2.1.0] - 2026-05-08

### ✨ New Features

- **Savings Goals** (Full-stack)
  - Target tabungan dengan progress bar & tracking
  - Kontribusi (deposit) dengan riwayat
  - Tab aktif/tercapai, icon & color picker
  - Backend: CRUD API + contributions endpoint
  - Database: `savings_goals` & `savings_contributions` tables

- **Financial Health Score**
  - Skor 0-100 berdasarkan 4 kriteria keuangan
  - Rasio Tabungan (30pts), Kepatuhan Budget (25pts), Rasio Pengeluaran (25pts), Konsistensi (20pts)
  - Grade label (Sangat Sehat → Perlu Perhatian) dengan warna & emoji
  - Tips keuangan actionable berdasarkan skor
  - Widget di Dashboard dengan animated circle progress

- **Smart Recurring Detection**
  - Auto-detect transaksi berulang dari 6 bulan history
  - Analisis: deskripsi similarity, konsistensi amount, interval regularity
  - Support: monthly, weekly, biweekly, yearly frequency
  - Confidence scoring, dismiss/mark-as-recurring actions
  - Notifikasi card di Dashboard

- **Quick Add FAB (Floating Action Button)**
  - Tombol floating global di semua halaman (kecuali login)
  - Expand animation dengan opsi Pemasukan/Pengeluaran
  - Backdrop blur, rotate animation on toggle
  - Responsive: above bottom nav (mobile), bottom-right (desktop)

- **Transaction Templates**
  - Simpan transaksi sebagai template untuk reuse
  - Template quick-select bar di TransactionModal
  - "Save as Template" checkbox saat membuat transaksi
  - Sorted by usage frequency, filtered by type
  - Stored in localStorage

- **Search & Filter Enhancement**
  - Amount range filter (min/max) dengan collapsible UI
  - Sort options: Terbaru, Terlama, Terbesar, Terkecil
  - Active filter badges dengan individual clear buttons
  - "Hapus semua" filter action

- **Keyboard Shortcuts**
  - `N` = New transaction (toggle FAB)
  - `/` = Focus search
  - `?` = Show shortcuts help modal
  - `Esc` = Close modal/popup
  - `G → H/T/R/B/S/C` = Navigate to pages
  - Disabled saat input focused, 1s prefix timeout

- **Spending Patterns Analysis**
  - Distribusi pengeluaran per hari (Senin-Minggu) dengan visual bars
  - Distribusi per periode bulan (awal/tengah/akhir)
  - Tren kategori vs bulan lalu (naik/turun/stabil/baru)
  - Rata-rata pengeluaran harian & hari terboros
  - Integrated di Reports page

### 🔧 Fixes

- **CORS on Vercel** (Backend)
  - Added `headers` block in vercel.json with static CORS headers
  - Added explicit OPTIONS method route for preflight handling
  - Relaxed helmet: disabled crossOriginEmbedderPolicy, unsafe-none crossOriginOpenerPolicy
  - Added production frontend URL to corsOrigin fallback
  - Debug logging for OPTIONS requests

### 📁 New Files

**Frontend:**
- `src/composables/useSavingsGoals.js`
- `src/composables/useFinancialHealth.js`
- `src/composables/useRecurringDetection.js`
- `src/composables/useTransactionTemplates.js`
- `src/composables/useKeyboardShortcuts.js`
- `src/composables/useSpendingPatterns.js`
- `src/components/common/FinancialHealthCard.vue`
- `src/components/common/RecurringSuggestions.vue`
- `src/components/common/QuickAddFAB.vue`
- `src/components/common/KeyboardShortcutsHelp.vue`
- `src/views/SavingsGoalsView.vue`

**Backend:**
- `src/services/savings-goal.service.ts`
- `src/routes/savings-goal.routes.ts`
- `migrations/001_savings_goals.sql`

---

## [Unreleased]

### 🔮 Planned Features
- Pin/Bookmark Transactions
- Notes & Tags (#trip, #project-x)
- Import CSV/Bank Statement
- Push Notifications (PWA)
- Multi-Currency support
- Onboarding Tour

### 🐛 Known Issues
- None reported yet

---

## Version History

- **2.1.0** (2026-05-08) - Savings Goals, Financial Health, Recurring Detection, FAB, Templates, Shortcuts, Patterns
- **1.0.0** (2026-04-28) - Initial release

---

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality (backwards compatible)
- **PATCH** version for bug fixes (backwards compatible)

Format: `MAJOR.MINOR.PATCH`

---

## Contributing

When adding new features:
1. Update this CHANGELOG.md
2. Update version in package.json
3. Update CLAUDE.md if needed
4. Add tests to TESTING.md
5. Update README.md if needed

---

Last updated: 2026-05-08
