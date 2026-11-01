import { store } from '../components/store.js';

const TOKEN_KEY = 'jri-jwt-token';
const USER_KEY = 'jri-admin-user';

let memToken = store.get(TOKEN_KEY) || null;
let memUser = null;
try {
  const u = store.get(USER_KEY);
  if (u) memUser = JSON.parse(u);
} catch (e) {}

export function getToken() {
  return memToken;
}

export function getUser() {
  return memUser;
}

export function isLogged() {
  return !!memToken;
}

export async function doLogin(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (data.mfa_required) {
        return {
          ok: false,
          mfa_required: true,
          mfa_ticket: data.mfa_ticket,
          message: data.message || 'Masukkan 6 digit kode dari Google Authenticator'
        };
      }
      if (data.token) {
        memToken = data.token;
        memUser = data.user;
        store.set(TOKEN_KEY, data.token);
        store.set(USER_KEY, JSON.stringify(data.user));
        return { ok: true, user: data.user };
      }
    }
    return { ok: false, message: data.message || 'Login gagal' };
  } catch (err) {
    console.error('Auth request error:', err);
    return { ok: false, message: 'Gagal terhubung ke server API' };
  }
}

export async function doMfaLogin(mfaTicket, code, isBackup = false) {
  try {
    const res = await fetch('/api/auth/mfa/verify-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mfa_ticket: mfaTicket,
        code: code.trim(),
        is_backup: isBackup
      })
    });

    const data = await res.json();
    if (res.ok && data.success && data.token) {
      memToken = data.token;
      memUser = data.user;
      store.set(TOKEN_KEY, data.token);
      store.set(USER_KEY, JSON.stringify(data.user));
      return { ok: true, user: data.user, message: data.message };
    }
    return { ok: false, message: data.message || 'Kode verifikasi tidak valid' };
  } catch (err) {
    console.error('MFA verify request error:', err);
    return { ok: false, message: 'Gagal terhubung ke server verifikasi' };
  }
}

export function doLogout() {
  memToken = null;
  memUser = null;
  store.set(TOKEN_KEY, '');
  store.set(USER_KEY, '');
  try {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  } catch (e) {}
}

export async function authFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (memToken) {
    headers['Authorization'] = `Bearer ${memToken}`;
  }
  return fetch(url, { ...options, headers });
}

export async function getMfaStatus() {
  try {
    const res = await authFetch('/api/auth/mfa/status');
    const data = await res.json();
    return data.success ? data : { mfa_enabled: false, backup_codes_remaining: 0 };
  } catch (e) {
    return { mfa_enabled: false, backup_codes_remaining: 0 };
  }
}

export async function setupMfa() {
  try {
    const res = await authFetch('/api/auth/mfa/setup', { method: 'POST' });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Gagal memulai setup MFA' };
  }
}

export async function verifyMfaSetup(code) {
  try {
    const res = await authFetch('/api/auth/mfa/verify-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() })
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Gagal memverifikasi setup MFA' };
  }
}

export async function disableMfa(password, code) {
  try {
    const res = await authFetch('/api/auth/mfa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, code: code.trim() })
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Gagal menonaktifkan MFA' };
  }
}

export async function regenerateBackupCodes(password) {
  try {
    const res = await authFetch('/api/auth/mfa/backup-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Gagal membuat kode cadangan' };
  }
}
