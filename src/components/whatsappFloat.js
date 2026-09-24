import { dCo } from '../data/db.js';
import { ic } from './icons.js';
import { esc } from './dom.js';
import { L } from '../i18n.js';

export function renderWhatsAppFloat() {
  const co = dCo() || {};
  // Prioritize dedicated WhatsApp number, or sanitize phone number
  const rawNum = co.wa || co.phone || '+62 812 8990 6789';
  const cleanNum = String(rawNum).replace(/[^\d]/g, '');
  // Format international number (e.g. 0812... -> 62812...)
  const intlNum = cleanNum.startsWith('0') ? ('62' + cleanNum.slice(1)) : cleanNum;

  const defaultMsg = L({
    en: 'Hello PT Jidoka Result Indonesia, I would like to inquire about industrial packaging solutions.',
    id: 'Halo PT Jidoka Result Indonesia, saya ingin menanyakan solusi kemasan industri.'
  });

  const waUrl = 'https://wa.me/' + intlNum + '?text=' + encodeURIComponent((co.waMsg || '').trim() || defaultMsg);
  const tooltipText = L({
    en: 'Chat via WhatsApp',
    id: 'Chat via WhatsApp'
  });

  return '<aside class="wa-float-container" id="wafloat" aria-label="WhatsApp Support">'
    + '<a href="' + esc(waUrl) + '" target="_blank" rel="noopener noreferrer" class="wa-float-btn" title="' + esc(tooltipText) + '" aria-label="' + esc(tooltipText) + '">'
    + '<span class="wa-float-pulse"></span>'
    + '<span class="wa-float-icon">' + ic('wa') + '</span>'
    + '</a></aside>';
}
