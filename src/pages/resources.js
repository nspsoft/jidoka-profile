import { dR } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { esc } from '../components/dom.js';
import { L } from '../i18n.js';

export function renderResources() {
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Resources', id: 'Dokumen & Brosur' })) + '<div class="wrap"><h1>' + L({ en: 'Resource Center', id: 'Pusat Dokumen & Unduhan' }) + '</h1><p class="lead">' + L({ en: 'Documents and supporting information for your business reference — “Materials are provided for clear understanding.”', id: 'Katalog spesifikasi teknis, sertifikasi mutu, dan profil resmi perusahaan untuk referensi kebutuhan bisnis Anda.' }) + '</p></div></section>'
    + '<section class="sec"><div class="wrap doc-grid">' + dR().map(r => '<div class="doc reveal">' + ic(r.i) + '<div><div class="doc-meta"><span class="lb-badge">' + esc(r.meta) + '</span><span class="size">' + esc(r.size) + '</span></div><h3>' + esc(L(r.name)) + '</h3><p>' + esc(L(r.d)) + '</p><a class="btn btn-line btn-sm" href="' + esc(r.url || '#/contact') + '"' + (r.url ? ' target="_blank" download' : '') + '>' + ic('download') + ' ' + L({ en: 'Download PDF', id: 'Unduh Dokumen' }) + '</a></div></div>').join('') + '</div>'
    + '<div class="jp-note reveal">' + ic('eye') + '<span>' + L({ en: '資料は正確なご理解のためにご用意しております — Materials are provided for clear understanding. Japanese-tone documents available on request.', id: '資料は正確なご理解のためにご用意しております — Materials are provided for clear understanding. Dokumen profil berbahasa Jepang tersedia melalui permintaan resmi.' }) + '</span></div>'
    + '<p class="tiny">' + L({ en: 'Official documents can be downloaded directly or requested via our sales team.', id: 'Dokumen resmi dapat diunduh secara langsung atau diajukan melalui kontak perwakilan kami.' }) + '</p></div></section>' + ctaBand();
}
