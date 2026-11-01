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
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Partnership', id: 'Kemitraan' })) + '<div class="wrap"><h1>' + L({ en: 'Grow with Jidoka', id: 'Tumbuh Bersama Jidoka' }) + '</h1><p class="lead">' + L({ en: 'Not a financial report like a public company — a clear picture of partnership and investment opportunity.', id: 'Peluang kolaborasi strategis, kemitraan rantai pasok industri, dan investasi manufaktur yang saling menguntungkan.' }) + '</p></div></section>'
    + '<section class="sec" style="padding-top:20px"><div class="wrap">'
    + '<div class="ptabs">' + tabs.map(t => '<button class="ptab ' + (tab === t[0] ? 'on' : '') + '" data-t="' + t[0] + '">' + L(t[1]) + '</button>').join('') + '</div>'
    + '<div class="panel ' + (tab === 'customer' ? 'on' : '') + '" id="pn-customer"><h2 class="sec-title" style="font-size:30px">' + L({ en: 'For customers', id: 'Bagi Mitra Pelanggan (Industri)' }) + '</h2><p class="sec-lead">' + L({ en: 'What working with Jidoka looks like — from first RFQ to steady monthly supply.', id: 'Alur kerja sama profesional bersama Jidoka — sejak pengajuan spesifikasi RFQ hingga pasokan rutin bulanan.' }) + '</p>'
    + '<div class="steps">' + [['Send structured RFQ with your technical data', 'Kirimkan formulir RFQ dengan data teknis spesifikasi kemasan Anda'], ['Sales engineer reviews & quotes within 1 business day', 'Sales engineer kami meninjau spesifikasi dan merilis penawaran dalam 1 hari kerja'], ['Sampling / first article if required', 'Pembuatan sampel uji coba (first article / mockup) bila diperlukan'], ['Mass production under JICOS control', 'Produksi massal terpadu di bawah kendali sistem JICOS'], ['Monthly review & continuous improvement', 'Tinjauan performa bulanan dan continuous improvement berkesinambungan']].map(s => '<div class="step"><p>' + L({ en: s[0], id: s[1] }) + '</p></div>').join('') + '</div>'
    + '<div style="display:flex;gap:14px;margin-top:28px;flex-wrap:wrap"><a class="btn btn-red" href="#/contact/rfq">' + ic('send') + ' ' + L({ en: 'Request Quotation', id: 'Permintaan Penawaran (RFQ)' }) + '</a><a class="btn btn-line" href="#/products">' + ic('box') + ' ' + L({ en: 'See products', id: 'Katalog Produk' }) + '</a></div></div>'
    + '<div class="panel ' + (tab === 'supplier' ? 'on' : '') + '" id="pn-supplier"><h2 class="sec-title" style="font-size:30px">' + L({ en: 'For suppliers', id: 'Bagi Rekanan Pemasok (Supplier)' }) + '</h2><p class="sec-lead">' + L({ en: 'We buy paper, PP/PE resin, ink and logistics services under fair, long-term evaluation.', id: 'Kami bermitra dengan penyedia kertas kraft, resin PP/PE, tinta industri, dan jasa logistik berbasis evaluasi transparan dan hubungan jangka panjang.' }) + '</p><ul class="checks">'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Stable monthly volume with forecast sharing', id: 'Volume pengadaan rutin bulanan dengan keterbukaan perkiraan kebutuhan (forecast sharing)' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Fair supplier evaluation: quality, cost, delivery, safety', id: 'Evaluasi pemasok yang adil: standar mutu (Quality), biaya (Cost), pengiriman (Delivery), dan keselamatan (Safety)' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Clear specification and timely payment', id: 'Spesifikasi teknis penerimaan yang jelas dan ketepatan jadwal pembayaran' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Joint improvement on material usage', id: 'Kolaborasi teknis peningkatan efisiensi material dan keberlanjutan' }) + '</span></li></ul>'
    + '<div style="display:flex;gap:14px;margin-top:28px"><a class="btn btn-red" href="#/contact/corporate">' + ic('mail') + ' ' + L({ en: 'Contact Corporate Development', id: 'Hubungi Divisi Corporate Development' }) + '</a></div></div>'
    + '<div class="panel ' + (tab === 'strategic' ? 'on' : '') + '" id="pn-strategic"><h2 class="sec-title" style="font-size:30px">' + L({ en: 'For strategic partners', id: 'Bagi Mitra Strategis' }) + '</h2><p class="sec-lead">' + L({ en: 'Technology partners, packaging engineering firms and industrial groups — let us build capability together.', id: 'Mitra teknologi mesin, konsultan rekayasa kemasan, dan grup industri — mari mengembangkan kapabilitas manufaktur bersama.' }) + '</p><ul class="checks">'
    + '<li>' + ic('link') + '<span>' + L({ en: 'Technical licensing & machinery partnership', id: 'Lisensi teknologi kemasan khusus & transfer keahlian mesin modern' }) + '</span></li>'
    + '<li>' + ic('link') + '<span>' + L({ en: 'Joint development for new packaging materials', id: 'Riset dan pengembangan bersama material kemasan generasi baru' }) + '</span></li>'
    + '<li>' + ic('link') + '<span>' + L({ en: 'Cross-selling to Japanese manufacturers in Indonesia', id: 'Sinergi penyediaan kemasan bagi jaringan korporasi Jepang di Indonesia' }) + '</span></li>'
    + '<li>' + ic('link') + '<span>' + L({ en: 'Secondary site expansion with holding groups', id: 'Eksplorasi ekspansi pabrik kedua bersama kelompok usaha holding' }) + '</span></li></ul>'
    + '<div style="display:flex;gap:14px;margin-top:28px"><a class="btn btn-red" href="#/contact/corporate">' + ic('mail') + ' ' + L({ en: 'Contact Corporate Development', id: 'Hubungi Divisi Corporate Development' }) + '</a></div></div>'
    + '<div class="panel ' + (tab === 'investor' ? 'on' : '') + '" id="pn-investor"><div class="grid2"><div><h2 class="sec-title" style="font-size:30px">' + L({ en: 'Investor / Holding window', id: 'Kemitraan Investor & Holding' }) + '</h2>'
    + '<p class="sec-lead">' + L({ en: 'Jidoka is opening its corporate window for holding groups and strategic investors — especially Japanese manufacturers seeking reliable local capability.', id: 'Jidoka membuka komunikasi resmi bagi kelompok usaha holding dan investor strategis yang mencari mitra manufaktur lokal dengan etos kerja dan kapabilitas andal.' }) + '</p><ul class="checks">'
    + '<li>' + ic('trend') + '<span>' + L({ en: 'Company overview & business performance (summary)', id: 'Profil ringkas operasional dan ikhtisar performa bisnis' }) + '</span></li>'
    + '<li>' + ic('trend') + '<span>' + L({ en: 'Growth strategy & expansion plan', id: 'Rencana strategis pertumbuhan kapasitas dan perluasan pasar' }) + '</span></li>'
    + '<li>' + ic('trend') + '<span>' + L({ en: 'Manufacturing capability & JICOS system tour', id: 'Tur kapabilitas fasilitas pabrik dan sistem kontrol JICOS' }) + '</span></li>'
    + '<li>' + ic('trend') + '<span>' + L({ en: 'Management & governance introduction', id: 'Pengenalan struktur manajemen dan kepatuhan tata kelola' }) + '</span></li></ul>'
    + '<p class="tiny">' + L({ en: 'Level of business information disclosed is subject to NDA — confirmed upon formal request.', id: 'Tingkat keterbukaan rincian informasi bisnis tunduk pada perjanjian kerahasiaan (NDA) resmi perusahaan.' }) + '</p>'
    + '<div style="display:flex;gap:14px;margin-top:20px;flex-wrap:wrap"><a class="btn btn-red" href="#/contact/corporate">' + ic('mail') + ' ' + L({ en: 'Contact Corporate Development', id: 'Hubungi Corporate Development' }) + '</a><a class="btn btn-line" href="#/resources">' + ic('download') + ' ' + L({ en: 'Company profile (PDF)', id: 'Profil Perusahaan (PDF)' }) + '</a></div></div>'
    + '<div class="chart-card" id="chart"><span class="h5">' + L({ en: 'Production capacity outlook (index, illustrative)', id: 'Proyeksi Pertumbuhan Kapasitas Produksi (Indeks)' }) + '</span>'
    + '<svg viewBox="0 0 420 220">' + chart.map((v, i) => '<g><rect class="cbar" x="' + (28 + i * 48) + '" y="' + (200 - v * 2) + '" width="30" height="' + (v * 2) + '" rx="4" fill="' + (i === chart.length - 1 ? '#d71920' : '#16336e') + '"/><text x="' + (43 + i * 48) + '" y="214" text-anchor="middle" font-family="Barlow Condensed" font-size="11" fill="#5a6478">' + (2019 + i) + '</text><text x="' + (43 + i * 48) + '" y="' + (194 - v * 2) + '" text-anchor="middle" font-family="Barlow Condensed" font-size="12" fill="#0e2350">' + v + '</text></g>').join('') + '</svg>'
    + '<div class="strat-grid">'
    + '<div class="strat"><b>' + L({ en: 'Capacity growth', id: 'Ekspansi Kapasitas' }) + '</b><span>' + L({ en: '+15% with new blown-film line (2026)', id: '+15% dengan lini blown-film baru (2026)' }) + '</span></div>'
    + '<div class="strat"><b>' + L({ en: 'Customer base', id: 'Basis Pelanggan' }) + '</b><span>' + L({ en: '40+ active customers, automotive-led', id: '40+ mitra industri aktif, dipimpin sektor otomotif' }) + '</span></div>'
    + '<div class="strat"><b>' + L({ en: 'Export share', id: 'Pangsa Pasar' }) + '</b><span>' + L({ en: 'Growing — steel & packaging segments', id: 'Pertumbuhan berkesinambungan di segmen industri baja & kemasan' }) + '</span></div>'
    + '<div class="strat"><b>' + L({ en: 'Next step', id: 'Rencana Lanjutan' }) + '</b><span>' + L({ en: 'Second site study & machine additions', id: 'Kajian fasilitas kedua & penambahan mesin presisi' }) + '</span></div></div>'
    + '<p class="note-i">' + L({ en: 'Data and projections are illustrative representations.', id: 'Data dan proyeksi merupakan indikator estimasi kapasitas produksi.' }) + '</p></div></div></div></div></section>';
}

export function mountPartnership() {
  qa('.ptab').forEach(b => b.onclick = () => {
    qa('.ptab').forEach(x => x.classList.toggle('on', x === b));
    qa('.panel').forEach(p => p.classList.toggle('on', p.id === 'pn-' + b.dataset.t));
  });
}
