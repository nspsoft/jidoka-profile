import express from 'express';
import { getPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/audit-logs - List audit logs with pagination & filters
router.get('/', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(5, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const { category, action, search, start_date, end_date } = req.query;

    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('entity_type = ?');
      params.push(category);
    }

    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }

    if (search) {
      conditions.push('(user_email LIKE ? OR user_name LIKE ? OR action LIKE ? OR entity_id LIKE ? OR details LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    if (start_date) {
      conditions.push('created_at >= ?');
      params.push(`${start_date} 00:00:00`);
    }

    if (end_date) {
      conditions.push('created_at <= ?');
      params.push(`${end_date} 23:59:59`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total rows
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch records
    const [rows] = await pool.query(
      `SELECT id, user_id, user_email, user_name, role, action, entity_type, entity_id, details, ip_address, user_agent, created_at
       FROM audit_logs
       ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      meta: {
        page,
        per_page: limit,
        total,
        total_pages: totalPages
      }
    });
  } catch (err) {
    console.error('Fetch audit logs error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data jejak audit' });
  }
});

// GET /api/audit-logs/export - Export audit logs to CSV
router.get('/export', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const { category, search, start_date, end_date } = req.query;

    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('entity_type = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(user_email LIKE ? OR user_name LIKE ? OR action LIKE ? OR entity_id LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (start_date) {
      conditions.push('created_at >= ?');
      params.push(`${start_date} 00:00:00`);
    }

    if (end_date) {
      conditions.push('created_at <= ?');
      params.push(`${end_date} 23:59:59`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT id, created_at, user_name, user_email, role, action, entity_type, entity_id, ip_address, details
       FROM audit_logs
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT 5000`,
      params
    );

    const headers = ['ID', 'Waktu (WIB)', 'Nama User', 'Email User', 'Peran', 'Aksi', 'Kategori', 'Entitas ID', 'IP Address', 'Detail'];
    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const timeStr = r.created_at ? new Date(r.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '';
      const clean = str => `"${String(str || '').replace(/"/g, '""')}"`;

      csvLines.push([
        r.id,
        clean(timeStr),
        clean(r.user_name),
        clean(r.user_email),
        clean(r.role),
        clean(r.action),
        clean(r.entity_type),
        clean(r.entity_id),
        clean(r.ip_address),
        clean(r.details)
      ].join(','));
    }

    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const filename = `audit-log-jri-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (err) {
    console.error('Export audit logs error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengekspor data audit' });
  }
});

export default router;
