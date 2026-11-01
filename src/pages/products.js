import { dP } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { pcard } from '../components/productCard.js';
import { qs, qa } from '../components/dom.js';
import { L } from '../i18n.js';

export function renderProducts(f) {
  f = f || 'all';
  const filters = [
    ['all', { en: 'All products', id: 'Semua Produk' }],
    ['corrugated', { en: 'Corrugated', id: 'Karton Box & Korugasi' }],
    ['pp', { en: 'PP board', id: 'Imprabox & PP Board' }],
    ['custom', { en: 'Custom', id: 'Partisi & Kustom' }],
    ['film', { en: 'Film & sheet', id: 'Film & Lembaran PE' }]
  ];
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Products', id: 'Produk' })) + '<div class="wrap"><h1>' + L({ en: 'Products', id: 'Katalog Produk Kemasan' }) + '</h1><p class="lead">' + L({ en: 'A technical catalogue — not a brochure. Every page answers what an engineer or buyer needs to know.', id: 'Katalog spesifikasi teknis lengkap untuk memenuhi kebutuhan engineer manufaktur dan procurement industri.' }) + '</p></div></section>'
    + '<section class="sec" style="padding-top:8px"><div class="wrap">'
    + '<div class="toolbar"><div class="search">' + ic('search') + '<input id="pq" placeholder="' + L({ en: 'Search material, application or keyword…', id: 'Cari material, sektor aplikasi, atau kata kunci…' }) + '"></div>'
    + filters.map(x => '<button class="chip ' + (f === x[0] ? 'on' : '') + '" data-f="' + x[0] + '">' + L(x[1]) + '</button>').join('') + '</div>'
    + '<div class="grid3" id="pgrid">' + dP().map(pcard).join('') + '</div></div></section>' + ctaBand();
}

export function mountProducts() {
  const inp = qs('#pq'), grid = qs('#pgrid');
  const apply = f => {
    const q = ((inp && inp.value) || '').trim().toLowerCase();
    const list = dP().filter(p => (f === 'all' || String(p.cat.en).toLowerCase().indexOf(f) >= 0) && (q === '' || (p.name + ' ' + p.material + ' ' + L(p.lead) + ' ' + (p.apps || []).join(' ')).toLowerCase().indexOf(q) >= 0));
    if (grid) {
      grid.innerHTML = list.length ? list.map(pcard).join('') : '<p class="empty" style="grid-column:1/-1">' + L({ en: 'No product matches your search. Try another keyword.', id: 'Tidak ada produk yang cocok. Coba kata kunci lain.' }) + '</p>';
    }
  };
  qa('.toolbar .chip').forEach(c => c.onclick = () => {
    qa('.toolbar .chip').forEach(x => x.classList.toggle('on', x === c));
    apply(c.dataset.f);
  });
  if (inp) {
    inp.oninput = () => {
      const on = qa('.toolbar .chip').filter(x => x.classList.contains('on'))[0];
      apply(on ? on.dataset.f : 'all');
    };
  }
}
