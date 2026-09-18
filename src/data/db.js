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

export const DBK = 'jri-db-v1';
export const AUTHK = 'jri-auth';
export { store };

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

export const DB = {
  get(k) {
    const d = dbRead();
    return d[k] !== undefined ? d[k] : DEF[k];
  },
  set(k, v) {
    const d = dbRead();
    d[k] = v;
    dbWrite(d);
  },
  resetAll() {
    dbWrite({});
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
