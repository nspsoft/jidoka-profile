import { dIndustries, dP } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { art } from '../components/productArt.js';
import { esc } from '../components/dom.js';
import { L } from '../i18n.js';

export function renderApplication() {
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Application', id: 'Aplikasi' })) + '<div class="wrap"><h1>' + L({ en: 'Solutions by industry', id: 'Solusi per industri' }) + '</h1><p class="lead">' + L({ en: 'The same engineering, applied to your world. Choose your industry to see how our packaging works in it.', id: 'Rekayasa yang sama, diterapkan di dunia Anda. Pilih industri Anda untuk melihat cara kerja packaging kami.' }) + '</p></div></section>'
    + '<section class="sec" style="padding-top:10px"><div class="wrap">' + dIndustries().map(ind => '<div class="app-block" id="' + ind.id + '"><div class="app-head"><div class="app-ic">' + ic(ind.i) + '</div><h2>' + L(ind.name) + '</h2><span class="jp">' + ind.jp + '</span></div>'
      + '<p class="sec-lead">' + L(ind.d) + '</p><div class="app-cols"><div><h5>' + L({ en: 'Typical cases', id: 'Kasus tipikal' }) + '</h5><ul>' + ind.cases.map(c => '<li>' + ic('checkc') + '<span>' + L(c) + '</span></li>').join('') + '</ul></div>'
      + '<div><h5>' + L({ en: 'Products used', id: 'Produk yang digunakan' }) + '</h5>' + ind.prods.map(pid => { const p = dP().find(x => x.id === pid); return p ? '<a class="mini-p" href="#/product/' + esc(p.id) + '">' + art(p.art) + '<b>' + esc(p.name) + '</b></a>' : ''; }).join('') + '</div></div></div>').join('') + '</div></section>' + ctaBand();
}
