# Deployment Guide - DuitKu (Frontend)

## Deploy ke Vercel

### Method 1: Via GitHub (Recommended)

1. **Push ke GitHub**
   ```bash
   git push origin main
   ```

2. **Import di Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Klik "New Project"
   - Import repository GitHub
   - Vercel akan auto-detect Vite config
   - Tambahkan environment variable (lihat di bawah)
   - Klik "Deploy"

### Method 2: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel          # deploy preview
vercel --prod   # deploy production
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL of the DuitKu API, e.g. `https://duitku-api.vercel.app/api` |

Set di Vercel: Project Settings → Environment Variables.

## Build Settings (Auto-detected)

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Custom Domain (Optional)

1. Vercel dashboard → project → Settings → Domains
2. Add custom domain
3. Ikuti instruksi DNS

## Performance Tips

- Code splitting per route (sudah aktif)
- Image compression otomatis sebelum upload (max 200KB)
- Tailwind CSS purged untuk production
- Service worker (PWA) men-cache aset statis, **tidak** men-cache request `/api/*`

## Troubleshooting

### Build Failed
- Pastikan dependency lengkap (`npm install` ulang)
- Node.js 20+ direkomendasikan

### "Network error" di runtime
- Cek `VITE_API_URL` benar dan backend hidup
- Cek CORS di backend (`CORS_ORIGIN` harus include domain frontend)

### Login berhasil tapi langsung kembali ke halaman login
- Token tersimpan tapi auto-logout — cek `Authorization` header dikirim, dan backend `JWT_SECRET` belum berubah

## Post-Deployment Checklist

- [ ] Smoke test login dengan akun existing
- [ ] Tambah 1 transaksi test
- [ ] Cek dashboard summary muncul
- [ ] Test export data
- [ ] Cek PWA installable (Chrome → install icon)
- [ ] Lighthouse audit (target: PWA + performance > 90)

---

Happy deploying! 🚀
