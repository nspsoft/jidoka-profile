import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDB } from './db.js';

import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import leadsRoutes from './routes/leads.js';
import uploadRoutes from './routes/upload.js';
import auditRoutes from './routes/audit.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3002;

// Hide Express fingerprinting
app.disable('x-powered-by');

// Trust reverse proxy (Nginx on aaPanel / VPS) for accurate IP resolution in rate limiting & audit logs
app.set('trust proxy', 1);

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Controlled CORS Policy with strict origin hostname validation (anti-subdomain/infix spoofing)
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or local scripts
    if (!origin) return callback(null, true);
    try {
      const parsed = new URL(origin);
      const host = parsed.hostname.toLowerCase();
      if (
        host === 'jidoka.co.id' ||
        host.endsWith('.jidoka.co.id') ||
        host === 'localhost' ||
        host === '127.0.0.1' ||
        allowedOrigins.includes(origin.toLowerCase()) ||
        allowedOrigins.includes(host)
      ) {
        return callback(null, true);
      }
    } catch (e) {
      // Invalid URL syntax
    }
    return callback(new Error('Blocked by CORS security policy'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory with security sandbox headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; media-src 'self'; sandbox");
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    console.log('Connecting to MySQL and initializing schema...');
    await initDB();
    console.log('✓ Database connected & schema ready.');

    app.listen(PORT, () => {
      console.log(`✓ JRI API Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
