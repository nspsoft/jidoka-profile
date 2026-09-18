import { L } from '../i18n.js';

export const crumbs = (parent, cur) => '<div class="wrap"><div class="crumbs"><a href="#/home">' + L({ en: 'Home', id: 'Beranda' }) + '</a>' + (parent ? ' › <a href="' + parent.href + '">' + parent.label + '</a> › <b>' + cur + '</b>' : ' › <b>' + cur + '</b>') + '</div></div>';
