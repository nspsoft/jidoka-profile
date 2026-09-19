import { logo, ic } from '../components/icons.js';
import { dNav, dCo } from '../data/db.js';
import { L } from '../i18n.js';
import { qs, esc } from '../components/dom.js';

export function renderMobileMenu() {
  const co = dCo() || {};
  const t1 = co.logoText1 || 'JIDOKA RESULT';
  const t2 = co.logoText2 || 'INDONESIA';
  return '<div class="mh"><a class="logo" href="#/home" style="text-decoration:none;display:flex;align-items:center;gap:10px">' + logo(co.logoUrl, co.name || 'JRI') + '<span class="logo-t"><b>' + esc(t1) + '</b><i>' + esc(t2) + '</i></span></a><button id="mmclose" aria-label="Close">' + ic('x') + '</button></div>'
    + dNav().map(n => n.dd ? '<details><summary>' + L(n.l) + ic('chevd') + '</summary>' + n.dd() + '</details>' : '<a class="plain" href="#/' + n.p + '">' + L(n.l) + '</a>').join('')
    + '<div style="padding:18px 22px"><a class="btn btn-red" style="width:100%" href="#/contact/rfq">' + ic('send') + ' ' + L({ en: 'Request Quotation', id: 'Minta Penawaran' }) + '</a></div>';
}

export function closeMM() {
  const m = qs('#mm');
  const b = qs('.backdrop');
  if (m) m.classList.remove('open');
  if (b) b.classList.remove('show');
}
