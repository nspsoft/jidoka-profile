import express from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { getPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAuditLog } from '../utils/audit.js';

const router = express.Router();

// Rate limiting: 15 lead submissions per 15 minutes per IP
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Terlalu banyak permintaan. Silakan coba lagi beberapa saat lagi.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Helper to get company email contacts from database
async function getCompanyEmails() {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT data FROM content WHERE collection = "company"');
    if (rows && rows.length > 0) {
      const co = JSON.parse(rows[0].data);
      return {
        sales: co.sales || 'sales@jidoka.co.id',
        corp: co.corp || 'corporate.dev@jidoka.co.id'
      };
    }
  } catch (e) {
    console.error('Error fetching company email config:', e.message);
  }
  return {
    sales: 'sales@jidoka.co.id',
    corp: 'corporate.dev@jidoka.co.id'
  };
}

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Helper to send email notification
async function sendNotificationEmail(type, payload, refId) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If SMTP is not configured, skip email sending and log
  if (!host || !user) {
    console.log(`[Email Mock] Lead ${refId} (${type}) recorded. SMTP not configured in .env, skipping actual email dispatch.`);
    return;
  }

  const companyEmails = await getCompanyEmails();
  const recipient = (type === 'corporate') ? companyEmails.corp : companyEmails.sales;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass }
  });

  const rawTitle = payload['Company'] || payload['Organization'] || payload['Name'] || payload['Nama'] || 'New Lead';
  const cleanTitle = String(rawTitle).replace(/[\r\n]/g, '').slice(0, 80);
  const subject = `[JRI Website Lead] ${refId} - ${type.toUpperCase()}: ${cleanTitle}`;
  
  const htmlRows = Object.entries(payload)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;color:#16336e">${escHtml(k)}</td><td style="padding:6px 12px;border:1px solid #ddd">${escHtml(v)}</td></tr>`)
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1b2436">
      <div style="background:#0e2350;color:#fff;padding:16px 20px;border-radius:6px 6px 0 0">
        <h2 style="margin:0;font-size:20px">JRI Website — Lead Masuk</h2>
        <p style="margin:4px 0 0;font-size:13px;color:#d8c39a">Nomor Referensi: ${refId} | Tipe: ${type.toUpperCase()}</p>
      </div>
      <div style="padding:20px;border:1px solid #e2e7ef;border-top:none;border-radius:0 0 6px 6px;background:#fff">
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px">
          ${htmlRows}
        </table>
        <p style="font-size:12px;color:#888;margin:16px 0 0">Pesan ini dikirim otomatis oleh backend website PT Jidoka Result Indonesia.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"JRI Website Notification" <${user}>`,
      to: recipient,
      subject,
      html
    });
    console.log(`[Email Dispatch] Notification for ${refId} successfully sent to ${recipient}`);
  } catch (err) {
    console.error(`[Email Dispatch Error] Failed to send email for ${refId}:`, err.message);
  }
}

// POST /api/leads - public, rate-limited
router.post('/', leadLimiter, async (req, res) => {
  try {
    const { type, payload } = req.body || {};

    // Validate type
    if (!['rfq', 'product', 'corporate'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Tipe lead tidak valid' });
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, message: 'Data formulir tidak boleh kosong' });
    }

    // Honeypot check: website field must be empty if present
    if (payload.website) {
      // Silently reject bot spam
      return res.json({ success: true, ref: 'RFQ-2026-' + Math.floor(1000 + Math.random() * 9000) });
    }

    // Limit payload size & field counts to prevent memory exhaustion
    const entries = Object.entries(payload);
    if (entries.length > 30) {
      return res.status(400).json({ success: false, message: 'Jumlah field formulir melebihi batas wajar' });
    }

    const sanitizedPayload = {};
    for (const [k, v] of entries) {
      const cleanKey = String(k).slice(0, 80);
      const cleanVal = typeof v === 'string' ? v.slice(0, 3000) : (typeof v === 'number' || typeof v === 'boolean' ? v : String(v).slice(0, 500));
      sanitizedPayload[cleanKey] = cleanVal;
    }

    // Required field validation server-side
    if (!sanitizedPayload.Name && !sanitizedPayload['Nama']) {
      return res.status(400).json({ success: false, message: 'Nama wajib diisi' });
    }
    if (!sanitizedPayload.Email) {
      return res.status(400).json({ success: false, message: 'Email wajib diisi' });
    }

    const prefix = (type === 'rfq' ? 'RFQ' : 'INQ');
    const refId = `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO leads (type, payload, status) VALUES (?, ?, "new")',
      [type, JSON.stringify({ ...sanitizedPayload, refId })]
    );

    // Send notification email asynchronously (do not block response)
    sendNotificationEmail(type, sanitizedPayload, refId).catch(err => console.error('Email error:', err));

    res.json({
      success: true,
      id: result.insertId,
      ref: refId,
      message: 'Pengiriman Anda tercatat'
    });
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ success: false, message: 'Gagal memproses pengiriman' });
  }
});

// GET /api/leads - admin only, returns all leads
router.get('/', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, type, payload, status, created_at FROM leads ORDER BY id DESC');

    const leads = rows.map(r => {
      let parsed = {};
      try {
        parsed = JSON.parse(r.payload);
      } catch (e) {
        parsed = {};
      }
      return {
        id: r.id,
        type: r.type,
        status: r.status,
        created_at: r.created_at,
        payload: parsed
      };
    });

    res.json({ success: true, data: leads });
  } catch (err) {
    console.error('Fetch leads error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data leads' });
  }
});

// PATCH /api/leads/:id - admin only, update status
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!['new', 'handled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status harus "new" atau "handled"' });
    }

    const pool = getPool();
    await pool.query('UPDATE leads SET status = ? WHERE id = ?', [status, id]);

    recordAuditLog({
      req,
      action: 'lead.status_update',
      entityType: 'lead',
      entityId: id,
      details: { new_status: status }
    });

    res.json({ success: true, message: 'Status lead berhasil diperbarui', id, status });
  } catch (err) {
    console.error('Update lead status error:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status lead' });
  }
});

// DELETE /api/leads/:id - admin only, delete lead
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query('DELETE FROM leads WHERE id = ?', [id]);

    recordAuditLog({
      req,
      action: 'lead.delete',
      entityType: 'lead',
      entityId: id
    });

    res.json({ success: true, message: 'Lead berhasil dihapus' });
  } catch (err) {
    console.error('Delete lead error:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus lead' });
  }
});

export default router;
