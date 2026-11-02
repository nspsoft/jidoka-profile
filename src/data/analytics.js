import { authFetch, getToken } from './auth.js';

/**
 * Lightweight beacon to track visitor pageviews
 * Non-blocking, fails silently if offline.
 */
export function trackPageView(path, title) {
  try {
    const curPath = String(path || window.location.hash || '/').trim();
    // Do not track admin CMS pages to keep visitor analytics focused on public prospects
    if (curPath.startsWith('#/admin') || curPath.startsWith('/admin')) {
      return;
    }

    const payload = JSON.stringify({
      path: curPath,
      title: String(title || document.title || '').trim(),
      referrer: document.referrer || ''
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }
  } catch (e) {
    // Silent catch
  }
}

/**
 * Fetch analytics summary (cards, daily trends, top pages, devices, browsers)
 */
export async function getAnalyticsSummary(range = '7d') {
  try {
    const res = await authFetch(`/api/analytics/summary?range=${encodeURIComponent(range)}`);
    if (!res.ok) return { success: false, message: 'Gagal memuat statistik' };
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Download analytics trend CSV
 */
export async function downloadAnalyticsCsv(range = '30d') {
  try {
    const token = getToken();
    const res = await fetch(`/api/analytics/export?range=${encodeURIComponent(range)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Download gagal');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-pengunjung-jri-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('Download CSV error:', e);
    return false;
  }
}

/**
 * Fetch audit logs with pagination and filters
 */
export async function getAuditLogs(params = {}) {
  try {
    const q = new URLSearchParams();
    if (params.page) q.set('page', params.page);
    if (params.limit) q.set('limit', params.limit);
    if (params.category) q.set('category', params.category);
    if (params.action) q.set('action', params.action);
    if (params.search) q.set('search', params.search);
    if (params.start_date) q.set('start_date', params.start_date);
    if (params.end_date) q.set('end_date', params.end_date);

    const res = await authFetch(`/api/audit-logs?${q.toString()}`);
    if (!res.ok) return { success: false, message: 'Gagal memuat jejak audit' };
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Download audit logs CSV
 */
export async function downloadAuditLogsCsv(params = {}) {
  try {
    const token = getToken();
    const q = new URLSearchParams();
    if (params.category) q.set('category', params.category);
    if (params.search) q.set('search', params.search);
    if (params.start_date) q.set('start_date', params.start_date);
    if (params.end_date) q.set('end_date', params.end_date);

    const res = await fetch(`/api/audit-logs/export?${q.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Download gagal');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-jri-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('Download audit CSV error:', e);
    return false;
  }
}
