# Deployment Guide - DuitKu

## Deploy ke Vercel

### Method 1: Via GitHub (Recommended)

1. **Push ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: DuitKu app"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import di Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Klik "New Project"
   - Import repository GitHub
   - Vercel akan auto-detect Vite config
   - Klik "Deploy"

3. **Done!**
   - Aplikasi akan live di `https://your-project.vercel.app`
   - Auto-deploy setiap kali push ke main branch

### Method 2: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Deploy preview
   vercel

   # Deploy production
   vercel --prod
   ```

## Environment Variables

Tidak ada environment variables yang diperlukan karena aplikasi ini fully client-side.

## Build Settings (Auto-detected)

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Custom Domain (Optional)

1. Di Vercel dashboard, pilih project
2. Settings → Domains
3. Add custom domain
4. Follow DNS configuration instructions

## Performance Tips

- Aplikasi sudah menggunakan code splitting
- Images di-compress otomatis
- SQL.js loaded via CDN
- Tailwind CSS purged untuk production

## Troubleshooting

### Build Failed
- Pastikan `package.json` dependencies lengkap
- Check Node.js version (recommended: 18+)

### Database Not Working
- SQL.js loaded dari CDN, pastikan internet connection
- Check browser console untuk errors

### Dark Mode Not Working
- Clear localStorage
- Check browser compatibility

## Post-Deployment Checklist

- [ ] Test login dengan demo account
- [ ] Test tambah transaksi
- [ ] Test dark mode toggle
- [ ] Test responsive di mobile
- [ ] Test export data
- [ ] Check performance di Lighthouse

## Support

Jika ada masalah, check:
1. Browser console untuk errors
2. Network tab untuk failed requests
3. Vercel deployment logs

---

Happy deploying! 🚀
