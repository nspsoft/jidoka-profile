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
    ['all', { en: 'All products', id: 'Semua produk' }],
    ['corrugated', { en: 'Corrugated', id: 'Korugasi' }],
    ['pp', { en: 'PP board', id: 'Papan PP' }],
    ['custom', { en: 'Custom', id: 'Kustom' }],
    ['film', { en: 'Film & sheet', id: 'Film & Lembaran' }]
  ];
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Products', id: 'Produk' })) + '<div class="wrap"><h1>' + L({ en: 'Products', id: 'Produk' }) + '</h1><p class="lead">' + L({ en: 'A technical catalogue — not a brochure. Every page answers what an engineer or buyer needs to know.', id: 'Katalog teknis — bukan brosur. Setiap halaman menjawab hal yang perlu diketahui engineer maupun buyer.' }) + '</p></div></section>'
    + '<section class="sec" style="padding-top:8px"><div class="wrap">'
    + '<div class="toolbar"><div class="search">' + ic('search') + '<input id="pq" placeholder="' + L({ en: 'Search material, application or keyword…', id: 'Cari material, aplikasi, atau kata kunci…' }) + '"></div>'
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
