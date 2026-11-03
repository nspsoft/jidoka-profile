# SECURITY.md — Panduan & Standar Keamanan Sistem
# PT Jidoka Result Indonesia

Dokumen ini mendefinisikan standar keamanan, arsitektur proteksi, hasil hardening sistem, serta prosedur penanganan kerentanan pada aplikasi website PT Jidoka Result Indonesia (Frontend, Backend API, dan Konfigurasi Web Server).

---

## 1. 🛡️ Prinsip Keamanan Sistem (Defense-in-Depth)

Sistem mengadopsi pendekatan *Zero-Trust* dan pertahanan berlapis (*Defense-in-Depth*):
1. **Double-Layer Authorization**: Hak akses diperiksa secara ketat di sisi API Middleware (`requireAuth`), bukan sekadar menyembunyikan tombol di UI.
2. **Strict Whitelisting**: Hanya ekstensi file dan nama koleksi yang terdaftar yang diizinkan untuk diproses oleh server.
3. **Zero Hardcoded Secrets**: Seluruh kredensial database dan JWT secret wajib dikonfigurasi melalui environment variable (`.env`).
4. **Least Privilege**: Endpoint publik hanya diizinkan untuk membaca data yang sudah difilter dan mengirimkan formulir leads yang tervalidasi.

---

## 2. 🧱 Implementasi Hardening (Mitigasi Celah Keamanan)

### A. Autentikasi, Multi-User IAM & Proteksi Akses
- **Multi-Factor Authentication (MFA / 2FA) Google Authenticator**:
  - Arsitektur berbasis standar industri **RFC 6238 (TOTP - Time-Based One-Time Password)** dengan algoritma HMAC-SHA1 dan interval 30 detik (toleransi drift waktu ±30s).
  - Alur login 2-langkah (*Two-Step Challenge*): Password benar -> Server menerbitkan tiket jangka pendek (`mfa_ticket`, kadaluarsa 5 menit) -> Wajib memasukkan 6-digit kode OTP dari aplikasi Google Authenticator sebelum JWT berhak akses penuh diterbitkan.
  - **Rate Limiting Khusus MFA**: Endpoint `/api/auth/mfa/verify-login` dibatasi maksimal **5 percobaan per 10 menit per IP** untuk mencegah serangan brute-force terhadap 6-digit PIN.
  - **Single-Use Emergency Backup Recovery Codes**: Menyediakan 8 kode cadangan sekali pakai (format `XXXX-XXXX`) yang disimpan dalam bentuk hash SHA-256. Setiap penggunaan kode cadangan otomatis menghanguskan kode tersebut dari database agar tidak dapat dipakai ulang.
  - **Proteksi Penonaktifan MFA**: Menonaktifkan MFA wajib menyertakan verifikasi ganda (kata sandi admin + kode 6-digit aktif) untuk mencegah penonaktifan sepihak saat sesi browser tidak sengaja ditinggal terbuka.
- **Multi-User IAM & Granular RBAC**:
  - **Isolasi Penuh Antar-Akun**: Setiap pengguna admin memiliki baris terpisah di database (`admin_users`), dengan secret TOTP, status MFA, password hash (`bcrypt`), dan token sesi mandiri. Aktivasi atau penonaktifan MFA pada staf A tidak berpengaruh ke staf B.
  - **Pembagian Peran Ketat (*Double-Layer RBAC*)**:
    - **Administrator**: Hak akses penuh (kelola konten website, kelola pengguna, inspeksi/ekspor audit log, reset MFA staf, hapus pesan RFQ, impor/reset backup).
    - **Editor**: Khusus kelola konten website (produk, berita, profil). **Dilarang keras dan diblokir di level API** dari melihat/mengekspor jejak audit, menghapus pesan RFQ, mereset database konten, mengimpor backup, atau mengelola pengguna lain.
  - **Safeguard Anti-Self-Deletion & Anti-Orphan**: Sistem memblokir upaya admin menghapus akunnya sendiri, serta mencegah penghapusan jika hanya tersisa satu akun admin di sistem.
  - **Emergency Staff MFA Reset**: Apabila staf atau editor kehilangan ponselnya, SuperAdmin dapat me-reset status MFA akun terkait melalui modul *Kelola Pengguna* di Admin CMS tanpa perlu mengakses database secara manual. Staf kemudian dapat login kembali menggunakan kata sandinya dan menghubungkan ponsel barunya.
- **Anti Brute-Force Rate Limiting**:
  - Endpoint `/api/auth/login` dilindungi dengan pembatas percobaan: **maksimal 10 percobaan gagal per 15 menit per IP address**.
  - Jika ambang batas terlampaui, request otomatis ditolak dengan pesan peringatan dan status HTTP 429 (*Too Many Requests*).
- **Kebijakan Password Kuat**:
  - Endpoint penggantian password (`PATCH /api/auth/password`) mewajibkan **panjang minimal 8 karakter** dan **wajib mengandung kombinasi huruf dan angka**.
- **JWT Stateless Token**:
  - Autentikasi menggunakan JSON Web Token (JWT) dengan masa berlaku 7 hari.
  - Jika variabel `JWT_SECRET` belum diset pada `.env`, server menampilkan peringatan keamanan kritis pada console log saat booting.

### B. Keamanan Unggah File (Upload Security)
- **Strict File Extension Whitelist**:
  - File yang diizinkan untuk diunggah **hanya**: `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.gif`, `.ico`, `.mp4`, `.webm`, `.pdf`, `.docx`, `.xlsx`, `.doc`, `.xls`.
  - Ekstensi berbahaya diblokir secara eksplisit: `.php`, `.phtml`, `.phar`, `.sh`, `.bash`, `.exe`, `.bat`, `.cmd`, `.js`, `.html`, `.htm`, `.pl`, `.cgi`, `.py`.
- **Inspeksi Anti-XSS pada File SVG**:
  - File `.svg` yang diunggah dipindai secara otomatis. Jika ditemukan tag `<script>`, protokol `javascript:`, atau atribut event handler (`onload`, `onerror`), file langsung dihapus dari disk dan request ditolak.
- **Content-Security-Policy (CSP) Sandbox untuk File Unggahan**:
  - Direktori `/uploads` disajikan dengan header:
    `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; media-src 'self'; sandbox`
    Hal ini mencegah file statis di dalam folder uploads mengeksekusi skrip berbahaya di konteks domain utama.

### C. Integritas Data & Sanitasi Input (Anti-Injection)
- **SQL Injection Prevention**:
  - Seluruh query database MySQL di lapisan `server/db.js`, `auth.js`, `content.js`, `leads.js`, `audit.js`, dan `analytics.js` menggunakan *parameterized queries* (placeholder `?`) dari driver `mysql2/promise`.
- **CSV Formula Injection Mitigation (CWE-1236)**:
  - Seluruh ekspor CSV (Audit Log & Laporan Pengunjung) diproteksi menggunakan fungsi `sanitizeCsvCell()`. Sel yang diawali dengan simbol formula spreadsheet (`=`, `+`, `-`, `@`, `\t`, `\r`) otomatis di-prefix dengan tanda petik tunggal (`'`) agar Microsoft Excel atau LibreOffice tidak mengeksekusi rumus berbahaya.
- **Email & HTML Injection Prevention**:
  - Seluruh nilai isian formulir publik (`/api/leads`) dibersihkan melalui fungsi `escHtml()` sebelum disusun ke dalam template email notifikasi.
  - Karakter `<`, `>`, `&`, `"`, dan `'` dikonversi menjadi entitas HTML aman.
- **Payload Flooding & String Cap Safeguards**:
  - Formulir leads dibatasi maksimal 30 field, dengan panjang maksimal 3.000 karakter per teks.
  - Payload jejak audit dibatasi maksimal 50.000 karakter untuk mencegah serangan Denial of Service (DoS) memory/disk.
- **Collection Name Whitelisting**:
  - Endpoint konten `/api/content/:collection` hanya menerima 14 nama koleksi resmi CMS (`company`, `products`, `pillars`, `why`, `industries`, `tour`, `news`, `way`, `certs`, `mach`, `caps`, `gov`, `hist`, `resources`) untuk mencegah pencemaran tabel database.

### D. Header Keamanan HTTP & Kebijakan CORS
- **Trust Proxy Configuration**:
  - Backend mengaktifkan `app.set('trust proxy', 1)` agar IP address asli pengunjung dari reverse proxy Nginx di aaPanel/VPS terbaca presisi oleh sistem rate limiting dan jejak audit.
- **Strict Hostname CORS Validation**:
  - Permintaan lintas domain (CORS) divalidasi secara ketat menggunakan parser URL (`new URL(origin).hostname`). Hanya domain resmi (`jidoka.co.id`, `*.jidoka.co.id`), `localhost`, dan domain yang terdaftar di `CORS_ORIGIN` yang diizinkan. Upaya pemalsuan domain (*domain infix spoofing* seperti `jidoka.co.id.attacker.com`) otomatis ditolak.
- **HTTP Security Headers**:
  - `X-Content-Type-Options: nosniff`: Mencegah browser melakukan MIME-sniffing.
  - `X-Frame-Options: SAMEORIGIN`: Melindungi website dari serangan *Clickjacking*.
  - `X-XSS-Protection: 1; mode=block`: Mengaktifkan filter XSS bawaan browser lawas.
  - `Referrer-Policy: strict-origin-when-cross-origin`: Melindungi data path URL referer.
- **Fingerprint Suppression**:
  - Header `X-Powered-By: Express` dinonaktifkan (`app.disable('x-powered-by')`) agar penyerang tidak dapat mendeteksi teknologi backend yang digunakan.

### E. Jejak Audit & Privasi Pengunjung (Compliance & Privacy)
- **Immutable Audit Trail (`audit_logs`)**:
  - Seluruh mutasi kritis (Login/Logout, MFA Setup/Disable, Reset MFA, User CRUD, Content Updates, RFQ Changes, Uploads) dicatat dengan metadata lengkap: `user_id`, `user_email`, `user_name`, `role`, `action`, `entity_type`, `entity_id`, payload diff/details (JSON), IP Address asli (`x-forwarded-for`), User-Agent, dan timestamp.
  - Log audit bersifat *append-only* (tidak disediakan endpoint edit/manipulasi log dari CMS).
- **Privacy-Preserving Visitor Analytics (`visitor_pageviews`)**:
  - Mengadopsi standar kepatuhan UU PDP & GDPR: Bebas dari cookie pihak ketiga yang memberatkan browser pengunjung.
  - Pengunjung unik dihitung secara aman menggunakan *Daily Anonymized Hash* (`SHA-256(IP + UA + Salt + Date)`). IP address asli pengunjung tidak disimpan mentah pada tabel analitik.
  - Bot dan web crawler mesin pencari otomatis difilter sehingga metrik laporan 100% mencerminkan pengunjung manusia asli.

---

## 3. ⚙️ Konfigurasi Hardening Server Nginx (aaPanel / VPS)

Untuk menjamin file source code, git repository, dan kredensial database **tidak bocor ke publik**, konfigurasi Nginx pada server produksi wajib menyertakan aturan berikut:

```nginx
# 1. Sembunyikan versi Nginx
server_tokens off;

# 2. Blokir akses publik ke file konfigurasi & repository (.env, .git, package.json, dll)
location ~ ^/(\.user.ini|\.htaccess|\.git|\.env|\.svn|\.project|LICENSE|README.md|package\.json|package-lock\.json) {
    return 404;
}

# 3. Blokir akses langsung ke folder backend server
location ^~ /server/ {
    return 404;
}

# 4. Cache file statis dengan aman
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp4|webm)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
    access_log off;
}
```

---

## 4. 📋 Checklist Verifikasi Keamanan Rutin

Lakukan checklist berikut secara berkala atau sebelum merilis fitur baru:

- [x] Endpoint login memiliki batasan percobaan gagal (Rate Limit).
- [x] Password akun admin menggunakan kombinasi yang kuat (min. 8 karakter, huruf + angka).
- [x] File `.env` tidak pernah di-commit ke Git (`.gitignore` aktif).
- [x] Upload file hanya menerima format dokumen resmi yang diizinkan.
- [x] Header keamanan aktif pada response HTTP.
- [x] Seluruh input formulir publik di-sanitize dan dibatasi ukurannya.
- [x] Endpoint `/api/health` merespons status `ok` untuk health check monitoring.
- [x] Akses browser ke `https://jidoka.co.id/.env` menghasilkan error **404 Not Found**.
