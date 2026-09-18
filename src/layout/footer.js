import { logo, ic } from '../components/icons.js';
import { esc } from '../components/dom.js';
import { dCo } from '../data/db.js';
import { L } from '../i18n.js';

export function renderFooter() {
  const co = dCo();
  return '<div class="wrap ft-grid">'
    + '<div class="ft-brand"><a class="logo" href="#/home">' + logo() + '<span class="logo-t"><b>JIDOKA RESULT</b><i>INDONESIA</i></span></a><div class="motto-g">“PACKAGE YOUR QUALITY.”</div>'
    + '<div class="addr">' + ic('pin') + '<span>' + esc(co.addr) + ' <small>[address to be confirmed]</small></span></div>'
    + '<div class="addr">' + ic('clock') + '<span>' + esc(co.hours) + '</span></div>'
    + '<p class="tagline">“Our website is not our company profile. It is our Digital Salesman, Corporate Window, and 24/7 Business Development Platform.”</p></div>'
    + '<div><h5>' + L({ en: 'Company', id: 'Perusahaan' }) + '</h5><ul><li><a href="#/corporate">' + L({ en: 'Corporate', id: 'Korporat' }) + '</a></li><li><a href="#/way">' + L({ en: 'Our Way', id: 'Our Way' }) + '</a></li><li><a href="#/manufacturing">' + L({ en: 'Manufacturing', id: 'Manufaktur' }) + '</a></li><li><a href="#/quality">' + L({ en: 'Quality', id: 'Kualitas' }) + '</a></li></ul></div>'
    + '<div><h5>' + L({ en: 'Business', id: 'Bisnis' }) + '</h5><ul><li><a href="#/products">' + L({ en: 'Products', id: 'Produk' }) + '</a></li><li><a href="#/application">' + L({ en: 'Application', id: 'Aplikasi' }) + '</a></li><li><a href="#/partnership">' + L({ en: 'Partnership', id: 'Kemitraan' }) + '</a></li><li><a href="#/resources">' + L({ en: 'Resources', id: 'Sumber Daya' }) + '</a></li><li><a href="#/contact">' + L({ en: 'Contact', id: 'Kontak' }) + '</a></li></ul></div>'
    + '<div><h5>' + L({ en: 'Contact', id: 'Kontak' }) + '</h5><ul class="ft-c">'
    + '<li>' + ic('mail') + '<span>' + esc(co.sales) + '<br><small>general sales inquiry</small></span></li>'
    + '<li>' + ic('link') + '<span>' + esc(co.corp) + '<br><small>investor / holding / partnership</small></span></li>'
    + '<li>' + ic('phone') + '<span>' + esc(co.phone) + ' <small>[to be confirmed]</small></span></li></ul></div></div>'
    + '<div class="ft-bot"><div class="wrap ft-bot-in"><span>© 2026 PT Jidoka Result Indonesia. ' + L({ en: 'All rights reserved.', id: 'Seluruh hak dilindungi.' }) + '</span><span><a href="#/admin" style="color:#6c7da3;text-decoration:underline">Admin CMS</a> · <span style="color:#6c7da3">' + L({ en: 'Concept build — placeholder data pending confirmation (PRD §15).', id: 'Build konsep — data placeholder menunggu konfirmasi (PRD §15).' }) + '</span></span></div></div>';
}
