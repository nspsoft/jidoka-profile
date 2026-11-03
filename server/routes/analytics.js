import express from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { getPool } from '../db.js';
import { requireAuth, JWT_SECRET } from '../middleware/auth.js';
import { parseUserAgent } from '../utils/uaParser.js';

const router = express.Router();
const HASH_SALT = JWT_SECRET || 'jri-analytics-salt-2026';

// Tracking rate limiter: 120 requests per minute per IP
const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many tracking requests' }
});

// POST /api/analytics/track - Public lightweight tracking beacon
router.post('/track', trackLimiter, async (req, res) => {
  try {
    const rawUa = req.headers['user-agent'] || '';
    const { deviceType, browser, os, isBot } = parseUserAgent(rawUa);

    // Skip recording automated search bot crawlers to keep human analytics 100% genuine
    if (isBot) {
      return res.status(200).json({ success: true, ignored: 'bot' });
    }

    let ip = '127.0.0.1';
    const fwd = req.headers['x-forwarded-for'];
    if (fwd) {
      ip = String(fwd).split(',')[0].trim();
    } else if (req.socket?.remoteAddress) {
      ip = req.socket.remoteAddress;
    } else if (req.ip) {
      ip = req.ip;
    }
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const sessionHash = crypto
      .createHash('sha256')
      .update(`${ip}_${rawUa}_${todayDate}_${HASH_SALT}`)
      .digest('hex')
      .slice(0, 32);

    const body = req.body || {};
    let path = String(body.path || '/').trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, 255);
    let title = String(body.title || '').trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, 255);
    let rawRef = String(body.referrer || req.headers['referer'] || '').trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, 500);

    // Categorize referrer source
    let referrer = 'Direct / Langsung';
    if (rawRef) {
      try {
        const parsedUrl = new URL(rawRef.startsWith('http') ? rawRef : `https://${rawRef}`);
        const host = parsedUrl.hostname.toLowerCase();
        if (host.includes('jidoka') || host.includes('localhost') || host.includes('127.0.0.1')) {
          referrer = 'Direct / Internal';
        } else if (host.includes('google')) {
          referrer = 'Google Search';
        } else if (host.includes('bing')) {
          referrer = 'Bing Search';
        } else if (host.includes('linkedin')) {
          referrer = 'LinkedIn';
        } else if (host.includes('instagram')) {
          referrer = 'Instagram';
        } else if (host.includes('facebook') || host.includes('fb.me')) {
          referrer = 'Facebook';
        } else if (host.includes('whatsapp') || host.includes('wa.me')) {
          referrer = 'WhatsApp';
        } else {
          referrer = host;
        }
      } catch (e) {
        referrer = rawRef.slice(0, 64);
      }
    }

    const pool = getPool();
    await pool.query(
      `INSERT INTO visitor_pageviews (session_hash, path, title, referrer, device_type, browser, os)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sessionHash, path, title, referrer, deviceType, browser, os]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    // Non-blocking catch to ensure zero client impact
    console.warn('Analytics track error:', err.message);
    res.status(200).json({ success: false });
  }
});

// GET /api/analytics/summary - Protected summary statistics
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const range = req.query.range || '7d';

    let startDate = new Date();
    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '30d') {
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'this_month') {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0);
    } else {
      // default 7d
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    }

    const startIso = startDate.toISOString().slice(0, 19).replace('T', ' ');

    // 1. Total Pageviews & Unique Visitors
    const [statsRows] = await pool.query(
      `SELECT 
        COUNT(*) as total_pageviews,
        COUNT(DISTINCT session_hash) as unique_visitors
       FROM visitor_pageviews
       WHERE created_at >= ?`,
      [startIso]
    );
    const totalPageviews = statsRows[0]?.total_pageviews || 0;
    const uniqueVisitors = statsRows[0]?.unique_visitors || 0;

    // 2. Total Leads (RFQ) in same period
    const [leadsRows] = await pool.query(
      `SELECT COUNT(*) as total_leads FROM leads WHERE created_at >= ?`,
      [startIso]
    );
    const totalLeads = leadsRows[0]?.total_leads || 0;
    const conversionRate = uniqueVisitors > 0
      ? Number(((totalLeads / uniqueVisitors) * 100).toFixed(2))
      : 0;

    // 3. Daily Trend Data
    const [trendRows] = await pool.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        COUNT(*) as pageviews,
        COUNT(DISTINCT session_hash) as unique_visitors
       FROM visitor_pageviews
       WHERE created_at >= ?
       GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
       ORDER BY date ASC`,
      [startIso]
    );

    // 4. Top Pages
    const [topPagesRows] = await pool.query(
      `SELECT 
        path,
        MAX(title) as title,
        COUNT(*) as views
       FROM visitor_pageviews
       WHERE created_at >= ?
       GROUP BY path
       ORDER BY views DESC
       LIMIT 10`,
      [startIso]
    );
    const topPages = topPagesRows.map(p => ({
      path: p.path,
      title: p.title || p.path,
      views: p.views,
      percent: totalPageviews > 0 ? Number(((p.views / totalPageviews) * 100).toFixed(1)) : 0
    }));

    // 5. Device Distribution
    const [deviceRows] = await pool.query(
      `SELECT device_type, COUNT(*) as count
       FROM visitor_pageviews
       WHERE created_at >= ?
       GROUP BY device_type
       ORDER BY count DESC`,
      [startIso]
    );
    const devices = deviceRows.map(d => ({
      type: d.device_type,
      count: d.count,
      percent: totalPageviews > 0 ? Number(((d.count / totalPageviews) * 100).toFixed(1)) : 0
    }));

    // 6. Browser Distribution
    const [browserRows] = await pool.query(
      `SELECT browser, COUNT(*) as count
       FROM visitor_pageviews
       WHERE created_at >= ?
       GROUP BY browser
       ORDER BY count DESC
       LIMIT 6`,
      [startIso]
    );
    const browsers = browserRows.map(b => ({
      browser: b.browser,
      count: b.count,
      percent: totalPageviews > 0 ? Number(((b.count / totalPageviews) * 100).toFixed(1)) : 0
    }));

    // 7. Top Referrers
    const [refRows] = await pool.query(
      `SELECT referrer, COUNT(*) as count
       FROM visitor_pageviews
       WHERE created_at >= ?
       GROUP BY referrer
       ORDER BY count DESC
       LIMIT 6`,
      [startIso]
    );
    const referrers = refRows.map(r => ({
      referrer: r.referrer,
      count: r.count,
      percent: totalPageviews > 0 ? Number(((r.count / totalPageviews) * 100).toFixed(1)) : 0
    }));

    res.json({
      success: true,
      data: {
        range,
        summary: {
          totalPageviews,
          uniqueVisitors,
          totalLeads,
          conversionRate
        },
        trend: trendRows,
        topPages,
        devices,
        browsers,
        referrers
      }
    });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data analitik pengunjung' });
  }
});

// Helper to sanitize CSV cells against Formula Injection (CWE-1236)
function sanitizeCsvCell(str) {
  let s = String(str == null ? '' : str);
  if (/^[=\+\-@\t\r]/.test(s)) {
    s = "'" + s;
  }
  return `"${s.replace(/"/g, '""')}"`;
}

// GET /api/analytics/export - Export daily visitor trend to CSV
router.get('/export', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const range = req.query.range || '30d';

    let startDate = new Date();
    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '30d') {
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'this_month') {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0);
    } else {
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    }

    const startIso = startDate.toISOString().slice(0, 19).replace('T', ' ');

    const [rows] = await pool.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') as tanggal,
        COUNT(*) as total_kunjungan,
        COUNT(DISTINCT session_hash) as pengunjung_unik
       FROM visitor_pageviews
       WHERE created_at >= ?
       GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
       ORDER BY tanggal DESC`,
      [startIso]
    );

    const headers = ['Tanggal', 'Total Kunjungan (Pageviews)', 'Pengunjung Unik (Unique Visitors)'];
    const csvLines = [headers.join(',')];

    for (const r of rows) {
      csvLines.push([
        sanitizeCsvCell(r.tanggal),
        r.total_kunjungan,
        r.pengunjung_unik
      ].join(','));
    }

    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const filename = `laporan-pengunjung-jri-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (err) {
    console.error('Export analytics error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengekspor data statistik pengunjung' });
  }
});

export default router;
