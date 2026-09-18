import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `${base}-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max
});

const router = express.Router();

// POST /api/upload - admin only
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
    }

    const file = req.file;
    const publicUrl = `/uploads/${file.filename}`;

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO uploads (filename, orig_name, mime_type, size_bytes, url) VALUES (?, ?, ?, ?, ?)`,
      [file.filename, file.originalname, file.mimetype, file.size, publicUrl]
    );

    res.json({
      success: true,
      id: result.insertId,
      url: publicUrl,
      filename: file.filename,
      orig_name: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengunggah file' });
  }
});

export default router;
