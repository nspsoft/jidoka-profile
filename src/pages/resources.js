import { dR } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { esc } from '../components/dom.js';
import { L } from '../i18n.js';

export function renderResources() {
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Resources', id: 'Sumber Daya' })) + '<div class="wrap"><h1>' + L({ en: 'Resource center', id: 'Pusat sumber daya' }) + '</h1><p class="lead">' + L({ en: 'Documents and supporting information for your business reference — “Materials are provided for clear understanding.”', id: 'Dokumen dan informasi pendukung untuk referensi bisnis Anda — “Materials are provided for clear understanding.”' }) + '</p></div></section>'
    + '<section class="sec"><div class="wrap doc-grid">' + dR().map(r => '<div class="doc reveal">' + ic(r.i) + '<div><div class="doc-meta"><span class="lb-badge">' + esc(r.meta) + '</span><span class="size">' + esc(r.size) + '</span></div><h3>' + esc(L(r.name)) + '</h3><p>' + esc(L(r.d)) + '</p><a class="btn btn-line btn-sm" href="#/contact">' + ic('download') + ' ' + L({ en: 'Download PDF', id: 'Unduh PDF' }) + '</a></div></div>').join('') + '</div>'
    + '<div class="jp-note reveal">' + ic('eye') + '<span>' + L({ en: '資料は正確なご理解のためにご用意しております — Materials are provided for clear understanding. Japanese-tone documents available on request.', id: '資料は正確なご理解のためにご用意しております — Materials are provided for clear understanding. Dokumen bernuansa Jepang tersedia atas permintaan.' }) + '</span></div>'
    + '<p class="tiny">' + L({ en: 'Actual files will be uploaded by the Jidoka team; download buttons will link to real PDFs at launch.', id: 'File asli akan diunggah oleh tim Jidoka; tombol unduh akan tertaut ke PDF nyata saat peluncuran.' }) + '</p></div></section>' + ctaBand();
}
