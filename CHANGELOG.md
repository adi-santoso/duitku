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

## [Unreleased]

### 🔮 Planned Features
- Budget management with alerts
- Custom category creation
- Edit transaction
- Charts with Chart.js/ApexCharts
- PDF export
- PWA support
- Receipt OCR
- AI-powered categorization
- Multi-user support
- Cloud sync
- Real authentication
- Backend API

### 🐛 Known Issues
- None reported yet

---

## Version History

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

Last updated: 2026-04-28
