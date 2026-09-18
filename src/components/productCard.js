import { esc } from './dom.js';
import { ic } from './icons.js';
import { art } from './productArt.js';
import { L } from '../i18n.js';

export const pcard = p => '<a class="pcard" href="#/product/' + esc(p.id) + '"><div class="art">' + art(p.art, p.name) + '</div><div class="pcard-b"><span class="cat">' + esc(L(p.cat)) + '</span><h3>' + esc(p.name) + '</h3><p>' + esc(L(p.lead)) + '</p><span class="more">' + L({ en: 'View detail', id: 'Lihat detail' }) + ' ' + ic('arrow') + '</span></div></a>';
