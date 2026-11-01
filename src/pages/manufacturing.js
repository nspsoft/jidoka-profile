import { dTour, dFlow, dMach } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ic } from '../components/icons.js';
import { blueprint } from '../components/blueprint.js';
import { qs, qa } from '../components/dom.js';
import { L } from '../i18n.js';

export function renderManufacturing() {
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Manufacturing', id: 'Produksi' })) + '<div class="wrap"><h1>' + L({ en: 'A factory you can audit from anywhere', id: 'Fasilitas Pabrik Berstandar Industri Presisi' }) + '</h1><p class="lead">' + L({ en: 'Factory, machines, process, technology and capacity — shown the way we run them every day.', id: 'Transparansi fasilitas pabrik, armada mesin modern, alur teknologi, serta kapasitas terpasang yang kami jalankan setiap hari.' }) + '</p></div></section>'
    + '<section class="sec"><div class="wrap"><div class="sec-head"><span class="kicker">' + L({ en: 'Digital Factory Tour', id: 'Tur Digital Pabrik' }) + ' — “' + L({ en: 'Explore Our Factory', id: 'Kunjungan Virtual' }) + '”</span><h2 class="sec-title">' + L({ en: 'Walk the flow, step by step', id: 'Alur Proses Manufaktur Terpadu' }) + '</h2><p class="sec-lead">' + L({ en: 'From raw material to delivery — with real data, real machines and the people behind them.', id: 'Dari penerimaan bahan baku hingga pengiriman akhir — ditopang data terukur, armada mesin presisi, dan operator berpengalaman.' }) + '</p></div>'
    + '<div class="tour"><div class="tour-list">' + dTour().map((t, i) => '<button class="tl-item ' + (i === 0 ? 'on' : '') + '" data-i="' + i + '"><span class="n">' + t.n + '</span><span><b>' + L(t.name) + '</b><small>' + t.jp + '</small></span></button>').join('') + '</div><div id="tpanel"></div></div></div></section>'
    + '<section class="sec alt"><div class="wrap"><div class="sec-head"><span class="kicker">' + L({ en: 'Trust builder', id: 'Integritas Mutu' }) + '</span><h2 class="sec-title">' + L({ en: 'From factory to business', id: 'Integrasi Pabrik Menuju Solusi Bisnis' }) + '</h2><p class="sec-lead">' + L({ en: 'Jidoka is a manufacturing system — not a trading company. Every requirement travels this path under one control.', id: 'Jidoka adalah sistem manufaktur terintegrasi — bukan perusahaan perantara. Seluruh spesifikasi dikendalikan langsung dalam satu sistem kendali mutu.' }) + '</p></div>'
    + '<div class="flow-wrap"><div class="flow">' + dFlow().map((f, i) => '<span class="fnode ' + (i === 0 ? 'first ' : '') + (i === dFlow().length - 1 ? 'last' : '') + '">' + f + '</span>' + (i < dFlow().length - 1 ? '<span class="farr">' + ic('arrow') + '</span>' : '')).join('') + '</div></div></div></section>'
    + '<section class="sec"><div class="wrap"><div class="sec-head"><span class="kicker">' + L({ en: 'Machines & equipment', id: 'Armada Mesin & Peralatan' }) + '</span><h2 class="sec-title">' + L({ en: 'Machine list', id: 'Daftar Mesin Produksi' }) + '</h2></div>'
    + '<div class="tbl"><table><tr><td style="width:34%">' + L({ en: 'Machine', id: 'Tipe Mesin' }) + '</td><td>' + L({ en: 'Qty', id: 'Jumlah' }) + '</td><td>' + L({ en: 'Max. width / range', id: 'Kapasitas / Lebar Maksimal' }) + '</td><td>' + L({ en: 'Capability', id: 'Kapabilitas & Output' }) + '</td></tr>'
    + dMach().map(m => '<tr><td style="width:34%;background:#fff">' + m[0] + '</td><td style="background:#fff">' + m[1] + '</td><td style="background:#fff">' + m[2] + '</td><td style="background:#fff">' + m[3] + '</td></tr>').join('') + '</table></div></div></section>'
    + '<section class="sec alt"><div class="wrap jc-grid"><div class="reveal"><span class="kicker">' + L({ en: 'Powered by JICOS', id: 'Didukung Sistem JICOS'}) + '</span><h2 class="sec-title">JICOS</h2>'
    + '<p class="sec-lead">' + L({ en: 'JICOS — Jidoka Integrated Control & Operating System — is our internal production control system. Production, quality and delivery data live in one dashboard.', id: 'JICOS (Jidoka Integrated Control & Operating System) merupakan sistem kontrol produksi terintegrasi kami. Monitoring produksi, jaminan mutu, dan pengiriman terhubung secara real-time dalam satu dasbor terpadu.' }) + '</p>'
    + '<ul class="jlist"><li>' + ic('checkc') + '<span>' + L({ en: 'Real-time line monitoring & heijunka scheduling', id: 'Pemantauan lini real-time & penjadwalan berimbang heijunka' }) + '</span></li><li>' + ic('checkc') + '<span>' + L({ en: 'Quality gates linked to lot traceability', id: 'Pemeriksaan mutu bertahap terhubung ke sistem penelusuran (lot traceability)' }) + '</span></li><li>' + ic('checkc') + '<span>' + L({ en: 'Delivery status visible from order to arrival', id: 'Visibilitas status pengiriman sejak pemesanan hingga tiba di lokasi' }) + '</span></li></ul>'
    + '<a class="btn btn-red" href="#/contact/rfq">' + ic('send') + ' ' + L({ en: 'Request Quotation', id: 'Permintaan Penawaran (RFQ)' }) + '</a></div>'
    + '<div class="jicos" id="jicos"><div class="jc-head"><span class="dots"><i></i><i></i><i></i></span> JICOS v3 — ' + L({ en: 'Live plant monitor (demo)', id: 'Monitor Pabrik Real-Time' }) + '<span class="live">' + L({ en: 'LIVE', id: 'LIVE' }) + '</span></div>'
    + '<div class="jc-body"><div class="jc-kpis"><div><b>87<span>%</span></b><small>' + L({ en: 'OEE today', id: 'OEE Hari Ini' }) + '</small></div><div><b>1,240</b><small>' + L({ en: 'Output today', id: 'Output Hari Ini' }) + '</small></div><div><b>98.4<span>%</span></b><small>' + L({ en: 'On-time delivery', id: 'Ketepatan Pengiriman' }) + '</small></div><div><b>8 / 8</b><small>' + L({ en: 'Lines running', id: 'Lini Beroperasi' }) + '</small></div></div>'
    + '<div class="jc-kpis"><div><b>4<span>/5</span></b><small>' + L({ en: 'QC gates passed', id: 'Tahap QC Terpenuhi' }) + '</small></div><div><b>36<span>min</span></b><small>' + L({ en: 'Avg. changeover', id: 'Rata-rata Changeover' }) + '</small></div><div><b>12</b><small>' + L({ en: 'Kaizen this month', id: 'Inisiatif Kaizen Bulan Ini' }) + '</small></div><div><b>0</b><small>' + L({ en: 'Safety incidents', id: 'Insiden Keselamatan' }) + '</small></div></div>'
    + '<div class="jc-bars">' + [62, 78, 55, 84, 70, 90, 76].map(h => '<i style="height:' + h + '%"></i>').join('') + '</div></div>'
    + '<div class="jc-foot"><span><span class="led g"></span>' + L({ en: 'Lines nominal', id: 'Lini Operasional Normal' }) + '</span><span><span class="led r"></span>' + L({ en: '1 line changeover', id: '1 Lini Sedang Changeover' }) + '</span><span style="margin-left:auto">' + L({ en: 'Output — last 7 days', id: 'Tren Output 7 Hari Terakhir' }) + '</span></div></div></div></section>';
}

let tourMediaMode = 'video';

function renderTourMedia(t, mode = 'video') {
  const videoUrl = (t && t.video ? t.video.trim() : '');
  const hasVideo = !!videoUrl;
  const isVideo = hasVideo && mode === 'video';

  const switcher = hasVideo ? (
    '<div class="tour-media-switch">'
    + '<button type="button" class="' + (isVideo ? 'on' : '') + '" data-tourmode="video">' + ic('play') + ' ' + L({ en: 'Factory Video', id: 'Video Pabrik' }) + '</button>'
    + '<button type="button" class="' + (!isVideo ? 'on' : '') + '" data-tourmode="blueprint">' + ic('gear') + ' ' + L({ en: 'Blueprint', id: 'Diagram Cetak Biru' }) + '</button>'
    + '</div>'
  ) : '';

  let mediaHtml = '';
  if (isVideo) {
    const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      mediaHtml = '<div class="tour-video-wrap"><iframe class="tour-video" src="https://www.youtube-nocookie.com/embed/' + ytMatch[1] + '?autoplay=1&mute=1&loop=1&playlist=' + ytMatch[1] + '&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
    } else {
      mediaHtml = '<div class="tour-video-wrap"><video class="tour-video" controls autoplay muted loop playsinline poster="' + (t.poster || '') + '"><source src="' + videoUrl + '" type="video/mp4"><source src="' + videoUrl + '" type="video/webm"><p>Browser Anda tidak mendukung pemutar video HTML5.</p></video></div>';
    }
  } else {
    mediaHtml = blueprint();
  }

  return '<div class="tour-art" id="tourart">' + switcher + mediaHtml + '</div>';
}

export function mountManufacturing() {
  const panel = qs('#tpanel');
  if (!panel) return;
  let currentStep = 0;
  const show = (i, mode = tourMediaMode) => {
    currentStep = i;
    tourMediaMode = mode;
    const tourList = dTour() || [];
    const t = tourList[i];
    if (!t) return;
    qa('.tl-item').forEach((b, j) => b.classList.toggle('on', j === i));
    panel.innerHTML = '<div class="tour-panel">' + renderTourMedia(t, tourMediaMode) + '<div class="tour-info"><div class="tour-t"><span class="tno">' + t.n + '</span><h3>' + L(t.name) + '</h3><span class="jp">' + t.jp + '</span></div><p>' + L(t.d) + '</p><div class="tour-data">' + (t.data || []).map(d => '<div><b>' + d[0] + '</b><span>' + d[1] + '</span></div>').join('') + '</div></div>'
      + '<div class="tour-ctl"><button class="tbtn" id="tprev">' + ic('arrl') + ' ' + L({ en: 'Prev', id: 'Sebelumnya' }) + '</button><span id="tprog">' + t.n + ' / 05</span><button class="tbtn" id="tnext">' + L({ en: 'Next', id: 'Berikutnya' }) + ' ' + ic('arrow') + '</button></div></div>';
    
    qa('[data-tourmode]').forEach(btn => {
      btn.onclick = () => {
        show(currentStep, btn.dataset.tourmode);
      };
    });

    const prevBtn = qs('#tprev');
    const nextBtn = qs('#tnext');
    if (prevBtn) prevBtn.onclick = () => show((i + tourList.length - 1) % tourList.length);
    if (nextBtn) nextBtn.onclick = () => show((i + 1) % tourList.length);
  };
  qa('.tl-item').forEach(b => b.onclick = () => show(+b.dataset.i));
  show(0);
}
