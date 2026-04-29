# 🚀 Quick Start Guide - DuitKu

## Langkah 1: Install Dependencies

```bash
npm install
```

## Langkah 2: Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## Langkah 3: Login

Gunakan akun demo:
- **Username**: `santoso`
- **Password**: `santoso123`

## Langkah 4: Mulai Gunakan

### Tambah Transaksi
1. Klik tombol "Pemasukan" atau "Pengeluaran" di dashboard
2. Pilih kategori
3. Masukkan jumlah
4. Pilih tanggal
5. (Opsional) Tambah deskripsi dan foto struk
6. Klik "Simpan"

### Lihat Laporan
1. Buka menu "Laporan" di bottom navigation
2. Pilih bulan yang ingin dilihat
3. Lihat breakdown per kategori
4. Bandingkan dengan bulan lain

### Export Data
1. Buka menu "Lainnya" → "Pengaturan"
2. Klik "Export Data"
3. File JSON akan terdownload

## Build untuk Production

```bash
npm run build
```

Output ada di folder `dist/`

## Deploy ke Vercel

### Via GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

Lalu import di [vercel.com](https://vercel.com)

### Via CLI
```bash
npm i -g vercel
vercel --prod
```

## Tips

- Data disimpan di browser (localStorage)
- Gunakan dark mode dengan toggle di header
- Foto struk otomatis di-compress
- Export data secara berkala untuk backup

## Troubleshooting

### Database error
- Clear browser cache & localStorage
- Reload aplikasi

### Build error
- Hapus `node_modules` dan `package-lock.json`
- Run `npm install` lagi

### Styling tidak muncul
- Pastikan Tailwind CSS ter-install
- Check `postcss.config.js` dan `tailwind.config.js`

---

Selamat menggunakan DuitKu! 💰
