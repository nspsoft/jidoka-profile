import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'jri_website';

let pool = null;

export async function initDB() {
  // First ensure database exists
  const rootConn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });

  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await rootConn.end();

  // Create pool
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS content (
      collection VARCHAR(64) PRIMARY KEY,
      data LONGTEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(32) NOT NULL,
      payload LONGTEXT NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(128) NOT NULL DEFAULT 'Admin',
      email VARCHAR(128) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(32) NOT NULL DEFAULT 'admin',
      mfa_enabled TINYINT(1) NOT NULL DEFAULT 0,
      totp_secret VARCHAR(64) DEFAULT NULL,
      totp_temp_secret VARCHAR(64) DEFAULT NULL,
      backup_codes TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Ensure MFA and multi-user columns exist for existing installations
  try {
    const [cols] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_users'",
      [DB_NAME]
    );
    const colNames = new Set(cols.map(c => c.COLUMN_NAME));

    if (!colNames.has('name')) {
      await pool.query("ALTER TABLE admin_users ADD COLUMN name VARCHAR(128) NOT NULL DEFAULT 'Admin'");
    }
    if (!colNames.has('role')) {
      await pool.query("ALTER TABLE admin_users ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'admin'");
    }
    if (!colNames.has('mfa_enabled')) {
      await pool.query('ALTER TABLE admin_users ADD COLUMN mfa_enabled TINYINT(1) NOT NULL DEFAULT 0');
    }
    if (!colNames.has('totp_secret')) {
      await pool.query('ALTER TABLE admin_users ADD COLUMN totp_secret VARCHAR(64) DEFAULT NULL');
    }
    if (!colNames.has('totp_temp_secret')) {
      await pool.query('ALTER TABLE admin_users ADD COLUMN totp_temp_secret VARCHAR(64) DEFAULT NULL');
    }
    if (!colNames.has('backup_codes')) {
      await pool.query('ALTER TABLE admin_users ADD COLUMN backup_codes TEXT DEFAULT NULL');
    }
  } catch (err) {
    console.warn('⚠️ Could not verify/migrate admin_users columns:', err.message);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS uploads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      orig_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(128),
      size_bytes BIGINT,
      url VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      user_email VARCHAR(128) NULL,
      user_name VARCHAR(128) NULL,
      role VARCHAR(32) NULL,
      action VARCHAR(64) NOT NULL,
      entity_type VARCHAR(64) NULL,
      entity_id VARCHAR(128) NULL,
      details LONGTEXT NULL,
      ip_address VARCHAR(45) NULL,
      user_agent VARCHAR(255) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_action (action),
      INDEX idx_audit_created_at (created_at),
      INDEX idx_audit_user_email (user_email),
      INDEX idx_audit_entity (entity_type, entity_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitor_pageviews (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      session_hash VARCHAR(64) NOT NULL,
      path VARCHAR(255) NOT NULL,
      title VARCHAR(255) NULL,
      referrer VARCHAR(255) NULL,
      device_type VARCHAR(16) NOT NULL DEFAULT 'desktop',
      browser VARCHAR(32) NOT NULL DEFAULT 'other',
      os VARCHAR(32) NOT NULL DEFAULT 'other',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_visitor_hash_created (session_hash, created_at),
      INDEX idx_visitor_path (path),
      INDEX idx_visitor_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDB() first.');
  }
  return pool;
}
