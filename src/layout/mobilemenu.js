import { logo, ic } from '../components/icons.js';
import { dNav } from '../data/db.js';
import { L } from '../i18n.js';
import { qs } from '../components/dom.js';

export function renderMobileMenu() {
  return '<div class="mh">' + logo() + '<button id="mmclose" aria-label="Close">' + ic('x') + '</button></div>'
    + dNav().map(n => n.dd ? '<details><summary>' + L(n.l) + ic('chevd') + '</summary>' + n.dd() + '</details>' : '<a class="plain" href="#/' + n.p + '">' + L(n.l) + '</a>').join('')
    + '<div style="padding:18px 22px"><a class="btn btn-red" style="width:100%" href="#/contact/rfq">' + ic('send') + ' ' + L({ en: 'Request Quotation', id: 'Minta Penawaran' }) + '</a></div>';
}

export function closeMM() {
  const m = qs('#mm');
  const b = qs('.backdrop');
  if (m) m.classList.remove('open');
  if (b) b.classList.remove('show');
}
