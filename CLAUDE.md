# DuitKu - Personal Finance Manager

## Project Overview
Aplikasi pencatatan keuangan personal dengan fokus mobile-first, menggunakan Vue.js 3 dan Tailwind CSS.

## Tech Stack
- **Frontend**: Vue 3 (Composition API) + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
- **Charts**: Chart.js / vue-chartjs
- **Deployment**: Vercel
- **Storage**: Supabase cloud database

## Core Features
1. ✅ Pencatatan pemasukan & pengeluaran
2. ✅ Kategorisasi pengeluaran (default + custom)
3. ✅ Summary interactive dengan chart
4. ✅ Perbandingan keuangan per bulan
5. ✅ Export data (CSV/PDF)
6. ✅ Filter berdasarkan date range
7. ✅ Recurring transactions
8. ✅ Budget limit per kategori
9. ✅ Attach foto struk (optional, compressed base64)
10. ✅ Dark mode

## Authentication
- Supabase Auth (email + password)
- Supports user registration and login
- Session managed by Supabase SDK
- Row Level Security (RLS) ensures data isolation per user

## Database Schema

### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### categories
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'income' or 'expense'
  icon TEXT,
  color TEXT,
  is_default INTEGER DEFAULT 0,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### transactions
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'income' or 'expense'
  amount REAL NOT NULL,
  description TEXT,
  receipt_image TEXT, -- base64 compressed image
  transaction_date DATE NOT NULL,
  is_recurring INTEGER DEFAULT 0,
  recurring_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### budgets
```sql
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  period TEXT NOT NULL, -- 'monthly', 'yearly'
  start_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

## Default Categories

### Expense Categories
- 🍔 Makanan & Minuman (#FF6B6B)
- 🚗 Transport (#4ECDC4)
- 🏠 Rumah Tangga (#45B7D1)
- 💊 Kesehatan (#96CEB4)
- 🎮 Hiburan (#FFEAA7)
- 🛒 Belanja (#DFE6E9)
- 📚 Pendidikan (#74B9FF)
- 💼 Bisnis (#A29BFE)
- 💳 Tagihan (#FD79A8)
- 🎁 Lain-lain (#B2BEC3)

### Income Categories
- 💰 Gaji (#00B894)
- 💼 Freelance (#00CEC9)
- 📈 Investasi (#FDCB6E)
- 🎁 Hadiah (#E17055)
- 💵 Lainnya (#636E72)

## Folder Structure
```
duitku/
├── public/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Modal.vue
│   │   │   └── Card.vue
│   │   ├── layout/
│   │   │   ├── Header.vue
│   │   │   ├── BottomNav.vue
│   │   │   └── Sidebar.vue
│   │   ├── transaction/
│   │   │   ├── TransactionForm.vue
│   │   │   ├── TransactionList.vue
│   │   │   └── TransactionItem.vue
│   │   ├── category/
│   │   │   ├── CategorySelector.vue
│   │   │   └── CategoryManager.vue
│   │   ├── chart/
│   │   │   ├── PieChart.vue
│   │   │   ├── LineChart.vue
│   │   │   └── BarChart.vue
│   │   └── budget/
│   │       ├── BudgetCard.vue
│   │       └── BudgetProgress.vue
│   ├── composables/
│   │   ├── useAuth.js
│   │   ├── useDatabase.js
│   │   ├── useTransactions.js
│   │   ├── useCategories.js
│   │   ├── useBudgets.js
│   │   ├── useImageCompression.js
│   │   └── useDarkMode.js
│   ├── utils/
│   │   ├── db.js
│   │   ├── dateHelpers.js
│   │   ├── formatters.js
│   │   └── exportHelpers.js
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   ├── TransactionsView.vue
│   │   ├── CategoriesView.vue
│   │   ├── BudgetsView.vue
│   │   ├── ReportsView.vue
│   │   └── SettingsView.vue
│   ├── router/
│   │   └── index.js
│   ├── App.vue
│   └── main.js
├── .gitignore
├── CLAUDE.md
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

## Design Guidelines

### Colors (Tailwind)
- Primary: `emerald-500` (#10B981)
- Danger: `red-500` (#EF4444)
- Warning: `amber-500` (#F59E0B)
- Info: `blue-500` (#3B82F6)
- Dark: `slate-800` (#1E293B)
- Light: `slate-50` (#F8FAFC)

### Typography
- Font: Inter (Google Fonts)
- Heading: font-bold
- Body: font-normal
- Small: text-sm

### Spacing
- Mobile: p-4, gap-4
- Desktop: p-6, gap-6

### Components
- Rounded: rounded-xl
- Shadow: shadow-lg
- Transition: transition-all duration-200

## Mobile-First Breakpoints
```css
/* Mobile: default */
/* Tablet: md (768px) */
/* Desktop: lg (1024px) */
```

## Development Rules

### Code Style
1. Use Composition API with `<script setup>`
2. Use TypeScript-style JSDoc comments
3. Destructure props and emits
4. Use `const` over `let`
5. Single responsibility per component
6. Max 200 lines per component (split if larger)

### Naming Conventions
- Components: PascalCase (TransactionForm.vue)
- Composables: camelCase with 'use' prefix (useTransactions.js)
- Utils: camelCase (formatCurrency.js)
- Constants: UPPER_SNAKE_CASE

### Git Commit Convention
- feat: New feature
- fix: Bug fix
- style: UI/styling changes
- refactor: Code refactoring
- docs: Documentation
- chore: Maintenance

### Testing Checklist (Manual)
- [ ] Mobile responsive (375px - 428px)
- [ ] Tablet responsive (768px - 1024px)
- [ ] Desktop responsive (1280px+)
- [ ] Dark mode works
- [ ] Forms validation
- [ ] Image compression works
- [ ] Export functionality
- [ ] Charts render correctly
- [ ] Budget alerts trigger

## Deployment (Vercel)
1. Connect GitHub repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables: None needed (client-side only)

## Future Enhancements
- [ ] Multi-user support with real backend
- [ ] Cloud sync
- [ ] Mobile app (Capacitor)
- [ ] AI-powered expense categorization
- [ ] Receipt OCR scanning
- [ ] Financial insights & recommendations

## Notes
- Data stored in Supabase cloud (PostgreSQL)
- Authentication via Supabase Auth (email/password)
- Row Level Security (RLS) enabled on all tables
- Images compressed to max 200KB (stored as base64 in DB)
- Export limited to 1000 transactions per file
- Budget notifications shown on dashboard only
- Environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

---
Last updated: 2026-04-29
