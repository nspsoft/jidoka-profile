import express from 'express';
import { getPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { runSeed } from '../seed.js';

const router = express.Router();

const ALLOWED_COLLECTIONS = new Set([
  'company', 'products', 'pillars', 'why', 'industries', 'tour',
  'news', 'way', 'certs', 'mach', 'caps', 'gov', 'hist', 'resources'
]);

// GET /api/content/all - public, returns entire site content as map { products, news, ... }
router.get('/all', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT collection, data FROM content');
    const result = {};
    for (const r of rows) {
      try {
        result[r.collection] = JSON.parse(r.data);
      } catch (e) {
        result[r.collection] = r.data;
      }
    }
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Fetch all content error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data konten' });
  }
});

// GET /api/content/:collection - public
router.get('/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    if (!ALLOWED_COLLECTIONS.has(collection)) {
      return res.status(404).json({ success: false, message: 'Koleksi tidak ditemukan' });
    }
    const pool = getPool();
    const [rows] = await pool.query('SELECT data FROM content WHERE collection = ?', [collection]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Koleksi tidak ditemukan' });
    }

    const parsed = JSON.parse(rows[0].data);
    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('Fetch collection error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data koleksi' });
  }
});

// POST /api/content/import - admin only, imports entire JSON backup blob
router.post('/import', requireAuth, async (req, res) => {
  try {
    const payload = req.body;
    if (typeof payload !== 'object' || !payload || Array.isArray(payload)) {
      return res.status(400).json({ success: false, message: 'Format JSON backup tidak valid' });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const [key, value] of Object.entries(payload)) {
        if (key === 'settings' || !ALLOWED_COLLECTIONS.has(key)) continue; // ignore sensitive settings and invalid collections
        await conn.query(
          `INSERT INTO content (collection, data) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE data = VALUES(data)`,
          [key, JSON.stringify(value)]
        );
      }
      await conn.commit();
      res.json({ success: true, message: 'Data backup berhasil diimpor' });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Import content error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengimpor data backup: ' + err.message });
  }
});

// POST /api/content/:collection - admin only, update collection
router.post('/:collection', requireAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    if (!ALLOWED_COLLECTIONS.has(collection)) {
      return res.status(400).json({ success: false, message: 'Nama koleksi tidak valid' });
    }
    const data = req.body;
    if (data === undefined) {
      return res.status(400).json({ success: false, message: 'Data wajib diisi' });
    }

    const pool = getPool();
    await pool.query(
      `INSERT INTO content (collection, data) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data)`,
      [collection, JSON.stringify(data)]
    );

    res.json({ success: true, message: 'Koleksi berhasil disimpan', data });
  } catch (err) {
    console.error('Save collection error:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan koleksi' });
  }
});

// DELETE /api/content/all - admin only, reset to default
router.delete('/all', requireAuth, async (req, res) => {
  try {
    await runSeed();
    res.json({ success: true, message: 'Semua konten berhasil direset ke default' });
  } catch (err) {
    console.error('Reset all error:', err);
    res.status(500).json({ success: false, message: 'Gagal mereset konten' });
  }
});

export default router;
