import { dCo, dP } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ic } from '../components/icons.js';
import { esc, qs, qa } from '../components/dom.js';
import { rfqForm, prodForm, corpForm } from '../components/forms.js';
import { okCard } from '../components/okCard.js';
import { L } from '../i18n.js';

export function renderContact(tab) {
  tab = tab || 'rfq';
  const co = dCo();
  const tabs = [
    ['rfq', { en: 'Request Quotation', id: 'Minta Penawaran' }],
    ['product', { en: 'Product Inquiry', id: 'Pertanyaan Produk' }],
    ['corporate', { en: 'Corporate Inquiry', id: 'Pertanyaan Korporat' }]
  ];
  const mapQuery = (co.mapQuery || co.addr || 'Kawasan Industri Jababeka II, Cikarang, Bekasi').trim();
  const mapEmbedUrl = (co.mapEmbed || '').trim() || ('https://maps.google.com/maps?q=' + encodeURIComponent(mapQuery) + '&t=&z=14&ie=UTF8&iwloc=&output=embed');
  const directMapsLink = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapQuery);
  const mapLabel = co.mapLabel || 'Jababeka II — Cikarang, Bekasi';

  return '<section class="page-hero">' + crumbs(null, L({ en: 'Contact', id: 'Kontak' })) + '<div class="wrap"><h1>' + L({ en: 'Contact us', id: 'Hubungi kami' }) + '</h1><p class="lead">' + L({ en: 'Three separate channels so every lead reaches the right person inside Jidoka.', id: 'Tiga jalur terpisah agar setiap lead sampai ke pihak internal Jidoka yang tepat.' }) + '</p></div></section>'
    + '<section class="sec"><div class="wrap ct-grid"><div><div class="info-card">'
    + '<div class="ic-row">' + ic('mail') + '<div><b>' + L({ en: 'Sales (general & RFQ)', id: 'Sales (umum & RFQ)' }) + '</b><span>' + esc(co.sales) + '</span></div></div>'
    + '<div class="ic-row">' + ic('link') + '<div><b>' + L({ en: 'Corporate Development (investor / holding)', id: 'Corporate Development (investor / holding)' }) + '</b><span>' + esc(co.corp) + '</span></div></div>'
    + '<div class="ic-row">' + ic('phone') + '<div><b>' + L({ en: 'Phone / WhatsApp', id: 'Telepon / WhatsApp'}) + '</b><span>' + esc(co.phone) + ' <small>[to be confirmed]</small></span></div></div>'
    + '<div class="ic-row">' + ic('pin') + '<div><b>' + L({ en: 'Factory & Office', id: 'Pabrik & Kantor' }) + '</b><span>' + esc(co.addr) + '</span></div></div>'
    + '<div class="ic-row">' + ic('clock') + '<div><b>' + L({ en: 'Response time', id: 'Waktu respons' }) + '</b><span>' + L({ en: 'Within 1 business day', id: 'Dalam 1 hari kerja' }) + '</span></div></div>'
    + '<div class="info-map-wrap">'
    + '<iframe title="' + esc(L({ en: 'Factory & Office Location Map', id: 'Peta Lokasi Pabrik & Kantor' })) + '" src="' + esc(mapEmbedUrl) + '" width="100%" height="230" style="border:0;display:block" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>'
    + '<div class="info-map-bar">'
    + '<span class="info-map-label">' + ic('pin') + ' ' + esc(mapLabel) + '</span>'
    + '<a href="' + esc(directMapsLink) + '" target="_blank" rel="noopener noreferrer" class="info-map-btn">' + L({ en: 'Open in Google Maps', id: 'Buka di Google Maps' }) + ' ↗</a>'
    + '</div></div></div></div>'
    + '<div><div class="tabs">' + tabs.map(t => '<button class="tab ' + (tab === t[0] ? 'on' : '') + '" data-t="' + t[0] + '">' + L(t[1]) + '</button>').join('') + '</div><div id="formzone"></div></div></div></section>';
}

export function mountContact(seg) {
  const zone = qs('#formzone');
  if (!zone) return;
  const paint = t => {
    zone.innerHTML = t === 'rfq' ? rfqForm(seg[2] || '') : t === 'product' ? prodForm() : corpForm();
    const f = zone.querySelector('form');
    if (!f) return;
    f.onsubmit = async ev => {
      ev.preventDefault();
      let ok = true;
      qa('[required]', f).forEach(el => {
        const bad = !el.value.trim() || (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
        el.closest('.f').classList.toggle('bad', bad);
        if (bad) ok = false;
      });
      const cp = qs('.captcha', f), capIn = qs('input[name=cap]', f);
      const capBad = (+capIn.value) !== (+capIn.dataset.a);
      cp.classList.toggle('bad', capBad);
      if (capBad) ok = false;
      if (qs('.hp', f).value) ok = false;
      if (!ok) return;
      const d = {};
      qa('input,select,textarea', f).forEach(el => {
        if (el.name && el.value && !el.classList.contains('hp')) d[el.name] = el.value;
      });
      const labelMap = {
        product: L({ en: 'Product', id: 'Produk' }),
        width: 'Width (mm)',
        length: 'Length (mm)',
        thick: 'Thickness (mm)',
        qty: L({ en: 'Quantity', id: 'Quantity' }),
        app: L({ en: 'Application', id: 'Aplikasi' }),
        target: L({ en: 'Target delivery', id: 'Target pengiriman' }),
        company: L({ en: 'Company', id: 'Perusahaan' }),
        name: L({ en: 'Name', id: 'Nama' }),
        email: 'Email',
        phone: L({ en: 'Phone', id: 'Telepon' }),
        org: L({ en: 'Organization', id: 'Organisasi' }),
        topic: L({ en: 'Topic', id: 'Topik' }),
        type: L({ en: 'Type', id: 'Jenis' }),
        msg: L({ en: 'Message', id: 'Pesan' }),
        notes: L({ en: 'Notes', id: 'Catatan' })
      };
      const clean = {};
      Object.keys(d).forEach(k => {
        if (k !== 'cap' && k !== 'website') {
          clean[labelMap[k] || k] = (k === 'product' && dP().find(p => p.id === d[k])) ? dP().find(p => p.id === d[k]).name : d[k];
        }
      });

      const leadType = t === 'rfq' ? 'rfq' : t === 'product' ? 'product' : 'corporate';
      try {
        const resp = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: leadType, payload: clean })
        });
        if (resp.ok) {
          const json = await resp.json();
          if (json.ref) clean._serverRef = json.ref;
        }
      } catch (err) {
        console.warn('[Leads Sync] Server submission error, using local fallback:', err.message);
      }

      zone.innerHTML = okCard(t === 'rfq' ? 'rfq' : 'inq', clean);
      const again = qs('#okagain');
      if (again) again.onclick = () => { paint(t); };
      const card = qs('.okcard');
      if (card) card.scrollIntoView({ behavior: 'smooth' });
    };
  };
  paint(seg[1] || 'rfq');
  qa('.tab').forEach(b => b.onclick = () => {
    qa('.tab').forEach(x => x.classList.toggle('on', x === b));
    paint(b.dataset.t);
  });
}
