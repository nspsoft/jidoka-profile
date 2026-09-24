import { dP } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { esc, qs, qa } from '../components/dom.js';
import { L } from '../i18n.js';
import { renderProducts } from './products.js';
import { init3DViewer } from '../components/viewer3d.js';

let activeViewer = null;

function renderProductShowcase(p) {
  const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : [];
  const hasPhotos = images.length > 0;
  const defaultMode = hasPhotos ? 'photo' : '3d';

  return '<div class="pd-showcase" id="pdshowcase">'
    + '<div class="pd-showcase-bar">'
    + '<div class="pd-media-switch" id="pdswitch">'
    + (hasPhotos ? '<button type="button" class="' + (defaultMode === 'photo' ? 'on' : '') + '" data-view="photo">' + ic('eye') + ' ' + L({ en: 'Photos (' + images.length + ')', id: 'Foto Produk (' + images.length + ')' }) + '</button>' : '')
    + '<button type="button" class="' + (defaultMode === '3d' ? 'on' : '') + '" data-view="3d">' + ic('box') + ' ' + L({ en: '3D Interactive 360°', id: '3D Interaktif 360°' }) + '</button>'
    + '</div>'
    + '<span class="pd-showcase-pill">' + esc(p.name) + '</span>'
    + '</div>'
    + '<div class="pd-stage" id="pdstage">'
    + (hasPhotos
        ? '<img src="' + esc(images[0]) + '" alt="' + esc(p.name) + '" class="pd-stage-photo" id="mainphoto">'
        : '<div class="pd-stage-3d" id="stage3d"></div>'
      )
    + '</div>'
    + (hasPhotos ? (
      '<div class="pd-thumbs" id="pdthumbs">'
      + images.map((img, idx) => '<button type="button" class="pd-thumb ' + (idx === 0 ? 'on' : '') + '" data-idx="' + idx + '" data-src="' + esc(img) + '"><img src="' + esc(img) + '" alt="' + esc(p.name) + ' - ' + (idx + 1) + '"></button>').join('')
      + '</div>'
    ) : '')
    + '</div>';
}

export function renderProduct(id) {
  const P = dP();
  const i = P.findIndex(p => p.id === id);
  if (i < 0) return renderProducts();
  const p = P[i], prev = P[(i - 1 + P.length) % P.length], next = P[(i + 1) % P.length];
  return '<section class="page-hero">' + crumbs({ href: '#/products', label: L({ en: 'Products', id: 'Produk' }) }, esc(p.name)) + '<div class="wrap"><h1>' + esc(p.name) + '</h1><p class="lead">' + esc(L(p.lead)) + '</p></div></section>'
    + '<section class="sec" style="padding-top:8px"><div class="wrap"><div class="pd-grid"><div class="pd-main">'
    + renderProductShowcase(p)
    + '<h4>' + L({ en: 'Material', id: 'Material' }) + '</h4><p class="profile-p">' + esc(p.material) + '</p>'
    + '<h4>' + L({ en: 'Specification', id: 'Spesifikasi' }) + '</h4><div class="tbl"><table>' + p.spec.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>').join('') + '</table></div>'
    + '<h4>' + L({ en: 'Manufacturing capability', id: 'Kapabilitas manufaktur' }) + '</h4><div class="tbl"><table>' + p.mfg.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>').join('') + '</table></div>'
    + '<h4>' + L({ en: 'Application', id: 'Aplikasi' }) + '</h4><div class="chips-row">' + p.apps.map(a => '<span class="chip s">' + esc(a) + '</span>').join('') + '</div>'
    + '<h4>' + L({ en: 'Quality', id: 'Kualitas' }) + '</h4><div class="tbl"><table>' + p.quality.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>').join('') + '</table></div>'
    + '<div class="pd-nav"><a class="pdlink" href="#/product/' + esc(prev.id) + '">' + ic('arrl') + '<span><small>' + L({ en: 'Previous', id: 'Sebelumnya' }) + '</small><b>' + esc(prev.name) + '</b></span></a>'
    + '<a class="pdlink r" href="#/product/' + esc(next.id) + '"><span><small>' + L({ en: 'Next', id: 'Berikutnya' }) + '</small><b>' + esc(next.name) + '</b></span>' + ic('arrow') + '</a></div>'
    + '</div><aside class="pd-side"><div class="side-card"><div class="side-b"><span class="cat">' + esc(L(p.cat)) + '</span><h3>' + esc(p.name) + '</h3>'
    + '<p class="tiny">' + L({ en: 'Every RFQ you send arrives with full technical data — our sales engineer can quote faster and more accurately.', id: 'Setiap RFQ yang Anda kirim masuk dengan data teknis lengkap — penawaran lebih cepat dan akurat.' }) + '</p>'
    + '<div style="display:flex;flex-direction:column;gap:12px;margin-top:16px">'
    + '<a class="btn btn-red" style="width:100%" href="#/contact/rfq/' + esc(p.id) + '">' + ic('send') + ' ' + L({ en: 'Request quotation', id: 'Minta penawaran' }) + '</a>'
    + '<a class="btn btn-line" style="width:100%" href="#/resources">' + ic('download') + ' ' + L({ en: 'Spec sheet (PDF)', id: 'Spec sheet (PDF)' }) + '</a>'
    + '</div>'
    + '</div></div></aside></div></div></section>' + ctaBand();
}

export function mountProduct(id) {
  const showcase = qs('#pdshowcase');
  if (!showcase) return;
  const P = dP();
  const p = P.find(item => item.id === id);
  if (!p) return;

  const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : [];
  const stage = qs('#pdstage');
  const swBtns = qa('#pdswitch button');
  const thumbs = qa('.pd-thumb');

  let currentView = images.length > 0 ? 'photo' : '3d';

  const setView = view => {
    currentView = view;
    swBtns.forEach(b => b.classList.toggle('on', b.dataset.view === view));
    if (activeViewer) {
      activeViewer.destroy();
      activeViewer = null;
    }

    if (view === 'photo') {
      const activeThumb = qs('.pd-thumb.on');
      const activeSrc = activeThumb ? activeThumb.dataset.src : (images[0] || '');
      stage.innerHTML = '<img src="' + esc(activeSrc) + '" alt="' + esc(p.name) + '" class="pd-stage-photo" id="mainphoto">';
      const thEl = qs('#pdthumbs');
      if (thEl) thEl.style.display = 'flex';
    } else if (view === '3d') {
      stage.innerHTML = '<div class="pd-stage-3d" id="stage3d"></div>';
      const thEl = qs('#pdthumbs');
      if (thEl) thEl.style.display = 'none';
      const stage3d = qs('#stage3d');
      if (stage3d) {
        activeViewer = init3DViewer(stage3d, {
          type: p.art || 'box',
          modelUrl: p.model3d || '',
          productName: p.name
        });
      }
    }
  };

  swBtns.forEach(b => {
    b.onclick = () => setView(b.dataset.view);
  });

  thumbs.forEach(t => {
    t.onclick = () => {
      thumbs.forEach(other => other.classList.remove('on'));
      t.classList.add('on');
      if (currentView !== 'photo') setView('photo');
      const mainImg = qs('#mainphoto');
      if (mainImg) {
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = t.dataset.src;
          mainImg.style.opacity = '1';
        }, 150);
      }
    };
  });

  // Start 3D engine if initially selected
  if (currentView === '3d') {
    setView('3d');
  }
}
