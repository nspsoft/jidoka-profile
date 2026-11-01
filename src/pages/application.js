import { dIndustries, dP } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { art } from '../components/productArt.js';
import { esc } from '../components/dom.js';
import { L } from '../i18n.js';

export function renderApplication() {
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Application', id: 'Solusi Industri' })) + '<div class="wrap"><h1>' + L({ en: 'Solutions by industry', id: 'Solusi Berdasarkan Sektor Industri' }) + '</h1><p class="lead">' + L({ en: 'The same engineering, applied to your world. Choose your industry to see how our packaging works in it.', id: 'Standar presisi rekayasa kemasan yang disesuaikan secara khusus dengan karakter dan regulasi sektor industri Anda.' }) + '</p></div></section>'
    + '<section class="sec" style="padding-top:10px"><div class="wrap">' + dIndustries().map(ind => '<div class="app-block" id="' + ind.id + '"><div class="app-head"><div class="app-ic">' + ic(ind.i) + '</div><h2>' + L(ind.name) + '</h2><span class="jp">' + ind.jp + '</span></div>'
      + '<p class="sec-lead">' + L(ind.d) + '</p><div class="app-cols"><div><h5>' + L({ en: 'Typical cases', id: 'Aplikasi & Contoh Penggunaan' }) + '</h5><ul>' + ind.cases.map(c => '<li>' + ic('checkc') + '<span>' + L(c) + '</span></li>').join('') + '</ul></div>'
      + '<div><h5>' + L({ en: 'Products used', id: 'Rekomendasi Varian Produk' }) + '</h5>' + ind.prods.map(pid => { const p = dP().find(x => x.id === pid); if (!p) return ''; const pic = (Array.isArray(p.images) && p.images[0]) ? '<img src="' + esc(p.images[0]) + '" alt="' + esc(p.name) + '">' : art(p.art); return '<a class="mini-p" href="#/product/' + esc(p.id) + '">' + pic + '<b>' + esc(p.name) + '</b></a>'; }).join('') + '</div></div></div>').join('') + '</div></section>' + ctaBand();
}
