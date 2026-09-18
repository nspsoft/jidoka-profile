import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS } from '../src/data/defaults/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');

const BASE_URL = 'https://jidoka.co.id';
const TODAY = new Date().toISOString().split('T')[0];

const routes = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: '#/products', priority: '0.9', changefreq: 'weekly' },
  { path: '#/application', priority: '0.8', changefreq: 'monthly' },
  { path: '#/manufacturing', priority: '0.8', changefreq: 'monthly' },
  { path: '#/quality', priority: '0.8', changefreq: 'monthly' },
  { path: '#/way', priority: '0.7', changefreq: 'monthly' },
  { path: '#/corporate', priority: '0.7', changefreq: 'monthly' },
  { path: '#/partnership', priority: '0.7', changefreq: 'monthly' },
  { path: '#/resources', priority: '0.7', changefreq: 'weekly' },
  { path: '#/contact', priority: '0.8', changefreq: 'monthly' }
];

// Add each product
PRODUCTS.forEach(p => {
  routes.push({
    path: `#/product/${p.id}`,
    priority: '0.85',
    changefreq: 'weekly'
  });
});

export function generateSitemapAndRobots() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // XML Sitemap
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${BASE_URL}/${r.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  // Robots.txt
  const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /api/
Disallow: /#/admin

Sitemap: ${BASE_URL}/sitemap.xml
`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');
  console.log('✓ Generated public/sitemap.xml (' + routes.length + ' URLs)');
  console.log('✓ Generated public/robots.txt');

  // If dist exists, also copy there
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
    fs.writeFileSync(path.join(distDir, 'robots.txt'), robots, 'utf8');
    console.log('✓ Synced sitemap.xml & robots.txt to dist/');
  }
}

if (process.argv[1] && process.argv[1].endsWith('generate-sitemap.js')) {
  generateSitemapAndRobots();
}
