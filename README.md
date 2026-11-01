# PT Jidoka Result Indonesia — Corporate & Digital Sales Platform Website

PT Jidoka Result Indonesia ("Jidoka"/"JRI") adalah produsen solusi packaging industri — karton box, imprabox, partition, custom packaging, serta PE sheet & film — untuk industri manufaktur domestik & ekspor, dengan sistem kendali internal bernama JICOS dan motto "PACKAGE YOUR QUALITY." Website ini diposisikan sebagai Digital Salesman + Corporate Window + 24/7 Business Development Platform bagi customer, engineer, purchasing, Japanese management/holding, investor, dan mitra strategis.

## Tech Stack & Arsitektur

- **Frontend**: Vanilla JavaScript (ES Modules), Vite 8, Modular CSS, i18n bilingual (EN / ID), Static Site Pre-rendering (SSG via `scripts/prerender.js`).
- **Backend & Database**: Node.js, Express 5, MySQL (MySQL2 connection pool), JWT Authentication, Multer, Nodemailer.
- **Kualitas & Performa**: Google PageSpeed Insights 100/100 (Performa, Aksesibilitas WCAG AA, Praktik Terbaik, SEO).
- **Keamanan (Security Hardening)**: Anti Brute-Force Rate Limiting, Strict Upload Whitelist & SVG XSS Sanitizer, HTTP Security Headers, Restricted CORS Policy, Input Bounds & HTML Escaping.

## Cara Menjalankan Lokal

1. **Install Dependensi**:
   ```bash
   npm install
   ```

2. **Konfigurasi Database & Environment**:
   Salin file `.env.example` menjadi `.env` dan sesuaikan koneksi database MySQL:
   ```env
   PORT=3002
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=jri_website
   JWT_SECRET=rahasia-jwt-anda
   ```

3. **Jalankan Backend API & Database Seeder**:
   ```bash
   npm run server
   # Atau untuk inisialisasi data default awal:
   npm run seed
   ```

4. **Jalankan Frontend Dev Server**:
   ```bash
   npm run dev
   # Buka browser di http://localhost:5173
   ```

5. **Build Produksi & Prerender SSG**:
   ```bash
   npm run build
   # Menghasilkan folder dist/ yang siap dideploy ke server web
   ```

## Struktur File Proyek

```
jri-website/
├── .env.example        # Template konfigurasi environment
├── AGENTS.md           # Aturan kerja agen AI untuk pengembangan proyek
├── DECISIONS.md        # Log keputusan teknis & arsitektur proyek
├── PRD.md              # Product Requirements Document (v2.0)
├── README.md           # Dokumentasi utama proyek
├── SECURITY.md         # Dokumentasi hardening & standar keamanan web
├── index.html          # Shell HTML utama dengan optimasi font & SEO
├── scripts/            # Script prerender SSG dan generator sitemap
├── server/             # Backend Express API, MySQL schema, auth & routes
├── src/                # Source code frontend modular (layout, pages, styles)
└── dist/               # Output build statis siap deploy
```
