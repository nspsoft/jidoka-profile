import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { renderHome } from '../src/pages/home.js';
import { renderProducts } from '../src/pages/products.js';
import { renderProduct } from '../src/pages/product.js';
import { renderApplication } from '../src/pages/application.js';
import { renderManufacturing } from '../src/pages/manufacturing.js';
import { renderQuality } from '../src/pages/quality.js';
import { renderWay } from '../src/pages/way.js';
import { renderCorporate } from '../src/pages/corporate.js';
import { renderPartnership } from '../src/pages/partnership.js';
import { renderResources } from '../src/pages/resources.js';
import { renderContact } from '../src/pages/contact.js';

import { renderHeader } from '../src/layout/header.js';
import { renderFooter } from '../src/layout/footer.js';
import { renderMobileMenu } from '../src/layout/mobilemenu.js';

import { getRouteMeta, buildJSONLD, BASE_URL } from '../src/seo.js';
import { PRODUCTS } from '../src/data/defaults/products.js';
import { generateSitemapAndRobots } from './generate-sitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

export async function prerenderAll() {
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html not found. Run vite build first.');
  }

  const baseTemplate = fs.readFileSync(templatePath, 'utf8');

  // Define route list to prerender
  const routesToPrerender = [
    { page: 'home', seg: ['home'], outPath: 'index.html', render: () => renderHome() },
    { page: 'products', seg: ['products'], outPath: 'products/index.html', render: () => renderProducts() },
    { page: 'application', seg: ['application'], outPath: 'application/index.html', render: () => renderApplication() },
    { page: 'manufacturing', seg: ['manufacturing'], outPath: 'manufacturing/index.html', render: () => renderManufacturing() },
    { page: 'quality', seg: ['quality'], outPath: 'quality/index.html', render: () => renderQuality() },
    { page: 'way', seg: ['way'], outPath: 'way/index.html', render: () => renderWay() },
    { page: 'corporate', seg: ['corporate'], outPath: 'corporate/index.html', render: () => renderCorporate() },
    { page: 'partnership', seg: ['partnership'], outPath: 'partnership/index.html', render: () => renderPartnership() },
    { page: 'resources', seg: ['resources'], outPath: 'resources/index.html', render: () => renderResources() },
    { page: 'contact', seg: ['contact'], outPath: 'contact/index.html', render: () => renderContact('rfq') }
  ];

  // Add individual product pages
  PRODUCTS.forEach(p => {
    routesToPrerender.push({
      page: 'product',
      seg: ['product', p.id],
      outPath: `product/${p.id}/index.html`,
      render: () => renderProduct(p.id)
    });
  });

  console.log(`Prerendering ${routesToPrerender.length} static routes for SEO/AEO...`);

  for (const r of routesToPrerender) {
    const meta = getRouteMeta(r.page, r.seg, 'en');
    const jsonLd = buildJSONLD(r.page, r.seg, 'en');

    const headerHtml = renderHeader(r.page === 'product' ? 'products' : r.page);
    const mmHtml = renderMobileMenu();
    const pageHtml = r.render();
    const footerHtml = renderFooter();

    let html = baseTemplate;

    // 1. Replace Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);

    // 2. Replace or Inject Description & Canonical & OpenGraph & Twitter
    const metaTags = `
<meta name="description" content="${meta.desc}">
<link rel="canonical" href="${meta.canonical}">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.desc}">
<meta property="og:url" content="${meta.canonical}">
<meta property="og:type" content="${r.page === 'product' ? 'product' : 'website'}">
<meta property="og:site_name" content="PT Jidoka Result Indonesia">
<meta property="og:image" content="${meta.ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${meta.title}">
<meta name="twitter:description" content="${meta.desc}">
<meta name="twitter:image" content="${meta.ogImage}">
<script type="application/ld+json" id="jri-jsonld">${JSON.stringify(jsonLd, null, 2)}</script>
`;

    html = html.replace(/<meta name="description" content=".*?">/i, '');
    html = html.replace('</head>', `${metaTags}\n</head>`);

    // 3. Inject Pre-rendered Content into DOM nodes
    html = html.replace('<header id="hdr"></header>', `<header id="hdr">${headerHtml}</header>`);
    html = html.replace('<div id="mm"></div>', `<div id="mm">${mmHtml}</div>`);
    html = html.replace('<main id="app"></main>', `<main id="app">${pageHtml}</main>`);
    html = html.replace('<footer id="ftr"></footer>', `<footer id="ftr">${footerHtml}</footer>`);

    // Write file
    const dest = path.join(distDir, r.outPath);
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.writeFileSync(dest, html, 'utf8');
    console.log(`  ✓ ${r.outPath} (${(html.length / 1024).toFixed(1)} KB)`);
  }

  // Generate sitemap & robots
  generateSitemapAndRobots();
  console.log('✓ Prerendering completed successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('prerender.js')) {
  prerenderAll().catch(err => {
    console.error('Prerender failed:', err);
    process.exit(1);
  });
}
