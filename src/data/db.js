import { PRODUCTS } from './defaults/products.js';
import { NEWS } from './defaults/news.js';
import { CAPS } from './defaults/caps.js';
import { RES } from './defaults/resources.js';
import { CO } from './defaults/company.js';
import { TOUR } from './defaults/tour.js';
import { WAY } from './defaults/way.js';
import { HIST } from './defaults/hist.js';
import { GOV } from './defaults/gov.js';
import { CERTS } from './defaults/certs.js';
import { INDUSTRIES } from './defaults/industries.js';
import { MACH } from './defaults/mach.js';
import { FLOW } from './defaults/flow.js';
import { PILLARS } from './defaults/pillars.js';
import { WHY } from './defaults/why.js';
import { NAV } from './defaults/nav.js';

import { store } from '../components/store.js';
import { authFetch } from './auth.js';

export const DBK = 'jri-db-v1';
export const AUTHK = 'jri-auth';
export { store };

export const DEF = {
  products: PRODUCTS,
  news: NEWS,
  caps: CAPS,
  resources: RES,
  company: CO,
  tour: TOUR,
  way: WAY,
  hist: HIST,
  gov: GOV,
  certs: CERTS,
  industries: INDUSTRIES,
  mach: MACH,
  flow: FLOW,
  pillars: PILLARS,
  why: WHY,
  nav: NAV
};

export function dbRead() {
  try {
    const r = store.get(DBK);
    return r ? JSON.parse(r) : {};
  } catch (e) {
    return {};
  }
}

export function dbWrite(d) {
  store.set(DBK, JSON.stringify(d));
}

// In-memory cache for ultra-fast sync access by renderers
const localStored = dbRead();
let memCache = { ...DEF, ...localStored };
let isRemote = false;

export function getIsRemote() {
  return isRemote;
}

// Initialize data layer: remote-first, localStorage/defaults fallback
export async function initData() {
  try {
    const res = await fetch('/api/content/all');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && Object.keys(json.data).length > 0) {
        isRemote = true;
        memCache = { ...DEF, ...json.data };
        // Sync to local storage for offline fallback
        dbWrite(memCache);
        return { remote: true, count: Object.keys(json.data).length };
      }
    }
  } catch (err) {
    // API server offline, fallback to local storage
  }

  isRemote = false;
  memCache = { ...DEF, ...dbRead() };
  return { remote: false };
}

export const DB = {
  get(k) {
    return memCache[k] !== undefined ? memCache[k] : DEF[k];
  },

  set(k, v) {
    memCache[k] = v;
    const d = dbRead();
    d[k] = v;
    dbWrite(d);

    // Sync to remote server asynchronously if in remote mode
    if (isRemote) {
      authFetch(`/api/content/${encodeURIComponent(k)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v)
      }).catch(err => {
        console.warn(`[Data Sync] Background sync failed for ${k}:`, err.message);
      });
    }
  },

  async save(k, v) {
    memCache[k] = v;
    const d = dbRead();
    d[k] = v;
    dbWrite(d);

    if (isRemote) {
      const res = await authFetch(`/api/content/${encodeURIComponent(k)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v)
      });
      return res.json();
    }
    return { success: true, local: true };
  },

  resetAll() {
    memCache = { ...DEF };
    dbWrite({});

    if (isRemote) {
      authFetch('/api/content/all', { method: 'DELETE' }).catch(err => {
        console.warn('[Data Sync] Remote reset failed:', err.message);
      });
    }
  },

  async importBackup(d) {
    if (typeof d !== 'object' || !d || Array.isArray(d)) {
      throw new Error('Data backup bukan objek');
    }

    memCache = { ...memCache, ...d };
    dbWrite(memCache);

    if (isRemote) {
      const res = await authFetch('/api/content/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
      });
      return res.json();
    }
    return { success: true, local: true };
  }
};

export const dP = () => DB.get('products');
export const dN = () => DB.get('news');
export const dC = () => DB.get('caps');
export const dR = () => DB.get('resources');
export const dCo = () => DB.get('company');
export const dTour = () => DB.get('tour');
export const dWay = () => DB.get('way');
export const dHist = () => DB.get('hist');
export const dGov = () => DB.get('gov');
export const dCerts = () => DB.get('certs');
export const dIndustries = () => DB.get('industries');
export const dMach = () => DB.get('mach');
export const dFlow = () => DB.get('flow');
export const dPillars = () => DB.get('pillars');
export const dWhy = () => DB.get('why');
export const dNav = () => DB.get('nav');

export { PRODUCTS, NEWS, CAPS, RES, CO, TOUR, WAY, HIST, GOV, CERTS, INDUSTRIES, MACH, FLOW, PILLARS, WHY, NAV };
