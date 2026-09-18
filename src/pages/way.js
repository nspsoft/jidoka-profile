import { dWay } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { L } from '../i18n.js';

export function renderWay() {
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Our Way', id: 'Our Way' })) + '<div class="wrap"><h1>' + L({ en: 'Japanese corporate DNA', id: 'DNA korporat ala Jepang' }) + '</h1><p class="lead">' + L({ en: 'This section is built for one reader: the Japanese management or holding company asking “does this company understand manufacturing culture?”. It is our differentiator — not decoration.', id: 'Bagian ini dibuat untuk satu pembaca: manajemen Jepang atau holding yang bertanya “apakah perusahaan ini memahami budaya manufaktur?”. Ini pembeda kami — bukan dekorasi.' }) + '</p></div></section>'
    + '<section class="sec"><div class="wrap"><div class="way-grid">' + dWay().map(w => '<div class="way-card reveal"><div class="kj">' + w.kj + '</div><div class="rm">' + w.n + '</div><b>' + L(w.s) + '</b><p>' + L(w.d) + '</p></div>').join('') + '</div>'
    + '<div class="wquote reveal"><p>' + L({ en: '“We develop people before we develop technology. Stable quality comes from stable, trained, thinking people.”', id: '“Kami membangun manusia sebelum teknologi. Kualitas yang stabil datang dari manusia yang stabil, terlatih, dan berpikir.”' }) + '</p><span>— ' + L({ en: 'Management message [to be confirmed by Jidoka team]', id: 'Pesan manajemen [untuk dikonfirmasi tim Jidoka]' }) + '</span></div></div></section>' + ctaBand();
}
