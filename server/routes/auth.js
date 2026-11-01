import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { getPool } from '../db.js';
import { requireAuth, JWT_SECRET } from '../middleware/auth.js';
import {
  generateSecret,
  generateTOTP,
  verifyTOTP,
  generateBackupCodes,
  verifyBackupCode,
  generateOtpAuthUri
} from '../utils/totp.js';

let QRCode = null;
try {
  const qrMod = await import('qrcode');
  QRCode = qrMod.default || qrMod;
} catch (e) {
  console.warn('ℹ️ [AUTH] Package "qrcode" belum terinstall di server. Setup MFA akan menggunakan fallback kunci manual sampai "npm install" dijalankan.');
}

const router = express.Router();

// Anti Brute-Force Rate Limiter for Login: Max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login gagal dari IP ini. Silakan tunggu 15 menit sebelum mencoba kembali.'
  }
});

// Rate Limiter for MFA code verifications: Max 5 attempts per 10 minutes per IP
const mfaLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan kode verifikasi yang salah. Silakan coba lagi setelah 10 menit.'
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE email = ? LIMIT 1', [email.trim().toLowerCase()]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    // Step 2 Challenge: If user has MFA enabled, issue temporary short-lived ticket
    if (user.mfa_enabled) {
      const mfaTicket = jwt.sign(
        { id: user.id, email: user.email, scope: 'mfa_pending' },
        JWT_SECRET,
        { expiresIn: '5m' }
      );

      return res.json({
        success: true,
        mfa_required: true,
        mfa_ticket: mfaTicket,
        message: 'Masukkan 6 digit kode dari Google Authenticator'
      });
    }

    // Normal direct login if MFA is not enabled yet
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name || 'Admin', role: user.role || 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name || 'Admin',
        email: user.email,
        role: user.role || 'admin',
        mfa_enabled: false
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/auth/mfa/verify-login
router.post('/mfa/verify-login', mfaLimiter, async (req, res) => {
  try {
    const { mfa_ticket, code, is_backup } = req.body || {};
    if (!mfa_ticket || !code) {
      return res.status(400).json({ success: false, message: 'Ticket dan kode verifikasi wajib diisi' });
    }

    let decoded;
    try {
      decoded = jwt.verify(mfa_ticket, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Sesi verifikasi kadaluarsa. Silakan login kembali.' });
    }

    if (decoded.scope !== 'mfa_pending') {
      return res.status(401).json({ success: false, message: 'Token verifikasi tidak valid' });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE id = ? LIMIT 1', [decoded.id]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Akun admin tidak ditemukan' });
    }

    const user = rows[0];

    // Skenario A: Kode Cadangan Darurat (Backup Code)
    if (is_backup) {
      let storedHashes = [];
      try {
        storedHashes = JSON.parse(user.backup_codes || '[]');
      } catch (e) {}

      const check = verifyBackupCode(code, storedHashes);
      if (!check.valid) {
        return res.status(401).json({ success: false, message: 'Kode cadangan tidak valid atau sudah pernah digunakan' });
      }

      // Update daftar kode cadangan yang tersisa
      await pool.query('UPDATE admin_users SET backup_codes = ? WHERE id = ?', [JSON.stringify(check.remaining), user.id]);

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name || 'Admin', role: user.role || 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name || 'Admin',
          email: user.email,
          role: user.role || 'admin',
          mfa_enabled: true
        },
        message: `Berhasil login dengan kode cadangan darurat. Sisa kode cadangan: ${check.remaining.length}`
      });
    }

    // Skenario B: Kode 6-Digit Google Authenticator (TOTP)
    const isValid = verifyTOTP(code, user.totp_secret);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Kode 6 digit Google Authenticator salah atau kedaluwarsa' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name || 'Admin', role: user.role || 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name || 'Admin',
        email: user.email,
        role: user.role || 'admin',
        mfa_enabled: true
      }
    });
  } catch (err) {
    console.error('MFA verify login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/auth/mfa/status
router.get('/mfa/status', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT mfa_enabled, backup_codes FROM admin_users WHERE id = ?', [req.user.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    const user = rows[0];
    let backupCount = 0;
    try {
      backupCount = JSON.parse(user.backup_codes || '[]').length;
    } catch (e) {}

    res.json({
      success: true,
      mfa_enabled: !!user.mfa_enabled,
      backup_codes_remaining: backupCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/mfa/setup
router.post('/mfa/setup', requireAuth, async (req, res) => {
  try {
    const secret = generateSecret(20);
    const pool = getPool();
    await pool.query('UPDATE admin_users SET totp_temp_secret = ? WHERE id = ?', [secret, req.user.id]);

    const otpauthUri = generateOtpAuthUri({
      secret,
      email: req.user.email,
      issuer: 'PT Jidoka Result Indonesia'
    });

    let qrSvg = '';
    if (QRCode && typeof QRCode.toString === 'function') {
      qrSvg = await QRCode.toString(otpauthUri, {
        type: 'svg',
        margin: 2,
        color: { dark: '#16336e', light: '#ffffff' }
      });
    } else {
      qrSvg = '<div style="padding:24px 12px;background:#f8fafc;border:1px dashed var(--bdr);border-radius:8px;font-size:12px;color:var(--navy);text-align:center"><b>Gunakan Kunci Rahasia Manual di Bawah</b><br><span style="color:var(--mut);font-size:11px">Salin kunci manual untuk menambah akun di Google Authenticator.</span></div>';
    }

    res.json({
      success: true,
      secret,
      otpauthUri,
      qrSvg
    });
  } catch (err) {
    console.error('MFA setup error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/mfa/verify-setup
router.post('/mfa/verify-setup', requireAuth, async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) {
      return res.status(400).json({ success: false, message: 'Kode 6 digit wajib diisi' });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT totp_temp_secret FROM admin_users WHERE id = ?', [req.user.id]);
    if (!rows || rows.length === 0 || !rows[0].totp_temp_secret) {
      return res.status(400).json({ success: false, message: 'Silakan mulai proses setup terlebih dahulu' });
    }

    const tempSecret = rows[0].totp_temp_secret;
    const isValid = verifyTOTP(code, tempSecret);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Kode 6 digit tidak sesuai. Pastikan jam di ponsel Anda akurat.' });
    }

    // Generate 8 emergency recovery codes
    const { plain, hashed } = generateBackupCodes(8);

    await pool.query(
      'UPDATE admin_users SET mfa_enabled = 1, totp_secret = ?, totp_temp_secret = NULL, backup_codes = ? WHERE id = ?',
      [tempSecret, JSON.stringify(hashed), req.user.id]
    );

    res.json({
      success: true,
      message: 'Google Authenticator MFA berhasil diaktifkan',
      backupCodes: plain
    });
  } catch (err) {
    console.error('MFA verify setup error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/mfa/disable
router.post('/mfa/disable', requireAuth, async (req, res) => {
  try {
    const { password, code } = req.body || {};
    if (!password || !code) {
      return res.status(400).json({ success: false, message: 'Password dan kode 6 digit MFA wajib diisi' });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE id = ?', [req.user.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const user = rows[0];
    const pwMatch = await bcrypt.compare(password, user.password_hash);
    if (!pwMatch) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    const codeMatch = verifyTOTP(code, user.totp_secret);
    if (!codeMatch) {
      return res.status(401).json({ success: false, message: 'Kode Google Authenticator tidak valid' });
    }

    await pool.query(
      'UPDATE admin_users SET mfa_enabled = 0, totp_secret = NULL, totp_temp_secret = NULL, backup_codes = NULL WHERE id = ?',
      [req.user.id]
    );

    res.json({ success: true, message: 'Google Authenticator MFA berhasil dinonaktifkan' });
  } catch (err) {
    console.error('MFA disable error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/mfa/backup-codes
router.post('/mfa/backup-codes', requireAuth, async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ success: false, message: 'Konfirmasi password wajib diisi' });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE id = ?', [req.user.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const user = rows[0];
    if (!user.mfa_enabled) {
      return res.status(400).json({ success: false, message: 'MFA belum diaktifkan pada akun ini' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    const { plain, hashed } = generateBackupCodes(8);
    await pool.query('UPDATE admin_users SET backup_codes = ? WHERE id = ?', [JSON.stringify(hashed), user.id]);

    res.json({
      success: true,
      message: 'Kode cadangan baru berhasil dibuat',
      backupCodes: plain
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

// PATCH /api/auth/password
router.patch('/password', requireAuth, async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });
    }
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password harus mengandung kombinasi huruf dan angka' });
    }

    const hash = await bcrypt.hash(password, 10);
    const pool = getPool();
    await pool.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);

    res.json({ success: true, message: 'Password berhasil diperbarui' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==========================================
// USER MANAGEMENT & MULTI-USER IAM
// ==========================================

// GET /api/auth/users
router.get('/users', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, name, email, role, mfa_enabled, created_at FROM admin_users ORDER BY id ASC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/auth/users
router.post('/users', requireAuth, async (req, res) => {
  try {
    if (req.user.role && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Hanya Administrator yang memiliki wewenang menambah pengguna' });
    }

    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan kata sandi wajib diisi' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid' });
    }

    if (password.length < 8 || !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return res.status(400).json({ success: false, message: 'Kata sandi minimal 8 karakter dan mengandung kombinasi huruf serta angka' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM admin_users WHERE email = ? LIMIT 1', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar untuk pengguna lain' });
    }

    const hash = await bcrypt.hash(password, 10);
    const userRole = role === 'editor' ? 'editor' : 'admin';

    const [result] = await pool.query(
      'INSERT INTO admin_users (name, email, password_hash, role, mfa_enabled) VALUES (?, ?, ?, ?, 0)',
      [name.trim(), cleanEmail, hash, userRole]
    );

    res.json({
      success: true,
      message: 'Pengguna baru berhasil ditambahkan',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: cleanEmail,
        role: userRole,
        mfa_enabled: false
      }
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PATCH /api/auth/users/:id
router.patch('/users/:id', requireAuth, async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (!targetId) return res.status(400).json({ success: false, message: 'ID pengguna tidak valid' });

    if (req.user.role !== 'admin' && req.user.id !== targetId) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    const { name, role, password } = req.body || {};
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE id = ? LIMIT 1', [targetId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    const updates = [];
    const params = [];

    if (name && name.trim()) {
      updates.push('name = ?');
      params.push(name.trim());
    }

    if (role && (role === 'admin' || role === 'editor') && req.user.role === 'admin') {
      updates.push('role = ?');
      params.push(role);
    }

    if (password) {
      if (password.length < 8 || !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
        return res.status(400).json({ success: false, message: 'Password minimal 8 karakter dengan kombinasi huruf dan angka' });
      }
      const hash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      params.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diperbarui' });
    }

    params.push(targetId);
    await pool.query(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true, message: 'Data pengguna berhasil diperbarui' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/auth/users/:id
router.delete('/users/:id', requireAuth, async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (!targetId) return res.status(400).json({ success: false, message: 'ID pengguna tidak valid' });

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Hanya Administrator yang berwenang menghapus pengguna' });
    }

    if (req.user.id === targetId) {
      return res.status(400).json({ success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif' });
    }

    const pool = getPool();
    const [admins] = await pool.query("SELECT id FROM admin_users WHERE role = 'admin'");
    const [targetUser] = await pool.query('SELECT role FROM admin_users WHERE id = ?', [targetId]);
    if (!targetUser || targetUser.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    if (targetUser[0].role === 'admin' && admins.length <= 1) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus Administrator terakhir di sistem' });
    }

    await pool.query('DELETE FROM admin_users WHERE id = ?', [targetId]);
    res.json({ success: true, message: 'Pengguna berhasil dihapus' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/auth/users/:id/reset-mfa
router.post('/users/:id/reset-mfa', requireAuth, async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (!targetId) return res.status(400).json({ success: false, message: 'ID pengguna tidak valid' });

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Hanya Administrator yang berwenang me-reset MFA staf' });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT email FROM admin_users WHERE id = ? LIMIT 1', [targetId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    await pool.query(
      'UPDATE admin_users SET mfa_enabled = 0, totp_secret = NULL, totp_temp_secret = NULL, backup_codes = NULL WHERE id = ?',
      [targetId]
    );

    res.json({
      success: true,
      message: `MFA untuk akun ${rows[0].email} telah berhasil di-reset. Pengguna sekarang dapat login dengan kata sandi dan mendaftarkan ponsel barunya.`
    });
  } catch (err) {
    console.error('Reset MFA error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
