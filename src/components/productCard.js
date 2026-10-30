import { esc } from './dom.js';
import { ic } from './icons.js';
import { art } from './productArt.js';
import { L } from '../i18n.js';

export const pcard = p => {
  const hasPhoto = Array.isArray(p.images) && p.images.length > 0 && p.images[0];
  const artContent = hasPhoto
    ? '<img src="' + esc(p.images[0]) + '" alt="' + esc(p.name) + '" width="300" height="190" loading="lazy">'
    : art(p.art, p.name);

  return '<a class="pcard" href="#/product/' + esc(p.id) + '">'
    + '<div class="art">' + artContent + '</div>'
    + '<div class="pcard-b">'
    + '<span class="cat">' + esc(L(p.cat)) + '</span>'
    + '<h3>' + esc(p.name) + '</h3>'
    + '<p>' + esc(L(p.lead)) + '</p>'
    + '<span class="more">' + L({ en: 'View detail', id: 'Lihat detail' }) + ' ' + ic('arrow') + '</span>'
    + '</div></a>';
};
