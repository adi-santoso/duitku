# 💰 DuitKu v2.0 - Modern Personal Finance Manager

Aplikasi pencatatan dan analisis keuangan personal yang modern, intuitif, dan estetis, dibangun menggunakan **Vue.js 3**, **Tailwind CSS**, dan skema desain **Fresh UI System**.

![UI Theme](https://img.shields.io/badge/Theme-Fresh%20Lime%20%26%20Coral-c8f16d?style=for-the-badge)
![Vue 3](https://img.shields.io/badge/Vue.js%203-Composition%20API-4fc08d?style=for-the-badge)
![PWA Ready](https://img.shields.io/badge/PWA-Installable-blue?style=for-the-badge)

---

## ✨ Fitur Utama (v2.0 Overhaul)

### 🎨 1. Design System & Estetika Premium (Fresh UI)
- **Skema Warna Kurasi**: Palette *Ink Canvas* (`#0c131d`), *Fresh Lime Accent* (`#c8f16d` / `#70a214`), *Soft Coral Accent* (`#ff8068`), dan kartu `bg-surface`.
- **Typography Modern**: Penggunaan font display **Manrope** (`font-display font-extrabold`) untuk visualisasi angka nominal yang sangat mudah dibaca.
- **Eleva 3D & Mikro-Animasi**: Bayangan melayang `shadow-soft` & `shadow-float`, efek *hover lift* `hover:-translate-y-1`, zoom ikon `group-hover:scale-110`, serta transisi *fade-in* yang halus.

---

### 💳 2. Pengelolaan Transaksi Interaktif (`/transactions`)
- **Pencatatan & Filter Cepat**: Filter tipe transaksi (*Semua*, *Pemasukan*, *Pengeluaran*), bar pencarian modern, dan pemilih rentang tanggal.
- **Header Tanggal Sticky**: Kelompok tanggal bergaya *backdrop-blur* `rounded-2xl`.
- **Creative Hero Detail Modal**: Modal detail transaksi dengan Banner Card Hero (Lime untuk Pemasukan, Coral untuk Pengeluaran), kartu pratinjau foto struk, dan grid spesifikasi transaksi.
- **Interactive Spreadsheet View Mode**: Mode tampilan tabel data grid seperti Excel/Spreadsheet lengkap dengan **Toolbar Rumus `fx SUMMARY(Transactions)`**, kolom indeks baris `#`, badge kategori berikon, *zebra striping*, dan *hover highlight*.

---

### 📊 3. Laporan Keuangan Total (`/reports`)
- **Hero Banner Arus Kas Asimetris**: Banner kas utama dengan nominal Saldo Netto raksasa, indikator kesehatan kas (*✓ Surplus Sehat* vs *⚠️ Defisit*), dan **Visual Progress Bar Rasio Tabungan** terintegrasi.
- **Leaderboard Pengeluaran Terbesar**: Peringkat kategori pengeluaran (#1, #2, #3...) dengan badge ranking, avatar icon melayang, dan progress fill animasi.
- **Donut Chart Cutout Label**: Grafik lingkaran dengan **Label Nominal Tengah** (`TOTAL TERPAKAI`).
- **Grid Kebiasaan & Pola Belanja**: Insight rata-rata harian, *Hari Terboros dengan Icon Api 🔥*, histogram intensitas per hari (Senin-Minggu), dan distribusi waktu.
- **Performance Timeline & Showcase Tahunan**: Perbandingan bulanan berkala dan kartu evaluasi tahunan.

---

### 📈 4. Modul Analitik & Insights Inteligensi (`/analytics`)
- **🎯 BudgetAlertCard**: Meteran progress melingkar SVG `stroke-width="10"` dengan warna dinamis (Lime/Yellow/Coral) & rekomendasi *Sisa Anggaran per Hari*.
- **🔥 SpendingVelocityWidget**: Pengukur kecepatan pengeluaran real-time (*Laju Hemat*, *Laju Cepat*, *Laju Normal*) dengan 3 mini stat card dan pesan peringatan otomatis.
- **📈 SavingsRateChart**: Timeline rasio tabungan dengan area fill *Lime* & garis benchmark target *Coral*.
- **📊 TrendChart**: Grafik tren Pemasukan vs Pengeluaran dengan switcher granulasi (*Harian*, *Mingguan*, *Bulanan*, *Tahunan*).
- **🔍 CategoryInsightCard**: Wawasan kategori mendalam dengan deteksi anomali (*Spike/Drop*) & leaderboard tempat belanja (*Top Merchants*).
- **🔮 ForecastChart**: Prediksi arus kas {{ N }} bulan ke depan lengkap dengan progress bar *Confidence Score*.
- **🔄 RecurringPatternsCard**: Auto-detect transaksi rutin bulanan/mingguan dengan satu-klik CTA `✅ Jadikan Transaksi Berulang`.

---

## 🚀 Tech Stack

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **Styling**: Tailwind CSS + Custom Design Tokens (Ink, Lime, Coral, Canvas, Surface)
- **Routing**: Vue Router 4
- **Charts**: Chart.js 4 + `vue-chartjs`
- **Image Compression**: `browser-image-compression`
- **Build Tool**: Vite 5
- **Backend API**: Express.js + Drizzle ORM + PostgreSQL (Neon)
- **PWA**: `vite-plugin-pwa` (Installable, Service Worker precache)

---

## 📦 Instalasi & Penggunaan

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Konfigurasi Environment Variable
cp .env.example .env
# Set VITE_API_URL ke backend API (e.g. http://localhost:3000/api)

# 3. Jalankan server Development
npm run dev

# 4. Build untuk Production
npm run build

# 5. Preview hasil build
npm run preview
```

---

## 📂 Struktur Proyek

```
src/
├── assets/styles/      # Design system CSS & custom utility tokens
├── components/
│   ├── analytics/      # Widget analitik (BudgetAlert, Velocity, Forecast, dll)
│   ├── budget/         # Komponen manajemen anggaran
│   ├── category/       # Modal & chip kategori
│   ├── common/         # Base UI (BaseSelect, EmptyState, SkeletonCard)
│   ├── layout/         # Header & Navbar navigasi
│   ├── pwa/            # Toast update PWA & indikator offline
│   └── transaction/    # Detail Modal, Filter Modal, Spreadsheet Table
├── composables/        # Vue composables (useAnalytics, useTransactions, dll)
├── utils/              # Helper formatters, date helpers, export/import
├── views/              # Halaman per route (Dashboard, Transactions, Reports, Analytics)
├── router/             # Vue Router configuration
├── App.vue
└── main.js
```

---

## 📄 Lisensi

MIT License - Bebas digunakan untuk proyek personal & komersial.

---

Made with ❤️ using Vue 3, Tailwind CSS & Fresh UI System
