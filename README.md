# 💰 DuitKu - Personal Finance Manager

Aplikasi pencatatan keuangan personal yang modern dan mudah digunakan, dibangun dengan Vue.js 3 dan Tailwind CSS.

## ✨ Fitur

- ✅ Pencatatan pemasukan & pengeluaran
- ✅ Kategorisasi transaksi (default + custom)
- ✅ Dashboard interaktif dengan summary
- ✅ Laporan dan perbandingan bulanan
- ✅ Upload foto struk (compressed)
- ✅ Transaksi berulang
- ✅ Anggaran per kategori + budget forecast
- ✅ Target tabungan (savings goals) dengan kontribusi berkala
- ✅ Multi-user (owner + staff)
- ✅ CSV import & export JSON
- ✅ Dark mode
- ✅ Mobile-first responsive design
- ✅ PWA (installable, offline indicator)

## 🚀 Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Styling**: Tailwind CSS
- **Routing**: Vue Router 4
- **Charts**: Chart.js + vue-chartjs
- **Image Compression**: browser-image-compression
- **Build Tool**: Vite
- **Backend**: [DuitKu API](../duitku-api) (Express + Drizzle + Neon Postgres)
- **Auth**: Custom JWT (Bearer token)
- **Deployment**: Vercel

## 📦 Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: set VITE_API_URL to your backend URL

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the DuitKu API (e.g. `http://localhost:3000/api` or `https://duitku-api.vercel.app/api`) |

## 🔐 Authentication

User membuat akun owner via halaman Register, lalu owner bisa membuat akun staff dari halaman Team. Staff & owner berbagi data yang sama (data milik owner).

JWT disimpan di `localStorage` dan dikirim sebagai `Authorization: Bearer <token>` header oleh `src/utils/api.js`.

## 📂 Project Structure

```
src/
├── assets/styles/      # Global CSS
├── components/
│   ├── budget/
│   ├── category/
│   ├── chart/
│   ├── common/
│   ├── layout/
│   ├── pwa/
│   └── transaction/
├── composables/        # Vue composables (auth, transactions, budgets, dll)
├── utils/
│   ├── api.js          # HTTP client untuk backend
│   ├── dateHelpers.js
│   ├── formatters.js
│   ├── exportHelpers.js
│   └── importData.js
├── views/              # Halaman per route
├── router/             # Vue Router config
├── App.vue
└── main.js
```

## 🗄️ Data

Tidak ada database di sisi frontend. Semua data diakses melalui REST API backend (`VITE_API_URL`). Backend menggunakan PostgreSQL (Neon) sebagai datastore tunggal.

## 🚢 Deployment ke Vercel

### Via GitHub

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Vercel auto-detect Vite config
4. Set environment variable `VITE_API_URL`
5. Deploy

### Via Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

## 📝 Development Guidelines

Lihat `assistant.md` (assistant.md) untuk:
- Code style guidelines
- Naming conventions
- Component structure
- Git commit conventions
- Testing checklist

## 🔮 Future Enhancements

- [ ] Budget alerts & notifications
- [ ] Receipt OCR
- [ ] AI-powered categorization
- [ ] Financial insights (advanced)

## 📄 License

MIT License - feel free to use for personal projects

---

Made with ❤️ using Vue.js & Tailwind CSS
