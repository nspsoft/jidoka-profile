import { qs, qa, esc } from './components/dom.js';
import { buildChrome, initChrome } from './layout/chrome.js';
import { closeMM } from './layout/mobilemenu.js';

import { renderHome, mountHome } from './pages/home.js';
import { renderProducts, mountProducts } from './pages/products.js';
import { renderProduct, mountProduct } from './pages/product.js';
import { renderApplication } from './pages/application.js';
import { renderManufacturing, mountManufacturing } from './pages/manufacturing.js';
import { renderQuality } from './pages/quality.js';
import { renderWay } from './pages/way.js';
import { renderCorporate } from './pages/corporate.js';
import { renderPartnership, mountPartnership } from './pages/partnership.js';
import { renderResources } from './pages/resources.js';
import { renderContact, mountContact } from './pages/contact.js';
import { renderAdmin, mountAdmin } from './pages/admin.js';
import { updateSEO } from './seo.js';

let lastKey = null;
let CURPAGE = 'home';

export function syncHdr() {
  const h = qs('#hdr');
  if (!h) return;
  h.classList.toggle('onhero', CURPAGE === 'home' && window.scrollY < 60 && !!qs('#herov'));
}

export function goHash(h) {
  try {
    if (location.hash !== h) location.hash = h;
    else router(true);
  } catch (e) {
    router(true);
  }
}

export function router(force) {
  try {
    const seg = ((location.hash || '').replace(/^#\/?/, '') || 'home').split('/');
    const page = ({
      home: 1,
      products: 1,
      product: 1,
      application: 1,
      manufacturing: 1,
      quality: 1,
      way: 1,
      corporate: 1,
      partnership: 1,
      resources: 1,
      contact: 1,
      admin: 1
    })[seg[0]] ? seg[0] : 'home';

    const key = location.hash || '#/home';
    if (!force && key === lastKey) {
      closeMM();
      return;
    }
    lastKey = key;

    let html = '';
    if (page === 'products') html = renderProducts(seg[1]);
    else if (page === 'product') html = renderProduct(seg[1]);
    else if (page === 'partnership') html = renderPartnership(seg[1]);
    else if (page === 'contact') html = renderContact(seg[1]);
    else if (page === 'admin') html = renderAdmin(seg[1], seg[2]);
    else {
      html = ({
        home: renderHome,
        application: renderApplication,
        manufacturing: renderManufacturing,
        quality: renderQuality,
        way: renderWay,
        corporate: renderCorporate,
        resources: renderResources
      })[page]();
    }

    const app = qs('#app');
    if (app) app.innerHTML = html;

    buildChrome();
    CURPAGE = page;
    updateSEO(page, seg);
    syncHdr();
    closeMM();
    window.scrollTo(0, 0);

    mount(page, seg);

    if (page === 'application' && seg[1]) {
      const t = qs('#' + seg[1]);
      if (t) {
        setTimeout(function () {
          t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    }
  } catch (e) {
    console.error(e);
    const app = qs('#app');
    if (app) {
      app.innerHTML = '<div class="wrap" style="padding:80px 24px"><h2 style="color:#0e2350">Render error</h2><p style="color:#5a6478;margin:10px 0">' + esc(e && e.message ? e.message : e) + '</p><a href="#/home">← Back to Home</a></div>';
    }
    buildChrome();
  }
}

function mount(page, seg) {
  try {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }), { threshold: 0.12 });
      qa('.reveal').forEach(el => io.observe(el));

      const jic = qs('#jicos');
      if (jic) {
        new IntersectionObserver((es, o) => es.forEach(e => {
          if (e.isIntersecting) {
            jic.classList.add('in');
            o.disconnect();
          }
        })).observe(jic);
      }

      const ch = qs('#chart');
      if (ch) {
        new IntersectionObserver((es, o) => es.forEach(e => {
          if (e.isIntersecting) {
            ch.classList.add('in');
            o.disconnect();
          }
        })).observe(ch);
      }
    } else {
      qa('.reveal').forEach(el => el.classList.add('in'));
    }

    if (page === 'home') mountHome();
    if (page === 'products') mountProducts();
    if (page === 'product') mountProduct(seg[1]);
    if (page === 'manufacturing') mountManufacturing();
    if (page === 'partnership') mountPartnership();
    if (page === 'contact') mountContact(seg);
    if (page === 'admin') mountAdmin(seg, router, goHash);
  } catch (e) {
    console.error(e);
  }
}

export function initRouter() {
  initChrome(router, syncHdr);

  document.addEventListener('click', function (e) {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    const a = t.closest('a[href^="#/"]');
    if (!a) return;
    e.preventDefault();
    goHash(a.getAttribute('href'));
  });

  window.addEventListener('hashchange', () => router(true));
  router(true);
}
