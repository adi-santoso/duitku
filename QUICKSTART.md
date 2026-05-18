# 🚀 Quick Start Guide - DuitKu

## Prerequisites

DuitKu butuh backend `duiku-api` jalan. Pilih salah satu:
- **Local backend**: clone & jalankan `duiku-api` di `http://localhost:3000`
- **Production backend**: gunakan `https://duitku-api.vercel.app/api`

## Langkah 1: Install Dependencies

```bash
npm install
```

## Langkah 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:3000/api      # untuk dev local
# atau
VITE_API_URL=https://duitku-api.vercel.app/api
```

## Langkah 3: Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## Langkah 4: Register & Login

1. Buka `/login`
2. Klik link "Daftar" untuk buat akun owner
3. Atau login dengan akun yang sudah ada

## Langkah 5: Mulai Gunakan

### Tambah Transaksi
1. Klik tombol "+" (FAB) di pojok kanan bawah, **atau** menu Transactions → "Tambah"
2. Pilih jenis (Pemasukan / Pengeluaran)
3. Pilih kategori
4. Masukkan jumlah, tanggal, deskripsi
5. (Opsional) Upload foto struk
6. Klik "Simpan"

### Atur Budget per Kategori
1. Menu "Budgets"
2. Klik "Tambah Budget"
3. Pilih kategori, nominal, periode (bulanan/tahunan)

### Buat Target Tabungan
1. Menu "Savings"
2. Klik "Tambah Target"
3. Set nama, target, tanggal target
4. Tambah kontribusi via tombol "Setor"

### Tambah Staff (owner only)
1. Menu "Team"
2. Klik "Tambah Staff"
3. Staff dapat akun terpisah tapi akses data owner

### Lihat Laporan
1. Menu "Reports"
2. Pilih bulan untuk breakdown kategori
3. Tab "Year Review" untuk ringkasan tahunan

### Export Data
1. Menu "Settings" → "Export Data"
2. File JSON akan terdownload

## Build untuk Production

```bash
npm run build
```

Output ada di folder `dist/`. Deploy ke Vercel atau hosting static lainnya.

## Tips

- **Dark mode**: toggle di header (preference disimpan di localStorage)
- **Keyboard shortcuts**: tekan `?` untuk lihat daftar shortcut
- **PWA**: install ke home screen lewat tombol "Install" di browser
- Foto struk otomatis di-compress (max 200KB)
- Export data secara berkala untuk backup tambahan

## Troubleshooting

### "Network error" / login gagal
- Pastikan backend hidup: `curl http://localhost:3000/api/health`
- Cek `VITE_API_URL` di `.env`

### Login berhasil tapi langsung redirect ke /login lagi
- Token mungkin expired/invalid. Coba login ulang
- Atau backend `JWT_SECRET` berubah → semua token lama tidak valid

### Build error
- Hapus `node_modules` dan `package-lock.json`
- Run `npm install` ulang
- Pastikan Node.js 20+

### Styling tidak muncul
- Pastikan Tailwind CSS terinstall (`tailwindcss` di devDependencies)
- Cek `postcss.config.js` dan `tailwind.config.js`

---

Selamat menggunakan DuitKu! 💰
