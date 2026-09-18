import { crumbs } from '../components/crumbs.js';
import { ic } from '../components/icons.js';
import { qa } from '../components/dom.js';
import { L } from '../i18n.js';

export function renderPartnership(tab) {
  tab = tab || 'customer';
  const tabs = [
    ['customer', { en: 'Customer', id: 'Customer' }],
    ['supplier', { en: 'Supplier', id: 'Supplier' }],
    ['strategic', { en: 'Strategic Partner', id: 'Mitra Strategis' }],
    ['investor', { en: 'Investor / Holding', id: 'Investor / Holding' }]
  ];
  const chart = [35, 42, 48, 55, 61, 70, 78, 88];
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Partnership', id: 'Kemitraan' })) + '<div class="wrap"><h1>' + L({ en: 'Grow with Jidoka', id: 'Bertumbuh bersama Jidoka' }) + '</h1><p class="lead">' + L({ en: 'Not a financial report like a public company — a clear picture of partnership and investment opportunity.', id: 'Bukan laporan keuangan seperti perusahaan publik — gambaran jelas tentang peluang kemitraan dan investasi.' }) + '</p></div></section>'
    + '<section class="sec" style="padding-top:20px"><div class="wrap">'
    + '<div class="ptabs">' + tabs.map(t => '<button class="ptab ' + (tab === t[0] ? 'on' : '') + '" data-t="' + t[0] + '">' + L(t[1]) + '</button>').join('') + '</div>'
    + '<div class="panel ' + (tab === 'customer' ? 'on' : '') + '" id="pn-customer"><h2 class="sec-title" style="font-size:30px">' + L({ en: 'For customers', id: 'Untuk customer' }) + '</h2><p class="sec-lead">' + L({ en: 'What working with Jidoka looks like — from first RFQ to steady monthly supply.', id: 'Seperti apa bekerja dengan Jidoka — dari RFQ pertama hingga pasokan bulanan yang stabil.' }) + '</p>'
    + '<div class="steps">' + [['Send structured RFQ with your technical data', 'Kirim RFQ terstruktur dengan data teknis Anda'], ['Sales engineer reviews & quotes within 1 business day', 'Sales engineer meninjau & menawarkan dalam 1 hari kerja'], ['Sampling / first article if required', 'Sampling / first article bila diperlukan'], ['Mass production under JICOS control', 'Produksi massal di bawah kendali JICOS'], ['Monthly review & continuous improvement', 'Review bulanan & perbaikan berkelanjutan']].map(s => '<div class="step"><p>' + L({ en: s[0], id: s[1] }) + '</p></div>').join('') + '</div>'
    + '<div style="display:flex;gap:14px;margin-top:28px;flex-wrap:wrap"><a class="btn btn-red" href="#/contact/rfq">' + ic('send') + ' ' + L({ en: 'Request Quotation', id: 'Minta Penawaran' }) + '</a><a class="btn btn-line" href="#/products">' + ic('box') + ' ' + L({ en: 'See products', id: 'Lihat produk' }) + '</a></div></div>'
    + '<div class="panel ' + (tab === 'supplier' ? 'on' : '') + '" id="pn-supplier"><h2 class="sec-title" style="font-size:30px">' + L({ en: 'For suppliers', id: 'Untuk supplier' }) + '</h2><p class="sec-lead">' + L({ en: 'We buy paper, PP/PE resin, ink and logistics services under fair, long-term evaluation.', id: 'Kami membeli kertas, resin PP/PE, tinta, dan jasa logistik dengan evaluasi yang adil dan jangka panjang.' }) + '</p><ul class="checks">'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Stable monthly volume with forecast sharing', id: 'Volume bulanan stabil dengan berbagi forecast' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Fair supplier evaluation: quality, cost, delivery, safety', id: 'Evaluasi supplier adil: kualitas, biaya, pengiriman, keselamatan' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Clear specification and timely payment', id: 'Spesifikasi jelas dan pembayaran tepat waktu' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Joint improvement on material usage', id: 'Perbaikan bersama pada penggunaan material' }) + '</span></li></ul>'
    + '<div style="display:flex;gap:14px;margin-top:28px"><a class="btn btn-red" href="#/contact/corporate">' + ic('mail') + ' ' + L({ en: 'Contact Corporate Development', id: 'Kontak Corporate Development' }) + '</a></div></div>'
    + '<div class="panel ' + (tab === 'strategic' ? 'on' : '') + '" id="pn-strategic"><h2 class="sec-title" style="font-size:30px">' + L({ en: 'For strategic partners', id: 'Untuk mitra strategis' }) + '</h2><p class="sec-lead">' + L({ en: 'Technology partners, packaging engineering firms and industrial groups — let us build capability together.', id: 'Mitra teknologi, perusahaan engineering packaging, dan grup industri — mari membangun kapabilitas bersama.' }) + '</p><ul class="checks">'
    + '<li>' + ic('link') + '<span>' + L({ en: 'Technical licensing & machinery partnership', id: 'Kemitraan lisensi teknis & mesin' }) + '</span></li>'
    + '<li>' + ic('link') + '<span>' + L({ en: 'Joint development for new packaging materials', id: 'Pengembangan bersama material packaging baru' }) + '</span></li>'
    + '<li>' + ic('link') + '<span>' + L({ en: 'Cross-selling to Japanese manufacturers in Indonesia', id: 'Cross-selling ke manufaktur Jepang di Indonesia' }) + '</span></li>'
    + '<li>' + ic('link') + '<span>' + L({ en: 'Secondary site expansion with holding groups', id: 'Ekspansi lokasi kedua bersama grup holding' }) + '</span></li></ul>'
    + '<div style="display:flex;gap:14px;margin-top:28px"><a class="btn btn-red" href="#/contact/corporate">' + ic('mail') + ' ' + L({ en: 'Contact Corporate Development', id: 'Kontak Corporate Development' }) + '</a></div></div>'
    + '<div class="panel ' + (tab === 'investor' ? 'on' : '') + '" id="pn-investor"><div class="grid2"><div><h2 class="sec-title" style="font-size:30px">' + L({ en: 'Investor / Holding window', id: 'Jendela Investor / Holding' }) + '</h2>'
    + '<p class="sec-lead">' + L({ en: 'Jidoka is opening its corporate window for holding groups and strategic investors — especially Japanese manufacturers seeking reliable local capability.', id: 'Jidoka membuka corporate window untuk grup holding dan investor strategis — terutama manufaktur Jepang yang mencari kapabilitas lokal yang andal.' }) + '</p><ul class="checks">'
    + '<li>' + ic('trend') + '<span>' + L({ en: 'Company overview & business performance (summary)', id: 'Ikhtisar perusahaan & performa bisnis (ringkasan)' }) + '</span></li>'
    + '<li>' + ic('trend') + '<span>' + L({ en: 'Growth strategy & expansion plan', id: 'Strategi pertumbuhan & rencana ekspansi' }) + '</span></li>'
    + '<li>' + ic('trend') + '<span>' + L({ en: 'Manufacturing capability & JICOS system tour', id: 'Tur kapabilitas manufaktur & sistem JICOS' }) + '</span></li>'
    + '<li>' + ic('trend') + '<span>' + L({ en: 'Management & governance introduction', id: 'Pengenalan manajemen & tata kelola' }) + '</span></li></ul>'
    + '<p class="tiny">' + L({ en: 'Level of business information disclosed is subject to NDA — to be confirmed with Jidoka management (PRD §15).', id: 'Tingkat keterbukaan informasi bisnis tunduk pada NDA — akan dikonfirmasi manajemen Jidoka (PRD §15).' }) + '</p>'
    + '<div style="display:flex;gap:14px;margin-top:20px;flex-wrap:wrap"><a class="btn btn-red" href="#/contact/corporate">' + ic('mail') + ' ' + L({ en: 'Contact Corporate Development', id: 'Kontak Corporate Development' }) + '</a><a class="btn btn-line" href="#/resources">' + ic('download') + ' ' + L({ en: 'Company profile (PDF)', id: 'Company profile (PDF)' }) + '</a></div></div>'
    + '<div class="chart-card" id="chart"><span class="h5">' + L({ en: 'Production capacity outlook (index, illustrative)', id: 'Proyeksi kapasitas produksi (indeks, ilustratif)' }) + '</span>'
    + '<svg viewBox="0 0 420 220">' + chart.map((v, i) => '<g><rect class="cbar" x="' + (28 + i * 48) + '" y="' + (200 - v * 2) + '" width="30" height="' + (v * 2) + '" rx="4" fill="' + (i === chart.length - 1 ? '#d71920' : '#16336e') + '"/><text x="' + (43 + i * 48) + '" y="214" text-anchor="middle" font-family="Barlow Condensed" font-size="11" fill="#5a6478">' + (2019 + i) + '</text><text x="' + (43 + i * 48) + '" y="' + (194 - v * 2) + '" text-anchor="middle" font-family="Barlow Condensed" font-size="12" fill="#0e2350">' + v + '</text></g>').join('') + '</svg>'
    + '<div class="strat-grid">'
    + '<div class="strat"><b>' + L({ en: 'Capacity growth', id: 'Pertumbuhan kapasitas' }) + '</b><span>' + L({ en: '+15% with new blown-film line (2026)', id: '+15% dengan line blown film baru (2026)' }) + '</span></div>'
    + '<div class="strat"><b>' + L({ en: 'Customer base', id: 'Basis customer' }) + '</b><span>' + L({ en: '40+ active customers, automotive-led', id: '40+ customer aktif, dipimpin otomotif' }) + '</span></div>'
    + '<div class="strat"><b>' + L({ en: 'Export share', id: 'Pangsa ekspor' }) + '</b><span>' + L({ en: 'Growing — steel & packaging segments', id: 'Bertumbuh — segmen baja & packaging' }) + '</span></div>'
    + '<div class="strat"><b>' + L({ en: 'Next step', id: 'Langkah berikutnya' }) + '</b><span>' + L({ en: 'Second site study & machine additions', id: 'Studi lokasi kedua & penambahan mesin' }) + '</span></div></div>'
    + '<p class="note-i">' + L({ en: 'Figures are illustrative placeholders pending confirmation by Jidoka management (PRD §15).', id: 'Angka merupakan placeholder ilustratif menunggu konfirmasi manajemen Jidoka (PRD §15).' }) + '</p></div></div></div></div></section>';
}

export function mountPartnership() {
  qa('.ptab').forEach(b => b.onclick = () => {
    qa('.ptab').forEach(x => x.classList.toggle('on', x === b));
    qa('.panel').forEach(p => p.classList.toggle('on', p.id === 'pn-' + b.dataset.t));
  });
}
