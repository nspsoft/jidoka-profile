import { dWay } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { L } from '../i18n.js';

export function renderWay() {
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Our Way', id: 'Our Way' })) + '<div class="wrap"><h1>' + L({ en: 'Japanese Manufacturing Culture', id: 'Standar & Etos Mutu Manufaktur Jepang' }) + '</h1><p class="lead">' + L({ en: 'This section is built for one reader: the Japanese management or holding company asking “does this company understand manufacturing culture?”. It is our differentiator — not decoration.', id: 'Filosofi kerja dan etos manufaktur berstandar Jepang yang tertanam kuat dalam setiap proses produksi dan pengambilan keputusan kami — bukan sekadar dekorasi, melainkan keunggulan operasional kami.' }) + '</p></div></section>'
    + '<section class="sec"><div class="wrap"><div class="way-grid">' + dWay().map(w => '<div class="way-card reveal"><div class="kj">' + w.kj + '</div><div class="rm">' + w.n + '</div><b>' + L(w.s) + '</b><p>' + L(w.d) + '</p></div>').join('') + '</div>'
    + '<div class="wquote reveal"><p>' + L({ en: '“We develop people before we develop technology. Stable quality comes from stable, trained, thinking people.”', id: '“Kami membangun manusia sebelum teknologi. Kualitas yang stabil hadir dari sumber daya manusia yang terlatih, berdisiplin tinggi, dan berorientasi pada pemecahan masalah.”' }) + '</p><span>— ' + L({ en: 'Management Philosophy — PT Jidoka Result Indonesia', id: 'Filosofi Manajemen — PT Jidoka Result Indonesia' }) + '</span></div></div></section>' + ctaBand();
}
