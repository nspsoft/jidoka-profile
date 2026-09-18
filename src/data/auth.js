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
    if (res.ok && data.success && data.token) {
      memToken = data.token;
      memUser = data.user;
      store.set(TOKEN_KEY, data.token);
      store.set(USER_KEY, JSON.stringify(data.user));
      return { ok: true, user: data.user };
    }
    return { ok: false, message: data.message || 'Login gagal' };
  } catch (err) {
    console.error('Auth request error:', err);
    return { ok: false, message: 'Gagal terhubung ke server API' };
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
