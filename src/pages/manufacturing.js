import { dTour, dFlow, dMach } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ic } from '../components/icons.js';
import { blueprint } from '../components/blueprint.js';
import { qs, qa } from '../components/dom.js';
import { L } from '../i18n.js';

export function renderManufacturing() {
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Manufacturing', id: 'Manufaktur' })) + '<div class="wrap"><h1>' + L({ en: 'A factory you can audit from anywhere', id: 'Pabrik yang bisa Anda audit dari mana saja' }) + '</h1><p class="lead">' + L({ en: 'Factory, machines, process, technology and capacity — shown the way we run them every day.', id: 'Pabrik, mesin, proses, teknologi, dan kapasitas — ditampilkan apa adanya.' }) + '</p></div></section>'
    + '<section class="sec"><div class="wrap"><div class="sec-head"><span class="kicker">' + L({ en: 'Digital Factory Tour', id: 'Tur Digital Pabrik' }) + ' — “' + L({ en: 'Explore Our Factory', id: 'Explore Our Factory' }) + '”</span><h2 class="sec-title">' + L({ en: 'Walk the flow, step by step', id: 'Ikuti alurnya, langkah demi langkah' }) + '</h2><p class="sec-lead">' + L({ en: 'From raw material to delivery — with real data, real machines and the people behind them.', id: 'Dari bahan baku hingga pengiriman — dengan data nyata, mesin nyata, dan orang-orang di baliknya.' }) + '</p></div>'
    + '<div class="tour"><div class="tour-list">' + dTour().map((t, i) => '<button class="tl-item ' + (i === 0 ? 'on' : '') + '" data-i="' + i + '"><span class="n">' + t.n + '</span><span><b>' + L(t.name) + '</b><small>' + t.jp + '</small></span></button>').join('') + '</div><div id="tpanel"></div></div></div></section>'
    + '<section class="sec alt"><div class="wrap"><div class="sec-head"><span class="kicker">' + L({ en: 'Trust builder', id: 'Pembangun kepercayaan' }) + '</span><h2 class="sec-title">' + L({ en: 'From factory to business', id: 'Dari pabrik ke bisnis' }) + '</h2><p class="sec-lead">' + L({ en: 'Jidoka is a manufacturing system — not a trading company. Every requirement travels this path under one control.', id: 'Jidoka adalah sistem manufaktur — bukan perusahaan trading. Setiap kebutuhan melewati jalur ini di bawah satu kendali.' }) + '</p></div>'
    + '<div class="flow-wrap"><div class="flow">' + dFlow().map((f, i) => '<span class="fnode ' + (i === 0 ? 'first ' : '') + (i === dFlow().length - 1 ? 'last' : '') + '">' + f + '</span>' + (i < dFlow().length - 1 ? '<span class="farr">' + ic('arrow') + '</span>' : '')).join('') + '</div></div></div></section>'
    + '<section class="sec"><div class="wrap"><div class="sec-head"><span class="kicker">' + L({ en: 'Machines & equipment', id: 'Mesin & peralatan' }) + '</span><h2 class="sec-title">' + L({ en: 'Machine list', id: 'Daftar mesin' }) + '</h2></div>'
    + '<div class="tbl"><table><tr><td style="width:34%">' + L({ en: 'Machine', id: 'Mesin' }) + '</td><td>Qty</td><td>' + L({ en: 'Max. width / range', id: 'Lebar / rentang maks.' }) + '</td><td>' + L({ en: 'Capability', id: 'Kapabilitas' }) + '</td></tr>'
    + dMach().map(m => '<tr><td style="width:34%;background:#fff">' + m[0] + '</td><td style="background:#fff">' + m[1] + '</td><td style="background:#fff">' + m[2] + '</td><td style="background:#fff">' + m[3] + '</td></tr>').join('') + '</table></div></div></section>'
    + '<section class="sec alt"><div class="wrap jc-grid"><div class="reveal"><span class="kicker">' + L({ en: 'Powered by JICOS', id: 'Didukung JICOS'}) + '</span><h2 class="sec-title">JICOS</h2>'
    + '<p class="sec-lead">' + L({ en: 'JICOS — Jidoka Integrated Control & Operating System — is our internal production control system. Production, quality and delivery data live in one dashboard.', id: 'JICOS — Jidoka Integrated Control & Operating System — adalah sistem kendali produksi internal kami. Data produksi, kualitas, dan pengiriman hidup dalam satu dashboard.' }) + '</p>'
    + '<ul class="jlist"><li>' + ic('checkc') + '<span>' + L({ en: 'Real-time line monitoring & heijunka scheduling', id: 'Pemantauan line real-time & penjadwalan heijunka' }) + '</span></li><li>' + ic('checkc') + '<span>' + L({ en: 'Quality gates linked to lot traceability', id: 'Quality gate terhubung ke traceability lot' }) + '</span></li><li>' + ic('checkc') + '<span>' + L({ en: 'Delivery status visible from order to arrival', id: 'Status pengiriman terlihat dari order hingga kedatangan' }) + '</span></li></ul>'
    + '<a class="btn btn-red" href="#/contact/rfq">' + ic('send') + ' ' + L({ en: 'Request Quotation', id: 'Minta Penawaran' }) + '</a></div>'
    + '<div class="jicos" id="jicos"><div class="jc-head"><span class="dots"><i></i><i></i><i></i></span> JICOS v3 — ' + L({ en: 'Live plant monitor (demo)', id: 'Monitor pabrik (demo)' }) + '<span class="live">' + L({ en: 'LIVE', id: 'LIVE' }) + '</span></div>'
    + '<div class="jc-body"><div class="jc-kpis"><div><b>87<span>%</span></b><small>' + L({ en: 'OEE today', id: 'OEE hari ini' }) + '</small></div><div><b>1,240</b><small>' + L({ en: 'Output today', id: 'Output hari ini' }) + '</small></div><div><b>98.4<span>%</span></b><small>' + L({ en: 'On-time delivery', id: 'Pengiriman tepat waktu' }) + '</small></div><div><b>8 / 8</b><small>' + L({ en: 'Lines running', id: 'Line beroperasi' }) + '</small></div></div>'
    + '<div class="jc-kpis"><div><b>4<span>/5</span></b><small>' + L({ en: 'QC gates passed', id: 'Gerbang QC lolos' }) + '</small></div><div><b>36<span>min</span></b><small>' + L({ en: 'Avg. changeover', id: 'Rata-rata changeover' }) + '</small></div><div><b>12</b><small>' + L({ en: 'Kaizen this month', id: 'Kaizen bulan ini' }) + '</small></div><div><b>0</b><small>' + L({ en: 'Safety incidents', id: 'Insiden keselamatan' }) + '</small></div></div>'
    + '<div class="jc-bars">' + [62, 78, 55, 84, 70, 90, 76].map(h => '<i style="height:' + h + '%"></i>').join('') + '</div></div>'
    + '<div class="jc-foot"><span><span class="led g"></span>' + L({ en: 'Lines nominal', id: 'Line normal' }) + '</span><span><span class="led r"></span>' + L({ en: '1 line changeover', id: '1 line changeover' }) + '</span><span style="margin-left:auto">' + L({ en: 'Output — last 7 days', id: 'Output — 7 hari terakhir' }) + '</span></div></div></div></section>';
}

export function mountManufacturing() {
  const panel = qs('#tpanel');
  if (!panel) return;
  const show = i => {
    const t = dTour()[i];
    qa('.tl-item').forEach((b, j) => b.classList.toggle('on', j === i));
    panel.innerHTML = '<div class="tour-panel"><div class="tour-art">' + blueprint() + '</div><div class="tour-info"><div class="tour-t"><span class="tno">' + t.n + '</span><h3>' + L(t.name) + '</h3><span class="jp">' + t.jp + '</span></div><p>' + L(t.d) + '</p><div class="tour-data">' + t.data.map(d => '<div><b>' + d[0] + '</b><span>' + d[1] + '</span></div>').join('') + '</div></div>'
      + '<div class="tour-ctl"><button class="tbtn" id="tprev">' + ic('arrl') + ' ' + L({ en: 'Prev', id: 'Sebelumnya' }) + '</button><span id="tprog">' + t.n + ' / 05</span><button class="tbtn" id="tnext">' + L({ en: 'Next', id: 'Berikutnya' }) + ' ' + ic('arrow') + '</button></div></div>';
    const prevBtn = qs('#tprev');
    const nextBtn = qs('#tnext');
    if (prevBtn) prevBtn.onclick = () => show((i + dTour().length - 1) % dTour().length);
    if (nextBtn) nextBtn.onclick = () => show((i + 1) % dTour().length);
  };
  qa('.tl-item').forEach(b => b.onclick = () => show(+b.dataset.i));
  show(0);
}
