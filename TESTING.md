# Testing Checklist - DuitKu

## ✅ Pre-Deployment Testing

### Authentication
- [ ] Login dengan username & password yang benar
- [ ] Login dengan credentials salah (harus error)
- [ ] Logout dan redirect ke login page
- [ ] Protected routes tidak bisa diakses tanpa login
- [ ] Session persist setelah refresh

### Dashboard
- [ ] Summary cards menampilkan data yang benar
- [ ] Pemasukan, pengeluaran, dan saldo ter-calculate dengan benar
- [ ] Tombol "Tambah Transaksi" berfungsi
- [ ] Expense by category menampilkan top 5
- [ ] Recent transactions menampilkan 5 terbaru
- [ ] Klik transaksi membuka detail

### Add Transaction
- [ ] Modal muncul dengan benar
- [ ] Pilih kategori berfungsi
- [ ] Input amount hanya terima angka
- [ ] Date picker berfungsi (max: hari ini)
- [ ] Upload foto struk berfungsi
- [ ] Foto ter-compress (check size < 200KB)
- [ ] Preview foto muncul
- [ ] Hapus foto berfungsi
- [ ] Checkbox recurring berfungsi
- [ ] Dropdown frequency muncul saat recurring checked
- [ ] Validasi form (kategori & amount required)
- [ ] Simpan transaksi berhasil
- [ ] Modal close setelah simpan
- [ ] Dashboard update setelah tambah transaksi

### Transactions List
- [ ] List menampilkan semua transaksi
- [ ] Filter "Semua" berfungsi
- [ ] Filter "Pemasukan" berfungsi
- [ ] Filter "Pengeluaran" berfungsi
- [ ] Icon foto & recurring muncul jika ada
- [ ] Klik transaksi membuka detail
- [ ] FAB button berfungsi
- [ ] FAB menu muncul/hilang
- [ ] Tambah dari FAB berfungsi

### Transaction Detail
- [ ] Modal menampilkan data lengkap
- [ ] Kategori, amount, tanggal tampil benar
- [ ] Deskripsi tampil jika ada
- [ ] Foto struk tampil jika ada
- [ ] Klik foto membuka fullscreen
- [ ] Recurring info tampil jika ada
- [ ] Tombol hapus berfungsi
- [ ] Konfirmasi hapus muncul
- [ ] Transaksi terhapus dari list
- [ ] Modal close setelah hapus

### Reports
- [ ] Dropdown bulan berfungsi
- [ ] Summary cards update saat ganti bulan
- [ ] Expense by category tampil dengan benar
- [ ] Progress bar sesuai persentase
- [ ] Perbandingan bulanan tampil 6 bulan terakhir
- [ ] Data per bulan akurat

### Categories
- [ ] Kategori expense tampil semua (10 items)
- [ ] Kategori income tampil semua (5 items)
- [ ] Icon dan nama tampil dengan benar

### Settings
- [ ] Menu "Kelola Kategori" navigate ke /categories
- [ ] Menu "Kelola Anggaran" navigate ke /budgets
- [ ] Export data download file JSON
- [ ] File JSON berisi data transaksi
- [ ] Hapus data muncul konfirmasi 2x
- [ ] Hapus data clear localStorage
- [ ] App reload setelah hapus data

### Dark Mode
- [ ] Toggle dark mode berfungsi
- [ ] Semua halaman support dark mode
- [ ] Preference tersimpan di localStorage
- [ ] Dark mode persist setelah refresh
- [ ] Transisi smooth

### Responsive Design
- [ ] Mobile (375px): Layout rapi
- [ ] Mobile (428px): Layout rapi
- [ ] Tablet (768px): Layout rapi
- [ ] Desktop (1024px): Layout rapi
- [ ] Desktop (1440px): Layout rapi
- [ ] Bottom nav hanya muncul di mobile
- [ ] Modal fullscreen di mobile
- [ ] Modal centered di desktop
- [ ] Touch targets min 44px
- [ ] Text readable di semua ukuran

### Performance
- [ ] Initial load < 3 detik
- [ ] Navigation instant
- [ ] Modal open/close smooth
- [ ] Image compression berfungsi
- [ ] No console errors
- [ ] No console warnings
- [ ] Build size < 200KB (gzipped)

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Data Persistence
- [ ] Data tersimpan setelah refresh
- [ ] Data tersimpan setelah close browser
- [ ] Data tersimpan setelah logout/login
- [ ] Export/import data berfungsi

### Edge Cases
- [ ] Tidak ada transaksi: Empty state tampil
- [ ] Tidak ada kategori expense: Handled
- [ ] Upload file > 5MB: Error message
- [ ] Upload file bukan image: Error message
- [ ] Input amount negatif: Prevented
- [ ] Input amount 0: Prevented
- [ ] Tanggal future: Prevented

## 🐛 Known Issues

(Catat issues yang ditemukan di sini)

## 📝 Notes

- Test di incognito mode untuk fresh state
- Clear localStorage sebelum test
- Test dengan data dummy yang cukup (min 10 transaksi)
- Test dengan berbagai ukuran foto
- Test dengan transaksi di berbagai bulan

---

Last tested: [DATE]
Tested by: [NAME]
