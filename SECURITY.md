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

### A. Autentikasi & Proteksi Akses (IAM)
- **Multi-Factor Authentication (MFA / 2FA) Google Authenticator**:
  - Arsitektur berbasis standar industri **RFC 6238 (TOTP - Time-Based One-Time Password)** dengan algoritma HMAC-SHA1 dan interval 30 detik (toleransi drift waktu ±30s).
  - Alur login 2-langkah (*Two-Step Challenge*): Password benar -> Server menerbitkan tiket jangka pendek (`mfa_ticket`, kadaluarsa 5 menit) -> Wajib memasukkan 6-digit kode OTP dari aplikasi Google Authenticator sebelum JWT berhak akses penuh diterbitkan.
  - **Rate Limiting Khusus MFA**: Endpoint `/api/auth/mfa/verify-login` dibatasi maksimal **5 percobaan per 10 menit per IP** untuk mencegah serangan brute-force terhadap 6-digit PIN.
  - **Single-Use Emergency Backup Recovery Codes**: Menyediakan 8 kode cadangan sekali pakai (format `XXXX-XXXX`) yang disimpan dalam bentuk hash SHA-256. Setiap penggunaan kode cadangan otomatis menghanguskan kode tersebut dari database agar tidak dapat dipakai ulang.
  - **Proteksi Penonaktifan MFA**: Menonaktifkan MFA wajib menyertakan verifikasi ganda (kata sandi admin + kode 6-digit aktif) untuk mencegah penonaktifan sepihak saat sesi browser tidak sengaja ditinggal terbuka.
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
  - Seluruh query database MySQL di lapisan `server/db.js`, `auth.js`, `content.js`, dan `leads.js` menggunakan *parameterized queries* (placeholder `?`) dari driver `mysql2/promise`.
- **Email & HTML Injection Prevention**:
  - Seluruh nilai isian formulir publik (`/api/leads`) dibersihkan melalui fungsi `escHtml()` sebelum disusun ke dalam template email notifikasi.
  - Karakter `<`, `>`, `&`, `"`, dan `'` dikonversi menjadi entitas HTML aman.
- **Payload Flooding / DOS Protection**:
  - Formulir leads dibatasi maksimal 30 field, dengan panjang maksimal 3.000 karakter per teks.
- **Collection Name Whitelisting**:
  - Endpoint konten `/api/content/:collection` hanya menerima 14 nama koleksi resmi CMS (`company`, `products`, `pillars`, `why`, `industries`, `tour`, `news`, `way`, `certs`, `mach`, `caps`, `gov`, `hist`, `resources`) untuk mencegah pencemaran tabel database.

### D. Header Keamanan HTTP & Kebijakan CORS
- **HTTP Security Headers**:
  - `X-Content-Type-Options: nosniff`: Mencegah browser melakukan MIME-sniffing.
  - `X-Frame-Options: SAMEORIGIN`: Melindungi website dari serangan *Clickjacking*.
  - `X-XSS-Protection: 1; mode=block`: Mengaktifkan filter XSS bawaan browser lawas.
  - `Referrer-Policy: strict-origin-when-cross-origin`: Melindungi data path URL referer.
- **Fingerprint Suppression**:
  - Header `X-Powered-By: Express` dinonaktifkan (`app.disable('x-powered-by')`) agar penyerang tidak dapat mendeteksi teknologi backend yang digunakan.
- **Restricted CORS**:
  - Permintaan lintas domain (CORS) dibatasi hanya untuk domain resmi (`jidoka.co.id`, `https://jidoka.co.id`) serta lingkungan dev lokal yang sah.

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
