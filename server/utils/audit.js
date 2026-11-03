import { getPool } from '../db.js';

/**
 * Record an audit trail entry into the database.
 * Non-blocking: will not crash the parent process if database insert fails.
 *
 * @param {Object} params
 * @param {import('express').Request} params.req - Express request object
 * @param {string} params.action - Semantic action code e.g. 'auth.login.success', 'content.update'
 * @param {string} [params.entityType] - e.g. 'auth', 'user', 'content', 'lead', 'upload'
 * @param {string} [params.entityId] - Target ID or name
 * @param {Object|string} [params.details] - Any extra payload or change diff
 * @param {Object} [params.user] - Optional explicit user object override { id, email, name, role }
 */
export async function recordAuditLog({ req, action, entityType = null, entityId = null, details = null, user = null }) {
  try {
    const pool = getPool();
    if (!pool) return;

    const u = user || req?.user || null;
    const userId = u ? (u.id || null) : null;
    const userEmail = u ? (u.email || null) : null;
    const userName = u ? (u.name || null) : null;
    const role = u ? (u.role || null) : null;

    let ipAddress = '127.0.0.1';
    let userAgent = '';

    if (req) {
      const fwd = req.headers['x-forwarded-for'];
      if (fwd) {
        ipAddress = String(fwd).split(',')[0].trim();
      } else if (req.socket?.remoteAddress) {
        ipAddress = req.socket.remoteAddress;
      } else if (req.ip) {
        ipAddress = req.ip;
      }

      // Format IPv6 loopback
      if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
        ipAddress = '127.0.0.1';
      }

      userAgent = String(req.headers['user-agent'] || '').slice(0, 255);
    }

    const rawDetails = typeof details === 'object' && details !== null
      ? JSON.stringify(details)
      : (details ? String(details) : null);

    const detailsStr = rawDetails ? rawDetails.slice(0, 50000) : null;
    const cleanAction = String(action || 'unknown').slice(0, 64);
    const cleanEntityType = entityType ? String(entityType).slice(0, 64) : null;
    const cleanEntityId = entityId ? String(entityId).slice(0, 128) : '';

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_email, user_name, role, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, userEmail, userName, role, cleanAction, cleanEntityType, cleanEntityId, detailsStr, ipAddress, userAgent]
    );
  } catch (err) {
    console.error('⚠️ [AUDIT LOG ERROR] Failed to record audit log:', err.message);
  }
}
