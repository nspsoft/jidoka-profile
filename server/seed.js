import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { initDB, getPool } from './db.js';

import { PRODUCTS } from '../src/data/defaults/products.js';
import { NEWS } from '../src/data/defaults/news.js';
import { CAPS } from '../src/data/defaults/caps.js';
import { RES } from '../src/data/defaults/resources.js';
import { CO } from '../src/data/defaults/company.js';
import { TOUR } from '../src/data/defaults/tour.js';
import { WAY } from '../src/data/defaults/way.js';
import { HIST } from '../src/data/defaults/hist.js';
import { GOV } from '../src/data/defaults/gov.js';
import { CERTS } from '../src/data/defaults/certs.js';
import { INDUSTRIES } from '../src/data/defaults/industries.js';
import { MACH } from '../src/data/defaults/mach.js';
import { FLOW } from '../src/data/defaults/flow.js';
import { PILLARS } from '../src/data/defaults/pillars.js';
import { WHY } from '../src/data/defaults/why.js';
import { NAV } from '../src/data/defaults/nav.js';

dotenv.config();

const collections = {
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

export async function runSeed() {
  await initDB();
  const pool = getPool();

  console.log('Seeding content collections...');
  for (const [key, value] of Object.entries(collections)) {
    await pool.query(
      `INSERT INTO content (collection, data) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data)`,
      [key, JSON.stringify(value)]
    );
  }
  console.log(`✓ Seeded ${Object.keys(collections).length} content collections.`);

  // Seed default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jidoka.co.id';
  const adminPass = process.env.ADMIN_PASSWORD || 'jidoka2026';
  const passwordHash = await bcrypt.hash(adminPass, 10);

  await pool.query(
    `INSERT INTO admin_users (email, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [adminEmail, passwordHash]
  );
  console.log(`✓ Seeded admin user: ${adminEmail}`);

  return true;
}

// Allow standalone execution: node server/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed()
    .then(() => {
      console.log('Seed completed successfully.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
