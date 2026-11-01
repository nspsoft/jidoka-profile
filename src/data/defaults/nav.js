import { PRODUCTS } from './products.js';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const getLang = () => {
  try {
    return (typeof window !== 'undefined' && window.localStorage && localStorage.getItem('jri-lang')) || 'en';
  } catch (e) {
    return 'en';
  }
};
const L = o => o ? (o[getLang()] !== undefined ? o[getLang()] : o.en) : '';

export const NAV = [
  { p: 'home', l: { en: 'Home', id: 'Beranda' } },
  {
    p: 'products',
    l: { en: 'Products', id: 'Produk' },
    dd: () => {
      let prods = PRODUCTS;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = localStorage.getItem('jri-db-v1');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.products)) prods = parsed.products;
          }
        }
      } catch (e) {}
      return prods.map(x => '<a href="#/product/' + esc(x.id) + '">' + esc(x.name) + '</a>').join('') + '<a class="dd-all" href="#/products">' + L({ en: 'All products', id: 'Semua produk' }) + ' →</a>';
    }
  },
  { p: 'application', l: { en: 'Application', id: 'Solusi' } },
  { p: 'manufacturing', l: { en: 'Manufacturing', id: 'Produksi' } },
  { p: 'quality', l: { en: 'Quality', id: 'Mutu' } },
  { p: 'way', l: { en: 'Our Way', id: 'Budaya Kerja' } },
  { p: 'corporate', l: { en: 'Corporate', id: 'Tentang Kami' } },
  { p: 'partnership', l: { en: 'Partnership', id: 'Kemitraan' } },
  { p: 'resources', l: { en: 'Resources', id: 'Dokumen' } },
  { p: 'contact', l: { en: 'Contact', id: 'Kontak' } }
];
