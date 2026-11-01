import { ic } from './icons.js';
import { L } from '../i18n.js';

export const ctaBand = () => '<section class="cta-band"><div class="wrap cta-in"><div><div class="kicker" style="color:var(--gold-l)">' + L({ en: 'Request Quotation', id: 'Permintaan Penawaran (RFQ)' }) + '</div><h2>' + L({ en: 'Let’s work together', id: 'Konsultasikan Kebutuhan Kemasan Anda' }) + '</h2><p>' + L({ en: 'Tell us your requirement — our sales engineer will respond within one business day.', id: 'Sampaikan spesifikasi kebutuhan Anda — tim sales engineer kami siap merespons dalam 1 hari kerja.' }) + '</p></div>'
  + '<div class="cta-btns"><a class="btn btn-red" href="#/contact/rfq">' + ic('send') + ' ' + L({ en: 'Request Quotation', id: 'Minta Penawaran (RFQ)' }) + '</a><a class="btn btn-ghost" href="#/products">' + ic('box') + ' ' + L({ en: 'Explore Products', id: 'Katalog Produk' }) + '</a></div></div></section>';
