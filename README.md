# 💰 DuitKu - Personal Finance Manager

Aplikasi pencatatan keuangan personal yang modern dan mudah digunakan, dibangun dengan Vue.js 3 dan Tailwind CSS.

## ✨ Fitur

- ✅ Pencatatan pemasukan & pengeluaran
- ✅ Kategorisasi transaksi (default + custom)
- ✅ Dashboard interaktif dengan summary
- ✅ Laporan dan perbandingan bulanan
- ✅ Upload foto struk (compressed)
- ✅ Transaksi berulang
- ✅ Export data ke JSON
- ✅ Dark mode
- ✅ Mobile-first responsive design

## 🚀 Tech Stack

- **Frontend**: Vue 3 (Composition API)
- **Styling**: Tailwind CSS
- **Database**: SQL.js (SQLite in browser)
- **Image Compression**: browser-image-compression
- **Build Tool**: Vite
- **Deployment**: Vercel

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Login

Demo account:
- **Username**: `santoso`
- **Password**: `santoso123`

## 📱 Screenshots

### Mobile View
- Dashboard dengan summary cards
- Form transaksi dengan kategori visual
- List transaksi dengan filter
- Laporan bulanan

### Desktop View
- Responsive layout untuk layar besar
- Bottom navigation berubah jadi sidebar

## 🎨 Design System

### Colors
- Primary: Emerald (#10B981)
- Success: Green
- Danger: Red
- Warning: Amber
- Info: Blue

### Typography
- Font: Inter (Google Fonts)
- Mobile-first approach

## 📂 Project Structure

```
src/
├── assets/styles/      # Global CSS
├── components/
│   ├── common/         # Reusable components
│   ├── layout/         # Layout components
│   ├── transaction/    # Transaction components
│   ├── category/       # Category components
│   ├── chart/          # Chart components
│   └── budget/         # Budget components
├── composables/        # Vue composables
├── utils/              # Utility functions
├── views/              # Page components
├── router/             # Vue Router config
├── App.vue
└── main.js
```

## 🗄️ Database Schema

Data disimpan di browser menggunakan SQL.js (SQLite). Schema lengkap ada di `CLAUDE.md`.

### Tables
- `users` - User accounts
- `categories` - Transaction categories
- `transactions` - Income & expense records
- `budgets` - Budget limits per category

## 🚢 Deployment ke Vercel

### Via GitHub

1. Push code ke GitHub repository
2. Import project di Vercel
3. Vercel akan auto-detect Vite config
4. Deploy!

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 📝 Development Guidelines

Lihat `CLAUDE.md` untuk:
- Code style guidelines
- Naming conventions
- Component structure
- Git commit conventions
- Testing checklist

## 🔮 Future Enhancements

- [ ] Budget alerts & notifications
- [ ] Multi-user support
- [ ] Cloud sync
- [ ] PWA support
- [ ] Receipt OCR
- [ ] AI-powered categorization
- [ ] Financial insights

## 📄 License

MIT License - feel free to use for personal projects

## 🤝 Contributing

Contributions are welcome! Please read `CLAUDE.md` for development guidelines.

---

Made with ❤️ using Vue.js & Tailwind CSS
