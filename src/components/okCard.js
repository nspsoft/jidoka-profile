import { esc } from './dom.js';
import { ic } from './icons.js';
import { L } from '../i18n.js';

export function okCard(kind, data) {
  const ref = data._serverRef || ((kind === 'rfq' ? 'RFQ' : 'INQ') + '-2026-' + Math.floor(1000 + Math.random() * 9000));
  const rows = Object.keys(data).filter(k => data[k] && !k.startsWith('_')).map(k => '<tr><td>' + esc(k) + '</td><td>' + esc(data[k]) + '</td></tr>').join('');
  return '<div class="okcard"><div class="big-check">' + ic('check') + '</div><h3>' + L({ en: 'Thank you — submitted', id: 'Terima Kasih — Permintaan Terkirim' }) + '</h3>'
    + '<p>' + L({ en: 'Your submission has been recorded. Our team will review your requirement and respond within one business day.', id: 'Permintaan Anda telah berhasil kami terima. Tim sales engineer kami akan meninjau spesifikasi dan menghubungi Anda dalam maksimal 1 hari kerja.' }) + '</p>'
    + '<span class="ref">' + ref + '</span>' + (rows ? '<h5 style="font:700 12px \'Barlow\';letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin-bottom:10px">' + L({ en: 'Submission summary', id: 'Rincian Formulir' }) + '</h5><div class="tbl"><table>' + rows + '</table></div>' : '')
    + '<div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-line btn-sm" href="#/home">' + L({ en: 'Back to home', id: 'Kembali ke Beranda' }) + '</a><button class="btn btn-red btn-sm" id="okagain">' + L({ en: 'New submission', id: 'Kirim Permintaan Baru' }) + '</button></div></div>';
}
