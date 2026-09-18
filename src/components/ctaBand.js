import { ic } from './icons.js';
import { L } from '../i18n.js';

export const ctaBand = () => '<section class="cta-band"><div class="wrap cta-in"><div><div class="kicker" style="color:var(--gold-l)">' + L({ en: 'Request Quotation', id: 'Minta Penawaran' }) + '</div><h2>' + L({ en: 'Let’s work together', id: 'Mari bekerja sama' }) + '</h2><p>' + L({ en: 'Tell us your requirement — our sales engineer will respond within one business day.', id: 'Sampaikan kebutuhan Anda — sales engineer kami akan merespons dalam satu hari kerja.' }) + '</p></div>'
  + '<div class="cta-btns"><a class="btn btn-red" href="#/contact/rfq">' + ic('send') + ' ' + L({ en: 'Request Quotation', id: 'Minta Penawaran' }) + '</a><a class="btn btn-ghost" href="#/products">' + ic('box') + ' ' + L({ en: 'Explore Products', id: 'Lihat Produk' }) + '</a></div></div></section>';
