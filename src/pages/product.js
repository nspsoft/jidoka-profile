import { dP } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { art } from '../components/productArt.js';
import { esc } from '../components/dom.js';
import { L } from '../i18n.js';
import { renderProducts } from './products.js';

export function renderProduct(id) {
  const P = dP();
  const i = P.findIndex(p => p.id === id);
  if (i < 0) return renderProducts();
  const p = P[i], prev = P[(i - 1 + P.length) % P.length], next = P[(i + 1) % P.length];
  return '<section class="page-hero">' + crumbs({ href: '#/products', label: L({ en: 'Products', id: 'Produk' }) }, esc(p.name)) + '<div class="wrap"><h1>' + esc(p.name) + '</h1><p class="lead">' + esc(L(p.lead)) + '</p></div></section>'
    + '<section class="sec" style="padding-top:8px"><div class="wrap"><div class="pd-grid"><div class="pd-main">'
    + '<div class="pd-art">' + art(p.art, p.name + ' — ' + L(p.cat)) + '</div>'
    + '<h4>' + L({ en: 'Material', id: 'Material' }) + '</h4><p class="profile-p">' + esc(p.material) + '</p>'
    + '<h4>' + L({ en: 'Specification', id: 'Spesifikasi' }) + '</h4><div class="tbl"><table>' + p.spec.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>').join('') + '</table></div>'
    + '<h4>' + L({ en: 'Manufacturing capability', id: 'Kapabilitas manufaktur' }) + '</h4><div class="tbl"><table>' + p.mfg.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>').join('') + '</table></div>'
    + '<h4>' + L({ en: 'Application', id: 'Aplikasi' }) + '</h4><div class="chips-row">' + p.apps.map(a => '<span class="chip s">' + esc(a) + '</span>').join('') + '</div>'
    + '<h4>' + L({ en: 'Quality', id: 'Kualitas' }) + '</h4><div class="tbl"><table>' + p.quality.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>').join('') + '</table></div>'
    + '<div class="pd-nav"><a class="pdlink" href="#/product/' + esc(prev.id) + '">' + ic('arrl') + '<span><small>' + L({ en: 'Previous', id: 'Sebelumnya' }) + '</small><b>' + esc(prev.name) + '</b></span></a>'
    + '<a class="pdlink r" href="#/product/' + esc(next.id) + '"><span><small>' + L({ en: 'Next', id: 'Berikutnya' }) + '</small><b>' + esc(next.name) + '</b></span>' + ic('arrow') + '</a></div>'
    + '</div><aside class="pd-side"><div class="side-card"><div class="side-b"><span class="cat">' + esc(L(p.cat)) + '</span><h3>' + esc(p.name) + '</h3>'
    + '<p class="tiny">' + L({ en: 'Every RFQ you send arrives with full technical data — our sales engineer can quote faster and more accurately.', id: 'Setiap RFQ yang Anda kirim masuk dengan data teknis lengkap — penawaran lebih cepat dan akurat.' }) + '</p>'
    + '<a class="btn btn-red" style="width:100%;margin-top:12px" href="#/contact/rfq/' + esc(p.id) + '">' + ic('send') + ' ' + L({ en: 'Request quotation', id: 'Minta penawaran' }) + '</a>'
    + '<a class="btn btn-line" style="width:100%" href="#/resources">' + ic('download') + ' ' + L({ en: 'Spec sheet (PDF)', id: 'Spec sheet (PDF)' }) + '</a>'
    + '</div></div></aside></div></div></section>' + ctaBand();
}
