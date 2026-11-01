import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { getPool } from '../db.js';
import { requireAuth, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Anti Brute-Force Rate Limiter: Max 10 attempts per 15 minutes per IP
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

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
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

export default router;
