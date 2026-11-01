import { dCo, dPillars, dC, dWhy, dTour, dIndustries, dWay, dN } from '../data/db.js';
import { blueprint } from '../components/blueprint.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { esc, qs, RM } from '../components/dom.js';
import { L } from '../i18n.js';

export function renderHome() {
  const co = dCo() || {};
  const vids = String(co.video || '').split(',').map(s => s.trim()).filter(Boolean);
  const heroLight = Math.max(10, Math.min(100, Number(co.heroLight !== undefined ? co.heroLight : 50)));
  const shadeOpacity = Math.max(0.08, Math.min(0.98, 1.05 - (heroLight / 100) * 0.90)).toFixed(2);
  const videoBrightness = (0.75 + (heroLight / 100) * 0.50).toFixed(2);
  const fallbackOpacity = Math.max(0.15, Math.min(0.85, 0.20 + (heroLight / 100) * 0.60)).toFixed(2);

  return '<section class="hero-v" id="herov">'
    + '<style>'
    + '#herov .hv-shade{opacity:' + shadeOpacity + '}'
    + '#herov .hv-media.playing video{opacity:1;filter:brightness(' + videoBrightness + ')}'
    + '#herov .hv-media.playing .hv-fallback{opacity:0!important;visibility:hidden!important;display:none!important}'
    + '#herov .hv-media:not(.playing) .hv-fallback{opacity:' + fallbackOpacity + '}'
    + '</style>'
    + '<div class="hv-media" id="hvm">'
    + '<div class="hv-fallback">' + blueprint() + '</div>'
    + (vids.length ? '<video id="hv" muted loop playsinline preload="metadata"' + (RM ? '' : ' autoplay') + '>' + vids.map(u => '<source src="' + esc(u) + '" type="' + (u.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4') + '">').join('') + '</video>' : '')
    + '<div class="hv-shade"></div></div>'
    + '<div class="hv-in"><div>'
    + '<div class="hv-kick">' + L({ en: 'PT Jidoka Result Indonesia — Industrial Packaging Solutions', id: 'PT Jidoka Result Indonesia — Solusi Kemasan Industri' }) + '</div>'
    + '<h1 class="hv-h1">' + L({ en: 'Package', id: 'Package' }) + '<br>' + L({ en: 'Your', id: 'Your' }) + '<br><span class="red">' + L({ en: 'Quality.', id: 'Quality.' }) + '</span></h1>'
    + '</div><div class="hv-bot">'
    + '<p>' + L({ en: 'Karton box, imprabox, partition and custom packaging for the manufacturing & automotive industry — serving domestic and export markets with Japanese manufacturing discipline.', id: 'Karton box, imprabox, partisi, dan custom packaging untuk industri manufaktur & otomotif — melayani pasar domestik dan ekspor dengan disiplin manufaktur Jepang.' }) + '</p>'
    + '<div class="hv-btns"><a class="btn btn-red" href="#/contact/rfq">' + ic('send') + ' ' + L({ en: 'Request Quotation', id: 'Permintaan Penawaran (RFQ)' }) + '</a><a class="btn btn-ghost" href="#/manufacturing">' + L({ en: 'Digital Factory Tour', id: 'Digital Factory Tour' }) + '</a></div>'
    + '</div></div>'
    + '<div class="hv-scroll">' + L({ en: 'Scroll ↓', id: 'Scroll ↓' }) + '</div></section>'
    + '<section class="sec"><div class="wrap"><div class="sec-head reveal"><span class="kicker">' + L({ en: 'From requirement to delivery', id: 'Dari Perencanaan Hingga Pengiriman' }) + '</span><h2 class="sec-title">' + L({ en: 'What we do', id: 'Fokus Solusi Kami' }) + '</h2><p class="sec-lead">' + L({ en: 'Four pillars that keep your packaging reliable — engineered, produced, inspected and delivered under one system.', id: 'Empat pilar keunggulan yang menjamin keandalan kemasan industri Anda — dirancang, diproduksi, diinspeksi, dan didistribusikan dalam satu sistem mutu terpadu.' }) + '</p></div>'
    + '<div class="grid4">' + dPillars().map(p => '<div class="pillar reveal"><span class="num">' + p.n + '</span>' + ic(p.i) + '<h3>' + L(p.t) + '</h3><p>' + L(p.d) + '</p></div>').join('') + '</div></div></section>'
    + '<section class="sec alt"><div class="wrap cap-grid"><div class="reveal"><span class="kicker">' + L({ en: 'Proof, not claim', id: 'Komitmen Kualitas Nyata' }) + '</span><h2 class="sec-title">' + L({ en: 'Our capabilities', id: 'Kapabilitas Manufaktur' }) + '</h2><p class="sec-lead">' + L({ en: 'Real numbers from a real factory — the same data our customers audit during supplier assessment.', id: 'Parameter terukur dari fasilitas produksi kami — data riil yang diaudit mitra pelanggan dalam proses supplier assessment.' }) + '</p>'
    + '<div class="cap-stats">' + dC().stats.map(s => '<div class="cap-stat"><b>' + esc(s[0]) + '<em>' + esc(s[1] || '') + '</em></b><span>' + esc(L(s[2])) + '</span></div>').join('') + '</div><p class="tiny">' + esc(L(dC().note)) + '</p></div>'
    + '<div class="reveal"><a href="#/manufacturing" class="blueprint" style="display:block" aria-label="' + L({ en: 'Digital Factory Tour — Packaging Line Blueprint', id: 'Tur Digital Pabrik — Blueprint Alur Produksi' }) + '">' + blueprint() + '</a></div></div></section>'
    + '<section class="sec dark"><div class="wrap"><div class="sec-head reveal"><span class="kicker">' + L({ en: 'Why Jidoka', id: 'Keunggulan Jidoka' }) + '</span><h2 class="sec-title">' + L({ en: 'Why us', id: 'Mengapa Memilih Kami' }) + '</h2><p class="sec-lead">' + L({ en: 'Four reasons customers keep their packaging with Jidoka — year after year.', id: 'Alasan utama para pelaku industri mempercayakan kebutuhan pasokan kemasan kepada Jidoka secara berkesinambungan.' }) + '</p></div>'
    + '<div class="grid4">' + dWhy().map(w => '<div class="why-card reveal">' + ic(w.i) + '<h3>' + L(w.t) + '</h3><p>' + L(w.d) + '</p></div>').join('') + '</div></div></section>'
    + '<section class="sec"><div class="wrap"><div class="sec-head reveal"><span class="kicker">' + L({ en: 'Digital Factory Tour', id: 'Tur Fasilitas Produksi' }) + '</span><h2 class="sec-title">' + L({ en: 'Our factory', id: 'Fasilitas Pabrik' }) + '</h2><p class="sec-lead">' + L({ en: 'Take a digital walk through our production flow — before you visit us in person.', id: 'Tinjau alur proses produksi berstandar modern kami secara digital sebelum verifikasi kunjungan langsung.' }) + '</p></div>'
    + '<div class="mini-tour">' + dTour().map(t => '<a class="mt-step" href="#/manufacturing"><span class="jp">' + t.jp + '</span><span class="n">' + t.n + '</span><b>' + L(t.name) + '</b></a>').join('') + '</div>'
    + '<div class="center"><a class="btn btn-line" href="#/manufacturing">' + ic('eye') + ' ' + L({ en: 'Explore our factory', id: 'Pelajari Fasilitas Pabrik' }) + '</a></div></div></section>'
    + '<section class="sec alt"><div class="wrap"><div class="sec-head reveal"><span class="kicker">' + L({ en: 'Industries we serve', id: 'Sektor Industri' }) + '</span><h2 class="sec-title">' + L({ en: 'Our customers / industries', id: 'Sektor Industri yang Kami Layani' }) + '</h2></div>'
    + '<div class="grid4">' + dIndustries().map(i => '<a class="ind-tile reveal" href="#/application/' + i.id + '">' + ic(i.i) + '<h3>' + L(i.name) + '</h3><p>' + esc(L(i.d)).slice(0, 90) + '…</p><span class="more">' + L({ en: 'Learn more', id: 'Selengkapnya' }) + ' ' + ic('arrow') + '</span></a>').join('') + '</div></div></section>'
    + '<section class="sec"><div class="wrap"><div class="sec-head reveal"><span class="kicker">' + L({ en: 'Japanese corporate DNA', id: 'Standar & Budaya Mutu Jepang' }) + '</span><h2 class="sec-title">' + L({ en: 'Our way', id: 'Our Way' }) + '</h2><p class="sec-lead">' + L({ en: 'Not decoration — this is our operating system and our differentiator.', id: 'Bukan sekadar dekorasi — nilai-nilai ini merupakan landasan operasional dan keunggulan kompetitif utama kami.' }) + '</p></div>'
    + '<div class="way-chips">' + dWay().slice(0, 4).map(w => '<div class="wchip reveal"><div class="kj">' + w.kj + '</div><b>' + w.n + '</b><span>' + L(w.s) + '</span></div>').join('') + '</div>'
    + '<div class="center"><a class="btn btn-line" href="#/way">' + ic('arrow') + ' ' + L({ en: 'See all principles', id: 'Pelajari Seluruh Nilai Perusahaan' }) + '</a></div></div></section>'
    + '<section class="sec alt"><div class="wrap"><div class="sec-head reveal"><span class="kicker">' + L({ en: 'Latest updates', id: 'Informasi Terkini' }) + '</span><h2 class="sec-title">' + L({ en: 'News & activities', id: 'Berita & Pengumuman' }) + '</h2></div>'
    + '<div class="grid3">' + dN().map(n => '<a class="news-card reveal" href="#/corporate"><div class="nc-top"><span class="date">' + esc(n.date) + '</span><span class="ncat">' + esc(L(n.cat)) + '</span></div><h3>' + esc(L(n.t)) + '</h3><p>' + esc(L(n.d)) + '</p><span class="more">' + L({ en: 'Read more', id: 'Baca Selengkapnya' }) + ' ' + ic('arrow') + '</span></a>').join('') + '</div></div></section>'
    + ctaBand();
}

export function mountHome() {
  const media = qs('#hvm'), v = qs('#hv'), fb = qs('#hvm .hv-fallback');
  if (media && v) {
    const ok = () => {
      media.classList.add('playing');
      if (fb) {
        fb.style.opacity = '0';
        fb.style.display = 'none';
      }
    };
    const fail = () => {
      if (v.parentNode) v.parentNode.removeChild(v);
      media.classList.remove('playing');
      if (fb) {
        fb.style.display = 'flex';
      }
    };
    if (v.readyState >= 2) ok();
    else {
      v.addEventListener('canplay', ok);
      v.addEventListener('playing', ok);
      v.addEventListener('error', fail);
    }
    const startPlay = () => {
      try {
        const p = v.play();
        if (p && p.catch) p.catch(fail);
      } catch (e) {
        fail();
      }
    };
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(startPlay, { timeout: 1000 });
    } else {
      setTimeout(startPlay, 100);
    }
    setTimeout(function () {
      if (!media.classList.contains('playing')) fail();
    }, 5000);
  }
}
