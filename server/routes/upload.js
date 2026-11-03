import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAuditLog } from '../utils/audit.js';

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

const ALLOWED_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico',
  '.mp4', '.webm', '.pdf', '.docx', '.xlsx', '.doc', '.xls'
]);

const FORBIDDEN_EXTS = new Set([
  '.php', '.phtml', '.php3', '.php4', '.php5', '.phar',
  '.sh', '.bash', '.exe', '.bat', '.cmd', '.js', '.mjs',
  '.cjs', '.html', '.htm', '.pl', '.cgi', '.jar', '.vbs', '.py'
]);

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (FORBIDDEN_EXTS.has(ext)) {
      return cb(new Error('Tipe file berbahaya dan dilarang untuk diunggah'));
    }
    if (!ALLOWED_EXTS.has(ext)) {
      return cb(new Error('Format file tidak didukung. Format yang diizinkan: gambar, PDF, dokumen, dan video.'));
    }
    cb(null, true);
  }
});

const router = express.Router();

// POST /api/upload - admin only with strict extension & SVG XSS validation
router.post('/', requireAuth, (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Gagal memproses file' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
    }

    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();

    // Deep inspection for SVG to block Stored XSS & XXE vectors
    if (ext === '.svg') {
      const content = fs.readFileSync(file.path, 'utf8');
      const dangerousSvg = /<script|javascript:|data:text\/(html|xml)|\bon[a-z]+\s*=|<!entity|<iframe|<object|<embed|<foreignobject|href\s*=\s*['"]\s*javascript:/i;
      if (dangerousSvg.test(content)) {
        try { fs.unlinkSync(file.path); } catch (e) {}
        return res.status(400).json({ success: false, message: 'File SVG mengandung elemen berbahaya atau skrip yang dilarang' });
      }
    }

    const publicUrl = `/uploads/${file.filename}`;

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO uploads (filename, orig_name, mime_type, size_bytes, url) VALUES (?, ?, ?, ?, ?)`,
      [file.filename, file.originalname, file.mimetype, file.size, publicUrl]
    );

    recordAuditLog({
      req,
      action: 'upload.create',
      entityType: 'upload',
      entityId: file.filename,
      details: { orig_name: file.originalname, mime: file.mimetype, size: file.size, url: publicUrl }
    });

    res.json({
      success: true,
      id: result.insertId,
      url: publicUrl,
      filename: file.filename,
      orig_name: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
      file: {
        id: result.insertId,
        url: publicUrl,
        filename: file.filename,
        orig_name: file.originalname,
        mime_type: file.mimetype,
        size_bytes: file.size
      }
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengunggah file' });
  }
});

export default router;
