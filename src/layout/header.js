import { logo, ic } from '../components/icons.js';
import { dNav } from '../data/db.js';
import { L, LANG } from '../i18n.js';

export function renderHeader(cur) {
  return '<div class="wrap hdr-in"><a class="logo" href="#/home">' + logo() + '<span class="logo-t"><b>JIDOKA RESULT</b><i>INDONESIA</i></span></a>'
    + ' <nav class="nav"><ul>' + dNav().map(n => '<li class="' + (n.dd ? 'has-dd ' : '') + (n.p === cur ? 'active' : '') + '"><a href="#/' + n.p + '">' + L(n.l) + (n.dd ? ic('chevd') : '') + '</a>' + (n.dd ? '<div class="dd">' + n.dd() + '</div>' : '') + '</li>').join('') + '</ul></nav>'
    + ' <div class="hdr-r"><div class="lang"><button data-l="en" class="' + (LANG === 'en' ? 'on' : '') + '">EN</button><button data-l="id" class="' + (LANG === 'id' ? 'on' : '') + '">ID</button></div>'
    + ' <button class="burger" aria-label="Menu">' + ic('menu') + '</button></div></div>';
}
