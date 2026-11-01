import { dCo, dHist, dGov } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { esc } from '../components/dom.js';
import { L } from '../i18n.js';

export function renderCorporate() {
  const co = dCo() || {};
  const cname = co.name || 'PT Jidoka Result Indonesia';
  const cmotto = co.motto || 'PACKAGE YOUR QUALITY.';
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Corporate', id: 'Profil Perusahaan' })) + '<div class="wrap"><h1>' + esc(cname) + '</h1><p class="lead">' + (co.desc ? esc(L(co.desc)) : L({ en: 'A packaging manufacturer built on Japanese manufacturing discipline — serving automotive, steel and industrial customers, domestic and export.', id: 'Produsen kemasan industri berbasis disiplin dan standar manufaktur Jepang — melayani sektor otomotif, baja, dan industri manufaktur untuk pasar domestik maupun ekspor.' })) + '</p></div></section>'
    + '<section class="sec"><div class="wrap grid2"><div class="reveal"><span class="kicker">' + L({ en: 'Company profile', id: 'Profil Perusahaan' }) + '</span><h2 class="sec-title">' + L({ en: 'Who we are', id: 'Tentang Kami' }) + '</h2>'
    + '<p class="profile-p">' + L({ en: cname + ' (“Jidoka”) is a packaging solutions company — karton box, imprabox packaging, partition packaging and custom packaging — for industrial manufacturing needs, both domestic and export. Operations run under our internal control system, JICOS (Jidoka Integrated Control & Operating System), with the motto “' + esc(cmotto) + '.”', id: cname + ' (“Jidoka”) merupakan perusahaan penyedia solusi kemasan industri terintegrasi — karton box, imprabox, partisi proteksi, dan kemasan kustom — untuk menunjang manufaktur modern baik pasar domestik maupun ekspor. Operasional pabrik berjalan di bawah kendali sistem JICOS dengan motto “' + esc(cmotto) + '.”' }) + '</p>'
    + '<h4 class="redlbl">' + L({ en: 'Business overview', id: 'Sekilas Perusahaan' }) + '</h4>'
    + '<div class="tbl"><table>'
    + '<tr><td>' + L({ en: 'Head office & factory', id: 'Kantor Pusat & Pabrik' }) + '</td><td>' + esc(dCo().addr) + ' <small>[' + L({ en: 'to be confirmed', id: 'konfirmasi' }) + ']</small></td></tr>'
    + '<tr><td>' + L({ en: 'Main business', id: 'Bidang Usaha Utama' }) + '</td><td>' + L({ en: 'Industrial packaging manufacturing', id: 'Manufaktur Kemasan Industri & Karton Box' }) + '</td></tr>'
    + '<tr><td>' + L({ en: 'Main customers', id: 'Mitra Industri Utama' }) + '</td><td>' + L({ en: 'Automotive, steel, industrial — domestic & export', id: 'Sektor Otomotif, Baja, Elektronik & Manufaktur (Domestik & Ekspor)' }) + '</td></tr>'
    + '<tr><td>' + L({ en: 'Employees', id: 'Jumlah Karyawan' }) + '</td><td>[' + L({ en: 'to be confirmed', id: 'konfirmasi' }) + ']</td></tr>'
    + '<tr><td>' + L({ en: 'Established', id: 'Tahun Pendirian' }) + '</td><td>2012 <small>[' + L({ en: 'to be confirmed', id: 'konfirmasi' }) + ']</small></td></tr></table></div></div>'
    + '<div class="reveal"><span class="kicker">' + L({ en: 'History', id: 'Tonggak Sejarah' }) + '</span><h2 class="sec-title">' + L({ en: 'Company history', id: 'Perjalanan & Sejarah Perusahaan' }) + '</h2>'
    + '<div class="tl">' + dHist().map(h => '<div class="tl-item"><span class="yr">' + h.yr + '</span><p>' + L(h.t) + '</p></div>').join('') + '</div></div></div></section>'
    + '<section class="sec alt"><div class="wrap"><div class="sec-head"><span class="kicker">' + L({ en: 'Management', id: 'Manajemen' }) + '</span><h2 class="sec-title">' + L({ en: 'Management team', id: 'Struktur Manajemen' }) + '</h2><p class="tiny">' + L({ en: 'Names and photos to be supplied by the Jidoka internal team.', id: 'Struktur kepemimpinan dan manajemen eksekutif PT Jidoka Result Indonesia.' }) + '</p></div></div></section>'
    + '<section class="sec"><div class="wrap grid2"><div class="reveal"><span class="kicker">' + L({ en: 'Sustainability', id: 'Keberlanjutan' }) + '</span><h2 class="sec-title">' + L({ en: 'Sustainability', id: 'Komitmen Keberlanjutan Lingkungan' }) + '</h2><ul class="checks">'
    + '<li>' + ic('recycle') + '<span>' + L({ en: 'Recyclable material portfolio — paper & PP based', id: 'Portofolio material ramah lingkungan dan dapat didaur ulang (berbasis kertas kraft & PP)' }) + '</span></li>'
    + '<li>' + ic('recycle') + '<span>' + L({ en: 'Material loss reduction via kaizen & JICOS monitoring', id: 'Efisiensi pemanfaatan bahan dan pengurangan scrap material via Kaizen & JICOS' }) + '</span></li>'
    + '<li>' + ic('recycle') + '<span>' + L({ en: 'Returnable packaging development for repeat customers', id: 'Pengembangan solusi kemasan guna ulang (returnable packaging) untuk mitra jangka panjang' }) + '</span></li>'
    + '<li>' + ic('recycle') + '<span>' + L({ en: 'Compliance with environmental regulations (waste, emission)', id: 'Kepatuhan penuh terhadap baku mutu lingkungan (pengelolaan limbah & emisi terpadu)' }) + '</span></li></ul></div>'
    + '<div class="reveal"><span class="kicker">' + L({ en: 'Corporate governance', id: 'Tata Kelola' }) + '</span><h2 class="sec-title">' + L({ en: 'Governance', id: 'Tata Kelola Perusahaan (Governance)' }) + '</h2>'
    + '<ul class="gov-list">' + dGov().map(g => '<li>' + ic('checkc') + '<span>' + L(g) + '</span></li>').join('') + '</ul></div></div></section>' + ctaBand();
}
