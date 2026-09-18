import { dCo, dHist, dGov } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { esc } from '../components/dom.js';
import { L } from '../i18n.js';

export function renderCorporate() {
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Corporate', id: 'Korporat' })) + '<div class="wrap"><h1>' + L({ en: 'PT Jidoka Result Indonesia', id: 'PT Jidoka Result Indonesia' }) + '</h1><p class="lead">' + L({ en: 'A packaging manufacturer built on Japanese manufacturing discipline — serving automotive, steel and industrial customers, domestic and export.', id: 'Produsen packaging yang dibangun di atas disiplin manufaktur Jepang — melayani customer otomotif, baja, dan industri, domestik maupun ekspor.' }) + '</p></div></section>'
    + '<section class="sec"><div class="wrap grid2"><div class="reveal"><span class="kicker">' + L({ en: 'Company profile', id: 'Profil perusahaan' }) + '</span><h2 class="sec-title">' + L({ en: 'Who we are', id: 'Siapa kami' }) + '</h2>'
    + '<p class="profile-p">' + L({ en: 'PT Jidoka Result Indonesia (“Jidoka”) is a packaging solutions company — karton box, imprabox packaging, partition packaging and custom packaging — for industrial manufacturing needs, both domestic and export. Operations run under our internal control system, JICOS (Jidoka Integrated Control & Operating System), with the motto “PACKAGE YOUR QUALITY.”', id: 'PT Jidoka Result Indonesia (“Jidoka”) adalah perusahaan solusi packaging — karton box, imprabox, partition packaging, dan custom packaging — untuk kebutuhan industri manufaktur, domestik maupun ekspor. Operasional berjalan di bawah sistem kendali internal kami, JICOS, dengan motto “PACKAGE YOUR QUALITY.”' }) + '</p>'
    + '<h4 class="redlbl">' + L({ en: 'Business overview', id: 'Gambaran bisnis' }) + '</h4>'
    + '<div class="tbl"><table>'
    + '<tr><td>' + L({ en: 'Head office & factory', id: 'Kantor & pabrik' }) + '</td><td>' + esc(dCo().addr) + ' <small>[to be confirmed]</small></td></tr>'
    + '<tr><td>' + L({ en: 'Main business', id: 'Bisnis utama' }) + '</td><td>' + L({ en: 'Industrial packaging manufacturing', id: 'Manufaktur packaging industri' }) + '</td></tr>'
    + '<tr><td>' + L({ en: 'Main customers', id: 'Customer utama' }) + '</td><td>' + L({ en: 'Automotive, steel, industrial — domestic & export', id: 'Otomotif, baja, industri — domestik & ekspor' }) + '</td></tr>'
    + '<tr><td>' + L({ en: 'Employees', id: 'Karyawan' }) + '</td><td>[' + L({ en: 'to be confirmed', id: 'perlu konfirmasi' }) + ']</td></tr>'
    + '<tr><td>' + L({ en: 'Established', id: 'Didirikan' }) + '</td><td>2012 <small>[to be confirmed]</small></td></tr></table></div></div>'
    + '<div class="reveal"><span class="kicker">' + L({ en: 'History', id: 'Sejarah' }) + '</span><h2 class="sec-title">' + L({ en: 'Company history', id: 'Sejarah perusahaan' }) + '</h2>'
    + '<div class="tl">' + dHist().map(h => '<div class="tl-item"><span class="yr">' + h.yr + '</span><p>' + L(h.t) + '</p></div>').join('') + '</div></div></div></section>'
    + '<section class="sec alt"><div class="wrap"><div class="sec-head"><span class="kicker">' + L({ en: 'Management', id: 'Manajemen' }) + '</span><h2 class="sec-title">' + L({ en: 'Management team', id: 'Tim manajemen' }) + '</h2><p class="tiny">' + L({ en: 'Names and photos to be supplied by the Jidoka internal team (PRD §15).', id: 'Nama dan foto akan disediakan tim internal Jidoka (PRD §15).' }) + '</p></div></div></section>'
    + '<section class="sec"><div class="wrap grid2"><div class="reveal"><span class="kicker">' + L({ en: 'Sustainability', id: 'Keberlanjutan' }) + '</span><h2 class="sec-title">' + L({ en: 'Sustainability', id: 'Keberlanjutan' }) + '</h2><ul class="checks">'
    + '<li>' + ic('recycle') + '<span>' + L({ en: 'Recyclable material portfolio — paper & PP based', id: 'Portofolio material dapat didaur ulang — berbasis kertas & PP' }) + '</span></li>'
    + '<li>' + ic('recycle') + '<span>' + L({ en: 'Material loss reduction via kaizen & JICOS monitoring', id: 'Pengurangan loss material lewat kaizen & pemantauan JICOS' }) + '</span></li>'
    + '<li>' + ic('recycle') + '<span>' + L({ en: 'Returnable packaging development for repeat customers', id: 'Pengembangan packaging returnable untuk customer berulang' }) + '</span></li>'
    + '<li>' + ic('recycle') + '<span>' + L({ en: 'Compliance with environmental regulations (waste, emission)', id: 'Kepatuhan terhadap regulasi lingkungan (limbah, emisi)' }) + '</span></li></ul></div>'
    + '<div class="reveal"><span class="kicker">' + L({ en: 'Corporate governance', id: 'Tata kelola' }) + '</span><h2 class="sec-title">' + L({ en: 'Governance', id: 'Tata kelola' }) + '</h2>'
    + '<ul class="gov-list">' + dGov().map(g => '<li>' + ic('checkc') + '<span>' + L(g) + '</span></li>').join('') + '</ul></div></div></section>' + ctaBand();
}
