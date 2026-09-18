import { esc } from './dom.js';
import { ic } from './icons.js';
import { L } from '../i18n.js';
import { dP } from '../data/db.js';

export const fText = (n, l, v, req) => '<div class="f"><label>' + l + (req ? ' <span class="req">*</span>' : '') + '</label><input name="' + n + '" value="' + esc(v) + '"></div>';
export const fTa = (n, l, v) => '<div class="f f-full"><label>' + l + '</label><textarea name="' + n + '">' + esc(v) + '</textarea></div>';
export const fBi = (n, l, v) => '<div class="f f-full"><label>' + l + ' (EN&nbsp;/&nbsp;ID)</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><input name="' + n + '_en" value="' + esc(v && v.en) + '" placeholder="EN"><input name="' + n + '_id" value="' + esc(v && v.id) + '" placeholder="ID"></div></div>';
export const fBiTa = (n, l, v) => '<div class="f f-full"><label>' + l + ' (EN&nbsp;/&nbsp;ID)</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><textarea name="' + n + '_en" placeholder="EN">' + esc(v && v.en) + '</textarea><textarea name="' + n + '_id" placeholder="ID">' + esc(v && v.id) + '</textarea></div></div>';
export const fSel = (n, l, opts, v) => '<div class="f"><label>' + l + '</label><select name="' + n + '">' + opts.map(o => '<option ' + (o === v ? 'selected' : '') + '>' + o + '</option>').join('') + '</select></div>';

export function rfqForm(product) {
  const cap = Math.floor(Math.random() * 80 + 11);
  const opts = dP().map(p => '<option value="' + esc(p.id) + '" ' + (p.id === product ? 'selected' : '') + '>' + esc(p.name) + '</option>').join('');
  return '<div class="panel-card"><h3 style="font-family:\'Barlow Condensed\';font-size:26px;text-transform:uppercase;color:var(--navy);margin-bottom:6px">' + L({ en: 'Structured RFQ form', id: 'Form RFQ terstruktur' }) + '</h3><p class="tiny" style="margin:0 0 18px">' + L({ en: 'Fill the technical data — the more complete, the faster and more accurate our quotation.', id: 'Isi data teknis — semakin lengkap, penawaran kami semakin cepat dan akurat.' }) + '</p>'
    + '<form class="form" novalidate>'
    + '<div class="f"><label>' + L({ en: 'Product', id: 'Produk' }) + ' <span class="req">*</span></label><select name="product" required>' + opts + '<option value="other">Other / Custom</option></select><div class="err">' + L({ en: 'Required', id: 'Wajib diisi' }) + '</div></div>'
    + '<div class="f"><label>Width (mm) <span class="req">*</span></label><input name="width" type="number" min="1" required><div class="err">' + L({ en: 'Numeric required', id: 'Angka wajib' }) + '</div></div>'
    + '<div class="f"><label>Length (mm) <span class="req">*</span></label><input name="length" type="number" min="0" required><div class="err">' + L({ en: 'Numeric required', id: 'Angka wajib' }) + '</div></div>'
    + '<div class="f"><label>Thickness (mm) <span class="req">*</span></label><input name="thick" type="number" step="0.01" min="0" required><div class="err">' + L({ en: 'Numeric required', id: 'Angka wajib' }) + '</div></div>'
    + '<div class="f"><label>' + L({ en: 'Quantity (pcs)', id: 'Quantity (pcs)' }) + ' <span class="req">*</span></label><input name="qty" type="number" min="1" required><div class="err">' + L({ en: 'Numeric required', id: 'Angka wajib' }) + '</div></div>'
    + '<div class="f f-full"><label>' + L({ en: 'Application', id: 'Aplikasi' }) + ' <span class="req">*</span></label><input name="app" required placeholder="' + L({ en: 'e.g. automotive press part, steel coil wrap…', id: 'mis. press part otomotif, coil wrap baja…' }) + '"><div class="err">' + L({ en: 'Required', id: 'Wajib diisi' }) + '</div></div>'
    + '<div class="f"><label>' + L({ en: 'Target delivery', id: 'Target pengiriman' }) + '</label><input name="target" type="date"></div>'
    + '<div class="f"><label>' + L({ en: 'Company', id: 'Perusahaan' }) + ' <span class="req">*</span></label><input name="company" required><div class="err">' + L({ en: 'Required', id: 'Wajib diisi' }) + '</div></div>'
    + '<div class="f"><label>' + L({ en: 'Name', id: 'Nama' }) + ' <span class="req">*</span></label><input name="name" required><div class="err">' + L({ en: 'Required', id: 'Wajib diisi' }) + '</div></div>'
    + '<div class="f"><label>Email <span class="req">*</span></label><input name="email" type="email" required><div class="err">' + L({ en: 'Valid email required', id: 'Email valid wajib' }) + '</div></div>'
    + '<div class="f"><label>' + L({ en: 'Phone', id: 'Telepon' }) + ' <span class="req">*</span></label><input name="phone" required><div class="err">' + L({ en: 'Required', id: 'Wajib diisi' }) + '</div></div>'
    + '<div class="f f-full"><label>' + L({ en: 'Notes (optional)', id: 'Catatan (opsional)' }) + '</label><textarea name="notes"></textarea></div>'
    + '<input class="hp" name="website" tabindex="-1" autocomplete="off">'
    + '<div class="captcha">' + ic('shield') + '<span>' + L({ en: 'Anti-spam check:', id: 'Cek anti-spam:' }) + '</span><b>' + cap + ' + ' + cap + '</b><input name="cap" data-a="' + (cap * 2) + '" placeholder="?"><div class="err">' + L({ en: 'Wrong answer', id: 'Jawaban salah' }) + '</div></div>'
    + '<div class="f-full"><button class="btn btn-red" style="width:100%;margin-top:6px" type="submit">' + ic('send') + ' ' + L({ en: 'Submit RFQ', id: 'Kirim RFQ' }) + '</button></div></form></div>';
}

export const prodForm = () => '<div class="panel-card"><h3 style="font-family:\'Barlow Condensed\';font-size:26px;text-transform:uppercase;color:var(--navy);margin-bottom:6px">' + L({ en: 'Product inquiry', id: 'Pertanyaan produk' }) + '</h3><p class="tiny" style="margin:0 0 18px">' + L({ en: 'General questions about our products and capability.', id: 'Pertanyaan umum tentang produk dan kapabilitas kami.' }) + '</p>'
  + '<form class="form" novalidate>'
  + '<div class="f"><label>' + L({ en: 'Name', id: 'Nama' }) + ' <span class="req">*</span></label><input name="name" required><div class="err">' + L({ en: 'Required', id: 'Wajib diisi' }) + '</div></div>'
  + '<div class="f"><label>' + L({ en: 'Company', id: 'Perusahaan' }) + '</label><input name="company"></div>'
  + '<div class="f"><label>Email <span class="req">*</span></label><input name="email" type="email" required><div class="err">' + L({ en: 'Valid email required', id: 'Email valid wajib' }) + '</div></div>'
  + '<div class="f"><label>' + L({ en: 'Topic', id: 'Topik' }) + '</label><select name="topic"><option>' + L({ en: 'Product specification', id: 'Spesifikasi produk' }) + '</option><option>' + L({ en: 'Factory tour request', id: 'Permintaan tur pabrik' }) + '</option><option>' + L({ en: 'Sampling request', id: 'Permintaan sampel' }) + '</option><option>' + L({ en: 'Other', id: 'Lainnya' }) + '</option></select></div>'
  + '<div class="f f-full"><label>' + L({ en: 'Message', id: 'Pesan' }) + ' <span class="req">*</span></label><textarea name="msg" required></textarea><div class="err">' + L({ en: 'Required', id: 'Wajib diisi' }) + '</div></div>'
  + '<input class="hp" name="website" tabindex="-1">'
  + '<div class="captcha">' + ic('shield') + '<span>' + L({ en: 'Anti-spam check:', id: 'Cek anti-spam:' }) + '</span><b>3 + 4</b><input name="cap" data-a="7" placeholder="?"><div class="err">' + L({ en: 'Wrong answer', id: 'Jawaban salah' }) + '</div></div>'
  + '<div class="f-full"><button class="btn btn-red" style="width:100%;margin-top:6px" type="submit">' + ic('send') + ' ' + L({ en: 'Send inquiry', id: 'Kirim pertanyaan' }) + '</button></div></form></div>';

export const corpForm = () => '<div class="panel-card"><h3 style="font-family:\'Barlow Condensed\';font-size:26px;text-transform:uppercase;color:var(--navy);margin-bottom:6px">' + L({ en: 'Corporate inquiry', id: 'Pertanyaan korporat' }) + '</h3><p class="tiny" style="margin:0 0 18px">' + L({ en: 'For corporate, partnership and investor needs — routed to Corporate Development, separate from general sales.', id: 'Untuk kebutuhan korporat, kemitraan, dan investor — diarahkan ke Corporate Development, terpisah dari sales umum.' }) + '</p>'
  + '<form class="form" novalidate>'
  + '<div class="f"><label>' + L({ en: 'Name', id: 'Nama' }) + ' <span class="req">*</span></label><input name="name" required><div class="err">' + L({ en: 'Required', id: 'Wajib diisi' }) + '</div></div>'
  + '<div class="f"><label>' + L({ en: 'Organization', id: 'Organisasi' }) + ' <span class="req">*</span></label><input name="org" required><div class="err">' + L({ en: 'Required', id: 'Wajib diisi' }) + '</div></div>'
  + '<div class="f"><label>Email <span class="req">*</span></label><input name="email" type="email" required><div class="err">' + L({ en: 'Valid email required', id: 'Email valid wajib' }) + '</div></div>'
  + '<div class="f"><label>' + L({ en: 'Inquiry type', id: 'Jenis pertanyaan'}) + '</label><select name="type"><option>' + L({ en: 'Investor / Holding', id: 'Investor / Holding' }) + '</option><option>' + L({ en: 'Strategic partnership', id: 'Kemitraan strategis' }) + '</option><option>' + L({ en: 'Supplier registration', id: 'Registrasi supplier' }) + '</option><option>' + L({ en: 'Other', id: 'Lainnya' }) + '</option></select></div>'
  + '<div class="f f-full"><label>' + L({ en: 'Message', id: 'Pesan' }) + ' <span class="req">*</span></label><textarea name="msg" required></textarea><div class="err">' + L({ en: 'Required', id: 'Wajib diisi' }) + '</div></div>'
  + '<input class="hp" name="website" tabindex="-1">'
  + '<div class="captcha">' + ic('shield') + '<span>' + L({ en: 'Anti-spam check:', id: 'Cek anti-spam:' }) + '</span><b>5 + 6</b><input name="cap" data-a="11" placeholder="?"><div class="err">' + L({ en: 'Wrong answer', id: 'Jawaban salah' }) + '</div></div>'
  + '<div class="f-full"><button class="btn btn-red" style="width:100%;margin-top:6px" type="submit">' + ic('send') + ' ' + L({ en: 'Send inquiry', id: 'Kirim pertanyaan' }) + '</button></div></form></div>';
