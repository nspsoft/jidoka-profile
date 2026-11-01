import { logo, ic } from '../components/icons.js';
import { esc } from '../components/dom.js';
import { dCo } from '../data/db.js';
import { L } from '../i18n.js';

export function renderFooter() {
  const co = dCo() || {};
  const t1 = co.logoText1 || 'JIDOKA RESULT';
  const t2 = co.logoText2 || 'INDONESIA';
  const motto = co.motto || 'PACKAGE YOUR QUALITY.';
  const tagline = co.tagline || 'Our website is not our company profile. It is our Digital Salesman, Corporate Window, and 24/7 Business Development Platform.';
  return '<div class="wrap ft-grid">'
    + '<div class="ft-brand"><a class="logo" href="#/home">' + logo(co.logoUrl, co.name || 'JRI') + '<span class="logo-t"><b>' + esc(t1) + '</b><i>' + esc(t2) + '</i></span></a><div class="motto-g">“' + esc(motto) + '”</div>'
    + '<div class="addr">' + ic('pin') + '<span>' + esc(co.addr) + ' <small>[address to be confirmed]</small></span></div>'
    + '<div class="addr">' + ic('clock') + '<span>' + esc(co.hours) + '</span></div>'
    + '<p class="tagline">“' + esc(tagline) + '”</p></div>'
    + '<div><h3>' + L({ en: 'Company', id: 'Perusahaan' }) + '</h3><ul><li><a href="#/corporate">' + L({ en: 'Corporate Profile', id: 'Tentang Kami' }) + '</a></li><li><a href="#/way">' + L({ en: 'Our Way', id: 'Budaya Kerja' }) + '</a></li><li><a href="#/manufacturing">' + L({ en: 'Manufacturing', id: 'Produksi' }) + '</a></li><li><a href="#/quality">' + L({ en: 'Quality', id: 'Mutu' }) + '</a></li></ul></div>'
    + '<div><h3>' + L({ en: 'Business', id: 'Solusi & Bisnis' }) + '</h3><ul><li><a href="#/products">' + L({ en: 'Products', id: 'Produk' }) + '</a></li><li><a href="#/application">' + L({ en: 'Application', id: 'Solusi' }) + '</a></li><li><a href="#/partnership">' + L({ en: 'Partnership', id: 'Kemitraan' }) + '</a></li><li><a href="#/resources">' + L({ en: 'Resources', id: 'Dokumen' }) + '</a></li><li><a href="#/contact">' + L({ en: 'Contact', id: 'Kontak' }) + '</a></li></ul></div>'
    + '<div><h3>' + L({ en: 'Contact', id: 'Kontak' }) + '</h3><ul class="ft-c">'
    + '<li>' + ic('mail') + '<span>' + esc(co.sales) + '<br><small>' + L({ en: 'general sales inquiry', id: 'permintaan penawaran & sales' }) + '</small></span></li>'
    + '<li>' + ic('link') + '<span>' + esc(co.corp) + '<br><small>' + L({ en: 'investor / holding / partnership', id: 'investor / holding / kemitraan' }) + '</small></span></li>'
    + '<li>' + ic('phone') + '<span>' + esc(co.phone) + ' <small>[' + L({ en: 'to be confirmed', id: 'konfirmasi' }) + ']</small></span></li></ul></div></div>'
    + '<div class="ft-bot"><div class="wrap ft-bot-in"><span>© 2026 PT Jidoka Result Indonesia. ' + L({ en: 'All rights reserved.', id: 'Seluruh hak dilindungi.' }) + '</span><span><a href="#/admin" style="color:#9aaecf;text-decoration:underline">Admin CMS</a> · <span style="color:#9aaecf">' + L({ en: 'Concept build — data pending company confirmation.', id: 'Versi pratinjau — data menunggu konfirmasi resmi perusahaan.' }) + '</span></span></div></div>';
}
