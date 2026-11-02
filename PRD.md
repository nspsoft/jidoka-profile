PRD v2.0 — Website PT Jidoka Result Indonesia
Fase Pengembangan Lokal (Lanjutan dari Konsep REV-6)
Dokumen turunan dari PRD asli "Website Perusahaan PT Jidoka Result Indonesia" v1.0(Draft, 9 September 2026). Dokumen ini fokus pada kelanjutan pengembangan secaralokal di IDE agentic (Antigravity). Baca seluruh dokumen sebelum menulis kode.

1. Konteks Proyek & Status Saat Ini (Baseline)
1.1 Ringkasan bisnis
PT Jidoka Result Indonesia ("Jidoka"/"JRI") adalah produsen solusi packaging industri —karton box, imprabox, partition, custom packaging, serta PE sheet & film — untukindustri manufaktur domestik & ekspor, dengan sistem kendali internal bernama JICOSdan motto "PACKAGE YOUR QUALITY."

Website diposisikan sebagai Digital Salesman + Corporate Window + 24/7 BusinessDevelopment Platform — bukan sekadar company profile. Target pengguna:Customer/Buyer, Engineer, Purchasing, Japanese Management/Holding, Investor,Strategic Partner, Job Seeker (fase berikutnya).

1.2 Baseline implementasi (sudah ada — "REV-6")
Implementasi saat ini adalah satu file index.html mandiri (tanpa build tools,tanpa dependensi, tanpa backend) yang berisi:

SPA hash-router (#/home, #/products, #/product/:id, #/application,#/manufacturing, #/quality, #/way, #/corporate, #/partnership/:tab,#/resources, #/contact/:tab, #/admin/:tab).
Halaman lengkap:
Home: hero full-screen video background (src dari data company.video,fallback otomatis ke animasi SVG blueprint bila video gagal), headline"PACKAGE YOUR QUALITY.", CTA RFQ + Digital Factory Tour, 4 pilar, kapabilitas,why us, mini factory tour, industri, our way (4 chip), berita, CTA band.
Products: katalog + search real-time + filter kategori (all/corrugated/pp/custom/film) + halaman detail produk teknis (Material, Specification,Manufacturing Capability, Application, Quality) + prev/next + sidebar RFQ.
Application: 4 industri (Automotive, Steel, Industrial, Packaging) dengankasus tipikal + produk terkait.
Manufacturing: Digital Factory Tour 5 langkah (Raw Material → Production →QC → Warehouse → Delivery) interaktif, diagram "From Factory to Business",daftar mesin, panel demo JICOS.
Quality: 3 stage inspeksi, sertifikasi, PDCA, delivery commitment.
Our Way: 7 prinsip (Kaizen, 5S, Jidoka, Heijunka, Standardization, Safety,People Development) dengan kanji.
Corporate: profil, business overview, history timeline, management,sustainability, governance.
Partnership: 4 tab (Customer, Supplier, Strategic Partner, Investor/Holdingdengan chart + strategy cards).
Resources: pusat dokumen download.
Contact: 3 jalur form — Structured RFQ (product/width/length/thickness/qty/application/target delivery + data perusahaan), Product Inquiry,Corporate Inquiry. Validasi + honeypot + captcha aritmetika sederhana.
CMS Admin di #/admin (password default jidoka2026, sesi sessionStorage):CRUD Produk, Berita, Kapabilitas (4 statistik), Resources, data Perusahaan(telepon, email, alamat, jam, URL video hero), Backup/Restore JSON.Persistensi via localStorage (jri-db-v1).
i18n EN/ID dengan toggle di header; seluruh konten berupa objek {en, id}.
Design tokens (CSS variables): navy #0e2350, red #d71920,gold #b3925a, ink #1b2436, mut #5a6478, bg #f5f7fa, line #e2e7ef.Font: Barlow (400–800), Barlow Condensed (600–700), Noto Sans JP (700).
Header: logo kiri, 10 menu, toggle EN/ID di kanan; tanpa tombol CTA di header.Mode burger untuk lebar ≤1360px (EN/ID + burger dipaku tepi kanan).
Ikon: SVG inline; ilustrasi produk: SVG generatif (roll/box/part/sheet/cust).
Tahan sandbox: semua akses localStorage/sessionStorage dibungkus try/catch.
1.3 Keterbatasan baseline (alasan fase ini)
Satu file besar → sulit dirawat, versioning, dan kolaborasi.
CMS hanya persisten di browser lokal → tidak bisa multi-user / lintas perangkat.
Form tidak mengirim email / menyimpan lead ke database.
SEO/AEO terbatas (SPA hash-routing, meta statis).
Aset nyata belum ada (foto/video pabrik, angka kapabilitas final, nama produkfinal, sertifikat) — masih placeholder sesuai PRD asli §15.
2. Tujuan Fase Ini (Goals)
Migrasi proyek dari satu file ke struktur proyek modern (Vite) tanpamengubah fitur & tampilan (visual parity penuh).
Backend CMS & Lead Capture: konten CMS persisten di database + form RFQ/Inquiry menyimpan lead & mengirim notifikasi email.
SEO/AEO: route & meta per halaman, sitemap, JSON-LD, konten terbaca mesinpencari & AI answer engine (PRD asli §11.1).
Kualitas & performa: responsif penuh, Lighthouse baik, aksesibilitas dasar.
Persiapan produksi: konfigurasi deploy, environment variables, dokumentasi.
Non-goal (di luar fase ini): e-commerce/pembayaran, halaman karier penuh,terjemahan bahasa Jepang penuh (cukup JP-tone), aplikasi mobile.

3. Prinsip Kerja untuk AI Agent (WAJIB dibaca)
Jangan merusak yang sudah jalan. Semua fitur baseline §1.2 harus tetapberfungsi setelah setiap perubahan. Sebelum commit, jalankan Smoke TestChecklist (Bagian 8).
Visual parity: warna, font, spacing, dan copy tidak boleh berubah kecualidiminta eksplisit. Design tokens ada di Bagian 1.2 — pertahankan sebagaiCSS variables.
i18n pattern: konten dua bahasa selalu objek { en: "...", id: "..." }dengan helper L(obj). Jangan hardcode satu bahasa.
Keamanan: escape HTML (esc()) untuk semua data dinamis; pertahankanhoneypot + captcha; jangan pernah commit secret (gunakan .env).
Storage-safe: akses storage selalu dibungkus try/catch (kompatibilitasiframe/sandbox).
Satu tugas = satu commit. Pecah pekerjaan per item backlog; commit setelahacceptance criteria item tersebut terpenuhi.
Tanpa framework besar tanpa persetujuan — vanilla JS + Vite. Jika suatukebutuhan jelas lebih baik dengan library kecil (mis. chart), tanyakan dulu.
Kompatibilitas data: struktur JSON CMS baseline (Bagian 5) adalah kontrak.Migrasi DB harus bisa mengimpor file backup JSON REV-6 tanpa kehilangan data.
Dokumentasikan keputusan di DECISIONS.md (satu baris per keputusan).
Jika ada asumsi penting atau informasi kurang, berhenti dan tanyakan —jangan mengarang angka/nama/alamat (data bisnis nyata disediakan manusia).
4. Tech Stack & Struktur Folder Target
4.1 Stack
Build: Vite (vanilla JS, tanpa framework UI).
Bahasa: HTML + CSS (vanilla, variables) + JavaScript (ES modules).
Font/ikon: tetap Google Fonts + SVG inline (tidak menambah dependensi).
Backend fase 2: salah satu (pilih saat M2 mulai, konfirmasi ke user):
Opsi A (direkomendasikan): Supabase (Postgres + Auth + Storage + EdgeFunctions) — tercepat untuk CMS + auth + file.
Opsi B: Node/Express + SQLite + Nodemailer (self-host).
Deploy target: Netlify atau Vercel (statis + functions), domain final menyusul.
4.2 Struktur folder target (setelah M1)
jri-website/├─ PRD.md                 ← dokumen ini├─ AGENTS.md              ← ringkasan aturan agent (Bagian 3)├─ DECISIONS.md├─ .env.example           ← SUPABASE_URL, SUPABASE_ANON_KEY, dsb.├─ index.html├─ public/│  ├─ factory.mp4         ← video hero (placeholder boleh kosong)│  ├─ robots.txt│  └─ sitemap.xml         ← digenerate di M3└─ src/   ├─ main.js             ← bootstrap + router   ├─ router.js   ├─ i18n.js             ← helper L(), LANG, persist EN/ID   ├─ data/   │  ├─ defaults/        ← default data (produk, berita, caps, resources, co)   │  └─ db.js            ← lapisan data: localStorage dulu, kemudian Supabase   ├─ layout/   │  ├─ header.js  footer.js  mobilemenu.js   ├─ pages/   │  ├─ home.js  products.js  product.js  application.js   │  ├─ manufacturing.js  quality.js  way.js  corporate.js   │  ├─ partnership.js  resources.js  contact.js  admin.js   ├─ components/         ← ctaBand, blueprint, productArt, forms, toast, dst.   ├─ styles/   │  ├─ tokens.css  base.css  header.css  pages.css  admin.css   └─ assets/             ← svg/logo, ikon
4.3 Perintah dasar
npm run dev → dev server (HMR) untuk vibe coding.
npm run build → build produksi ke dist/.
npm run preview → pratinjau hasil build.
5. Data Model (Kontrak — jangan ubah bentuk)
Semua koleksi mengikuti bentuk yang sudah ada di baseline (penting agar backupJSON REV-6 bisa diimpor). Ringkasan:

// products[]{  "id": "karton-box",              // slug, unik  "art": "box",                    // roll | box | part | sheet | cust  "cat": { "en": "Corrugated", "id": "Korugasi" },  "name": "Karton Box",  "lead": { "en": "...", "id": "..." },  "material": "Corrugated cardboard — B / C / E / BC flute",  "spec":    [ ["Flute", "B / C / E / BC"], ... ],     // pasangan [label, nilai]  "mfg":     [ ["Machine", "..."], ... ],  "apps":    [ "Automotive parts packaging", ... ],    // array string  "quality": [ ["Inspection", "..."], ... ]}// news[]  { date, cat:{en,id}, t:{en,id}, d:{en,id} }// caps    { stats: [ [nilai, suffix, {en,id}], ×4 ], note:{en,id} }// resources[] { i:"building|file|award|factory", name:{en,id}, d:{en,id}, meta, size }// company { phone, sales, corp, addr, hours, video }  // video: "factory.mp4" atau URL, koma = fallback berurutan// settings { password }   // sementara; diganti Auth server di M2
Tabel backend (M2) — mapping 1:1: products, news, site_settings(key/value JSON), resources, company (single row), plus baru:leads (id, type 'rfq'|'product'|'corporate', payload JSONB, created_at,status 'new'|'handled'), admin_users (via Supabase Auth).

API minimum (M2) — REST/RPC:

GET /content/:collection (publik), POST/PATCH/DELETE /content/:collection/:id(admin), POST /leads (publik, rate-limited, honeypot+captcha),GET /leads (admin), PATCH /leads/:id (admin), upload file → Storage(/resources, /media), notifikasi email saat POST /leads.
6. Milestone & Backlog (urutan pengerjaan)
M0 — Inisialisasi repo (½ hari)
Tugas: buat folder, git init, simpan PRD.md + AGENTS.md, masukkanindex.html REV-6 sebagai baseline, commit.AC: repo berjalan; file baseline ter-commit; README.md berisi cara run.

M1 — Migrasi ke Vite, modularisasi (1–2 hari) ⚠️ paling kritis
Tugas: setup Vite; pindahkan struktur sesuai §4.2; pecah CSS per file;pecah JS per modul; router & i18n jadi modul; pertahankan hash-router dulu.AC (semua wajib):

 npm run dev & npm run build sukses tanpa error.
 Visual parity: semua halaman identik dengan baseline (screenshot compare).
 Smoke Test Checklist (Bagian 8) lolos 100%.
 Ukuran bundle awal tidak membengkak (tidak ada dependensi runtime baru).
 Video hero + fallback blueprint tetap bekerja.
M2 — Backend CMS + Lead capture (2–4 hari)
Tugas: pilih Supabase (konfirmasi ke user); skema tabel §5; lapisan data/db.jsabstrak (local ↔ remote); Auth admin (email/password, role admin); CRUD viabackend; tab baru CMS: Inbox (daftar lead, detail, tandai handled);form RFQ/Inquiry → POST /leads + email notifikasi (sales untuk rfq/product,corporate.dev untuk corporate); upload file resources ke Storage; rate limit +honeypot + captcha tetap.AC:

 Perubahan CMS tersimpan permanen (tahan refresh, terlihat dari device lain).
 Import backup JSON REV-6 berhasil tanpa data hilang.
 Submit RFQ → baris muncul di Inbox + email masuk (cek spam-safe templating).
 Tanpa login, endpoint tulis menolak (401/403).
 Password lama & sessionStorage dihapus; hanya Auth server.
M3 — SEO / AEO & Meta per halaman (1–2 hari)
Tugas: title/description per route (EN/ID); Open Graph; canonical; sitemap.xmldinamis; robots.txt; JSON-LD Organization + Product + BreadcrumbList; strukturheading semantik; alt text; preload font; opsi prerender route utama agar HTMLstatis terbaca crawler/AI.AC:

 Setiap halaman punya unique title & description.
 sitemap.xml berisi semua route; JSON-LD valid (Rich Results test).
 "View source" menampilkan konten inti halaman (prerender atau SSG).
 Lighthouse SEO ≥ 90; Performa ≥ 85 (desktop).
M4 — Polish & produksi (1–2 hari)
Tugas: error page 404; loading state; gambar/foto pabrik nyata (dari user) +lazy-load; video hero versi web-optimized (≤8MB, H.264); favicon set lengkap;konfigurasi deploy (Netlify/Vercel) + preview URL; checklist UAT.AC: deploy sukses, Lighthouse ≥ 90/90, UAT checklist ditandatangani user.

Backlog menunggu keputusan (jangan kerjakan tanpa konfirmasi)
Halaman Karier/Job portal (PRD asli §15 item terakhir).
Terjemahan JP penuh (buat lang: 'jp' di i18n bila disetujui).
Analytics (GA4/Plausible) + tracking konversi RFQ (PRD §11.6).
Multi-user CMS dengan peran (editor vs admin).
7. Non-Fungsional & Spesifikasi Keamanan (Enterprise Security Baseline)
7.1 Performa & Aksesibilitas:
Responsif penuh (desktop/tablet/mobile), cepat walau banyak foto/video.
SEO & AEO: arsitektur konten logis: siapa → produk → capability → industry → location → quality → contact.
Anti-spam semua form (honeypot + rate limit); notifikasi sesuai jenis form.
Multi-bahasa EN/ID; JP-tone untuk bagian tertentu.
Kepatuhan aksesibilitas WCAG AA (kontras rasio ≥ 4.5:1, focus-visible, prefers-reduced-motion, valid heading-order). Skor target: 100/100 di PageSpeed Insights.

7.2 Keamanan & Hardening (Zero-Trust Backend):
- Jejak Audit (Audit Trail & Activity Log): Pencatatan kronologis seluruh operasi autentikasi (login/logout, tantangan/verifikasi MFA), manajemen pengguna (tambah, edit, hapus, reset MFA), perubahan konten website (produk, profil, berita, dokumen), update status RFQ leads, dan unggahan file ke tabel `audit_logs`. Dilengkapi filter kategori, pencarian teks, detail JSON, dan ekspor CSV.
- Laporan Pengunjung Web (Web Visitor Analytics): Sistem pelacakan analitik pengunjung website mandiri tanpa cookies pihak ketiga (menggunakan Daily Anonymized Hash SHA-256), non-blocking via `sendBeacon`, memfilter bot crawler secara otomatis, dan menyajikan visualisasi grafik tren kunjungan SVG, peringkat produk/halaman terpopuler, distribusi perangkat/browser, serta rasio konversi ke leads RFQ.
- Multi-User IAM & Manajemen Akun: Dukungan multi-akun admin dengan peran granular (`admin`, `editor`), isolasi kredensial & MFA per user di tabel `admin_users`, perlindungan anti-self-deletion & anti-orphan admin, serta emergency MFA reset oleh SuperAdmin jika HP staf hilang/rusak.
- Multi-Factor Authentication (MFA Google Authenticator): Otentikasi dua langkah berbasis RFC 6238 TOTP (HMAC-SHA1, 30s period, ±30s drift window) pada login Admin CMS. Dilengkapi rate limiter verifikasi (maks 5x per 10 menit), 8 emergency backup codes sekali pakai (SHA-256 hashed), dan proteksi verifikasi ganda saat penonaktifan.
- Rate Limiting Anti-Brute Force: Pembatasan ketat percobaan login pada /api/auth/login (maks 10x per 15 menit per IP) dan pengiriman form leads pada /api/leads (maks 15x per 15 menit per IP).
- Proteksi Upload & Sandbox: Endpoint /api/upload wajib menerapkan whitelist ekstensi ketat (.png, .jpg, .jpeg, .webp, .svg, .gif, .ico, .mp4, .webm, .pdf, .docx, .xlsx) dan blokir file script/executable. File .svg wajib diinspeksi anti-XSS. Header static file /uploads diatur CSP sandbox (default-src 'none') dan nosniff.
- Sanitasi Input & Email Injection: Seluruh input publik wajib di-sanitize via escHtml() sebelum dibuatkan email notifikasi, serta pembatasan batas payload (maks 30 field, maks 3000 karakter per teks).
- Database & Collection Whitelist: Endpoint /api/content/:collection hanya menerima 14 koleksi valid untuk mencegah table bloat/pollution.
- HTTP Security Headers & CORS: Menggunakan header X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, Referrer-Policy: strict-origin-when-cross-origin, mematikan header X-Powered-By, dan CORS dibatasi ke domain resmi jidoka.co.id & localhost.
- Web Server Hardening (Nginx): Memblokir akses publik ke file kredensial .env, .git, package.json, dan direktori server/ via response HTTP 404, serta menonaktifkan server_tokens.

7.3 Spesifikasi Baseline PRD asli §11:
Responsif penuh (desktop/tablet/mobile), cepat walau banyak foto/video.
SEO & AEO: arsitektur konten logis: siapa → produk → capability → industry →location → quality → contact.
Anti-spam semua form; notifikasi sesuai jenis form.
Multi-bahasa EN/ID; JP-tone untuk bagian tertentu.
Kepatuhan aksesibilitas dasar: kontras, focus-visible, prefers-reduced-motion.
8. Smoke Test Checklist (regression — jalankan sebelum tiap commit)
Home: hero tampil (video atau fallback), semua section render, CTA bekerja.
Header: menu aktif benar; EN/ID toggle mengubah seluruh teks; ≤1360px burgermuncul & membuka drawer; tidak ada tombol CTA di header.
Products: 5+ produk render; search "steel" memfilter; filter kategori bekerja;klik kartu → detail.
Product detail: tabel spec/mfg/quality render; tombol RFQ membawa product id;prev/next bekerja.
Application: 4 industri; link produk terkait valid.
Manufacturing: klik 5 langkah tour mengubah panel; prev/next; JICOS panel animasi.
Contact: 3 tab form; validasi wajib; captcha salah → error; submit → kartusukses dengan nomor referensi; (M2+) lead muncul di Inbox.
Admin: login; CRUD produk baru → langsung muncul di katalog & dropdown & RFQ;edit berita; ubah kapabilitas; backup JSON → reset → import → data kembali.
Footer: link internal valid; data kontak dari CMS.
Mobile 390px: tidak ada overflow horizontal; hero headline tidak terpotong;form nyaman diisi.
9. Data & Aset yang Harus Disediakan User (bloker produksi — PRD asli §15)
Foto/video asli pabrik (produksi, gudang, QC, delivery) + video hero final.
Angka kapabilitas final (MT/bulan, mesin, warehouse, jumlah customer, tahun).
Nama & jumlah produk final (mengganti placeholder).
Dokumen korporat (company profile PDF, sertifikat, katalog).
Nama/struktur manajemen; level keterbukaan info Investor/Holding (NDA?).
Kontak resmi (telepon, email domain).
Kebutuhan halaman Karier & bahasa Jepang penuh (ya/tidak).
10. Cara Pakai Dokumen Ini di Antigravity
Taruh PRD.md + AGENTS.md (di bawah) di root folder, buka folder di Antigravity.
Mulai tiap sesi dengan prompt: "Baca PRD.md dan AGENTS.md. Kerjakan M1 tugas1 saja. Tampilkan rencana singkat sebelum menulis kode."
Satu milestone/tugas per sesi; setelah AC terpenuhi → commit → lanjut.
Jika agent mengusulkan library/baru: wajib konfirmasi dulu (aturan §3.7).
