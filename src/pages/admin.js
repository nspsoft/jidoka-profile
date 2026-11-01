import { DB, dbRead, dbWrite, DEF, dP, dN, dC, dR, dCo, dPillars, dWhy, dIndustries, dTour, dMach, dFlow, dCerts, dWay, dHist, dGov } from '../data/db.js';
import { isLogged, doLogin, doMfaLogin, doLogout, authFetch, getUser, getMfaStatus, setupMfa, verifyMfaSetup, disableMfa, regenerateBackupCodes, getUsers, createUser, updateUser, deleteUser, resetUserMfa } from '../data/auth.js';
import { esc, qs, qa, lines, parsePairs, slug } from '../components/dom.js';
import { logo, ic } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { fText, fTa, fBi, fBiTa, fSel } from '../components/forms.js';
import { blueprint } from '../components/blueprint.js';
import { L } from '../i18n.js';

export { isLogged, doLogin, doLogout };

let cachedLeads = [];
let currentMfaTicket = null;
let isBackupMode = false;

export async function fetchLeads() {
  try {
    const res = await authFetch('/api/leads');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        cachedLeads = json.data;
        return cachedLeads;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch leads:', e.message);
  }
  return cachedLeads;
}

export function aDash() {
  const st = dbRead();
  const ov = Object.keys(st).filter(k => k !== 'settings').length;
  const cnt = k => (st[k] !== undefined ? st[k] : DEF[k]).length;
  const newLeads = cachedLeads.filter(l => l.status === 'new').length;
  return '<h3>Dashboard CMS</h3><div class="stat-mini" style="margin-top:16px">'
    + '<div><b>' + cnt('products') + '</b><span class="mini" style="display:block;margin-top:4px">Produk</span></div>'
    + '<div><b>' + cnt('news') + '</b><span class="mini" style="display:block;margin-top:4px">Berita</span></div>'
    + '<div><b>' + cnt('resources') + '</b><span class="mini" style="display:block;margin-top:4px">Dokumen</span></div>'
    + '<div><b>' + cachedLeads.length + (newLeads ? ' <small style="color:var(--red);font-size:14px">(' + newLeads + ' baru)</small>' : '') + '</b><span class="mini" style="display:block;margin-top:4px">Pesan Masuk (RFQ)</span></div></div>'
    + '<p class="tiny" style="margin-top:18px">Pilih menu navigasi untuk mengelola konten website dan permohonan penawaran harga. Seluruh data tersimpan otomatis di database server.</p>';
}

export function aInbox() {
  if (!cachedLeads.length) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3>Pesan Masuk (RFQ) (0)</h3><button class="btn btn-line btn-sm" id="refinbox">↻ Refresh</button></div>'
      + '<p class="tiny">Daftar permintaan penawaran harga (RFQ) dan pesan pelanggan dari formulir website.</p>'
      + '<p class="empty" style="padding:40px 0;text-align:center">Belum ada pesan atau RFQ masuk.</p>';
  }

  const unhandled = cachedLeads.filter(l => l.status === 'new').length;
  return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3>Pesan Masuk (RFQ) (' + cachedLeads.length + (unhandled ? ' · <span style="color:var(--red)">' + unhandled + ' Baru</span>' : '') + ')</h3><button class="btn btn-line btn-sm" id="refinbox">↻ Refresh</button></div>'
    + '<p class="tiny">Klik salah satu baris untuk melihat detail spesifikasi RFQ / pesan pelanggan.</p>'
    + cachedLeads.map(l => {
      const p = l.payload || {};
      const sender = p.Company || p.Organization || p.Name || p['Perusahaan'] || p['Nama'] || 'Tanpa Nama';
      const contact = p.Email || p.Phone || p['Telepon'] || '';
      const dateStr = l.created_at ? new Date(l.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
      const rows = Object.entries(p).filter(([k]) => !k.startsWith('_')).map(([k, v]) => '<tr><td>' + esc(k) + '</td><td>' + esc(v) + '</td></tr>').join('');
      return '<div class="inbox-item" id="lead-' + l.id + '">'
        + '<div class="inbox-head" data-lead-toggle="' + l.id + '">'
        + '<div class="inbox-head-l">'
        + '<span class="tag-type tag-' + esc(l.type) + '">' + esc(l.type) + '</span>'
        + '<b>' + esc(sender) + '</b>'
        + (contact ? '<span class="mini">(' + esc(contact) + ')</span>' : '')
        + '</div>'
        + '<div class="inbox-head-r">'
        + '<span class="mini">' + esc(dateStr) + '</span>'
        + '<span class="tag-status ' + (l.status === 'new' ? 'new' : 'handled') + '">' + (l.status === 'new' ? 'Baru' : 'Handled') + '</span>'
        + '</div></div>'
        + '<div class="inbox-body">'
        + (p.refId ? '<div style="margin-bottom:10px"><b style="font-size:12px;letter-spacing:.05em;color:var(--mut)">REF: ' + esc(p.refId) + '</b></div>' : '')
        + '<table class="lead-tbl">' + rows + '</table>'
        + '<div style="margin-top:14px;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">'
        + (l.status === 'new' ? '<button class="btn btn-red btn-sm" data-lead-handle="' + l.id + '">✓ Tandai Handled</button>' : '<button class="btn btn-line btn-sm" data-lead-unhandle="' + l.id + '">↺ Tandai Baru</button>')
        + '<button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:6px 12px" data-lead-del="' + l.id + '">' + ic('trash') + ' Hapus</button>'
        + '</div></div></div>';
    }).join('');
}

export function aProducts() {
  return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3>Produk (' + dP().length + ')</h3><button class="btn btn-red btn-sm" id="addp">' + ic('plus') + ' Tambah Produk</button></div>'
    + '<p class="tiny">Perubahan langsung muncul di menu Products, dropdown navigasi, search, dan form RFQ.</p>'
    + dP().map((p, i) => '<div class="adm-row"><div><b>' + esc(p.name) + '</b> <span class="mini">' + esc(L(p.cat)) + ' · /' + esc(p.id) + '</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd="' + i + '">' + ic('trash') + '</button></div></div>').join('')
    + '<div id="ped"></div>';
}

export function aProdForm(i) {
  const P = dP();
  const p = i >= 0 ? P[i] : { id: '', art: 'box', cat: { en: '', id: '' }, name: '', lead: { en: '', id: '' }, material: '', spec: [], mfg: [], apps: [], quality: [], images: [], model3d: '' };
  const pairs = a => (a || []).map(r => r[0] + ' | ' + r[1]).join('\n');
  const pImages = Array.isArray(p.images) ? p.images : [];
  const pModel3d = p.model3d || '';

  return '<form id="pform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + '<input type="hidden" name="images_json" id="pimagesjson" value="' + esc(JSON.stringify(pImages)) + '">'
    + fText('name', 'Nama Produk', p.name, 1)
    + fText('iden', 'Slug URL (huruf kecil, tanpa spasi)', p.id, 1)
    + fSel('art', 'Ilustrasi / Model 3D Bawaan', ['box', 'part', 'roll', 'sheet', 'cust'], p.art)
    + fBi('cat', 'Kategori', p.cat)
    + fBiTa('lead', 'Deskripsi Singkat', p.lead)
    + fText('material', 'Material', p.material)

    // Multi-photo gallery section
    + '<div class="f-full" style="background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px;margin:8px 0">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">'
    + '<div><b style="display:flex;align-items:center;gap:6px">' + ic('check') + ' Galeri Multi-Foto Produk</b>'
    + '<p class="mini" style="margin:2px 0 0;color:var(--mut)">Unggah foto produk asli (bisa pilih banyak sekaligus). Foto pertama otomatis menjadi foto utama (cover).</p></div>'
    + '<div style="display:flex;gap:8px;align-items:center">'
    + '<input type="file" id="pimagesfile" accept="image/*" multiple style="display:none">'
    + '<button type="button" class="btn btn-line btn-sm" id="btnpickpimages">' + ic('plus') + ' Pilih & Unggah Foto</button>'
    + '</div></div>'
    + '<div id="pimagesmsg" class="mini" style="margin-bottom:8px"></div>'
    + '<div id="pimagesgrid" class="adm-photogrid"></div>'
    + '</div>'

    // 3D Model file section
    + '<div class="f-full" style="background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px;margin:8px 0">'
    + '<div style="margin-bottom:10px">'
    + '<b style="display:flex;align-items:center;gap:6px">🧊 File Model 3D Kustom (.glb / .gltf)</b>'
    + '<p class="mini" style="margin:2px 0 0;color:var(--mut)">Opsional. Jika dikosongkan, website otomatis menggunakan 3D Canvas interaktif 360° bawaan sesuai jenis Ilustrasi di atas.</p>'
    + '</div>'
    + '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'
    + '<input type="text" name="model3d" id="pmodel3durl" value="' + esc(pModel3d) + '" placeholder="URL file .glb (mis. /uploads/box.glb)" style="flex:1;min-width:260px">'
    + '<input type="file" id="pmodel3dfile" accept=".glb,.gltf" style="display:none">'
    + '<button type="button" class="btn btn-line btn-sm" id="btnpickpmodel3d">Unggah File .glb</button>'
    + '</div>'
    + '<div id="pmodel3dmsg" class="mini" style="margin-top:6px"></div>'
    + '</div>'

    + fTa('spec', 'Spesifikasi — satu per baris, format: Label | Nilai', pairs(p.spec))
    + fTa('mfg', 'Kapabilitas Manufaktur — format: Label | Nilai', pairs(p.mfg))
    + fTa('apps', 'Aplikasi — satu per baris', (p.apps || []).join('\n'))
    + fTa('quality', 'Quality — format: Label | Nilai', pairs(p.quality))
    + '<div class="f-full" style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-red">Simpan Produk</button><button type="button" class="btn btn-line" id="pcancel">Batal</button></div></form>';
}

export function saveProd(fd) {
  const P = dP();
  const i = +fd.i;
  let id = (fd.iden || '').trim() || slug(fd.name);
  if (i < 0 && P.some(p => p.id === id)) id = id + '-' + (P.length + 1);
  let imgs = [];
  try {
    imgs = JSON.parse(fd.images_json || '[]');
  } catch (e) {
    imgs = [];
  }
  const o = {
    id: id,
    art: fd.art,
    name: fd.name.trim() || 'Produk',
    cat: { en: fd.cat_en || fd.cat_id, id: fd.cat_id || fd.cat_en },
    lead: { en: fd.lead_en, id: fd.lead_id },
    material: fd.material,
    images: Array.isArray(imgs) ? imgs : [],
    model3d: (fd.model3d || '').trim(),
    spec: parsePairs(fd.spec),
    mfg: parsePairs(fd.mfg),
    apps: lines(fd.apps),
    quality: parsePairs(fd.quality)
  };
  if (i >= 0) P[i] = o;
  else P.push(o);
  DB.set('products', P);
}

export function aNews() {
  return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3>Berita & Aktivitas (' + dN().length + ')</h3><button class="btn btn-red btn-sm" id="addn">' + ic('plus') + ' Tambah Berita</button></div>'
    + '<p class="tiny">Ditampilkan di beranda (bagian Berita) — pembaruan kegiatan dan pengumuman resmi perusahaan.</p>'
    + dN().map((n, i) => '<div class="adm-row"><div><b>' + esc(L(n.t)) + '</b> <span class="mini">' + esc(n.date) + ' · ' + esc(L(n.cat)) + '</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-ne="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-nd="' + i + '">' + ic('trash') + '</button></div></div>').join('')
    + '<div id="ned"></div>';
}

export function aNewsForm(i) {
  const N = dN();
  const n = i >= 0 ? N[i] : { date: '', cat: { en: '', id: '' }, t: { en: '', id: '' }, d: { en: '', id: '' } };
  return '<form id="nform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fText('date', 'Tanggal (mis. Sep 2026)', n.date, 1)
    + fBi('cat', 'Kategori', n.cat)
    + fBiTa('t', 'Judul', n.t)
    + fBiTa('d', 'Deskripsi', n.d)
    + '<div class="f-full" style="display:flex;gap:10px"><button class="btn btn-red">Simpan Berita</button><button type="button" class="btn btn-line" id="ncancel">Batal</button></div></form>';
}

export function saveNews(fd) {
  const N = dN();
  const i = +fd.i;
  const o = {
    date: fd.date,
    cat: { en: fd.cat_en || fd.cat_id, id: fd.cat_id || fd.cat_en },
    t: { en: fd.t_en, id: fd.t_id },
    d: { en: fd.d_en, id: fd.d_id }
  };
  if (i >= 0) N[i] = o;
  else N.unshift(o);
  DB.set('news', N);
}

export function aCaps() {
  const c = dC();
  return '<h3>Data Kapabilitas Pabrik</h3><p class="tiny">Ditampilkan di beranda — bagian parameter dan indikator riil kapasitas produksi pabrik.</p>'
    + '<form id="cform" class="form" style="margin-top:14px">'
    + c.stats.map((x, i) => '<div class="f f-full" style="border:1px solid var(--line);border-radius:10px;padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:10px"><b style="grid-column:1/-1;font:700 12px \'Barlow\';letter-spacing:.1em;color:var(--mut)">STATISTIK ' + (i + 1) + '</b>'
      + '<input name="v' + i + '" value="' + esc(x[0]) + '" placeholder="Nilai (mis. 3,000)"><input name="s' + i + '" value="' + esc(x[1] || '') + '" placeholder="Suffix (mis. +)">'
      + '<input name="le' + i + '" value="' + esc(x[2].en) + '" placeholder="Label (EN)"><input name="li' + i + '" value="' + esc(x[2].id) + '" placeholder="Label (ID)"></div>').join('')
    + fBiTa('note', 'Catatan kecil di bawah angka', c.note)
    + '<div class="f-full"><button class="btn btn-red">Simpan Kapabilitas</button></div></form>';
}

export function saveCaps(fd) {
  const stats = [];
  for (let i = 0; i < 4; i++) {
    stats.push([fd['v' + i] || '', fd['s' + i] || '', { en: fd['le' + i] || '', id: fd['li' + i] || '' }]);
  }
  DB.set('caps', { stats: stats, note: { en: fd.note_en || '', id: fd.note_id || '' } });
}

export function aRes() {
  return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3>Dokumen (' + dR().length + ')</h3><button class="btn btn-red btn-sm" id="addr">' + ic('plus') + ' Tambah Dokumen</button></div>'
    + '<p class="tiny">Ditampilkan di halaman Dokumen — pusat unduhan katalog produk dan profil resmi perusahaan.</p>'
    + dR().map((r, i) => '<div class="adm-row"><div><b>' + esc(L(r.name)) + '</b> <span class="mini">' + esc(r.meta) + ' · ' + esc(r.size) + '</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-re="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-rd="' + i + '">' + ic('trash') + '</button></div></div>').join('')
    + '<div id="red"></div>';
}

export function aResForm(i) {
  const R = dR();
  const r = i >= 0 ? R[i] : { i: 'file', name: { en: '', id: '' }, d: { en: '', id: '' }, meta: '', size: '', url: '' };
  return '<form id="rform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fSel('ric', 'Ikon', ['building', 'file', 'award', 'factory'], r.i)
    + fText('meta', 'Label Format (mis. PDF • EN / ID)', r.meta, 1)
    + fText('size', 'Ukuran (mis. 4.2 MB)', r.size)
    + fBi('name', 'Nama Dokumen', r.name)
    + fBiTa('d', 'Deskripsi', r.d)
    + '<div class="f f-full" style="background:var(--bg);border:1px dashed var(--line);border-radius:10px;padding:14px">'
    + '<b style="font:700 12px \'Barlow\';letter-spacing:.1em;color:var(--navy);display:block;margin-bottom:8px">UNGGAH FILE DOKUMEN KE SERVER (PDF / DOC / ZIP)</b>'
    + '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'
    + '<input type="file" id="resuploadfile" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.ppt,.pptx">'
    + '<button type="button" class="btn btn-line btn-sm" id="btnuploadres">' + ic('download') + ' Unggah ke Server</button>'
    + '<span id="uploadmsg" class="mini">Maksimal 25 MB</span>'
    + '</div></div>'
    + fText('url', 'URL Publik Dokumen (terisi otomatis setelah unggah)', r.url || '')
    + '<div class="f-full" style="display:flex;gap:10px"><button class="btn btn-red">Simpan Dokumen</button><button type="button" class="btn btn-line" id="rcancel">Batal</button></div></form>';
}

export function saveRes(fd) {
  const R = dR();
  const i = +fd.i;
  const o = {
    i: fd.ric,
    name: { en: fd.name_en || fd.name_id, id: fd.name_id || fd.name_en },
    d: { en: fd.d_en || fd.d_id, id: fd.d_id || fd.d_en },
    meta: fd.meta,
    size: fd.size,
    url: fd.url || ''
  };
  if (i >= 0) R[i] = o;
  else R.push(o);
  DB.set('resources', R);
}

export function aProfile() {
  const co = dCo() || {};
  const t1 = co.logoText1 || 'JIDOKA RESULT';
  const t2 = co.logoText2 || 'INDONESIA';
  const logoUrl = co.logoUrl || '';
  const desc = co.desc || {
    en: 'PT Jidoka Result Indonesia is an industrial packaging manufacturer built on Japanese manufacturing discipline — producing carton box, imprabox, partition, and custom packaging for automotive, steel, and industrial sectors.',
    id: 'PT Jidoka Result Indonesia adalah produsen packaging industri yang dibangun di atas disiplin manufaktur Jepang — memproduksi karton box, imprabox, partisi, dan custom packaging untuk sektor otomotif, baja, dan industri.'
  };

  const previewDisplay = (bgClass) => {
    return '<div class="logo-preview-card ' + bgClass + '">'
      + '<div class="lp-label">' + (bgClass === 'light' ? 'Tampilan Header (Light)' : 'Tampilan Footer (Dark)') + '</div>'
      + '<div class="logo-preview-display">'
      + '<div class="logo">' + logo(logoUrl, co.name || 'JRI') + '<span class="logo-t"><b>' + esc(t1) + '</b><i>' + esc(t2) + '</i></span></div>'
      + '</div></div>';
  };

  return '<h3>Profil & Logo Perusahaan</h3>'
    + '<p class="tiny">Kelola logo visual perusahaan, teks brand header/footer, slogan, tagline, dan profil resmi bisnis.</p>'
    + '<div class="logo-preview-box" id="logopreviewbox">'
    + previewDisplay('light')
    + previewDisplay('dark')
    + '</div>'
    + '<form id="profform" class="form" style="margin-top:14px">'
    + '<div class="f f-full" style="background:var(--bg);border:1px dashed var(--line);border-radius:10px;padding:16px">'
    + '<b style="font:700 12px \'Barlow\';letter-spacing:.1em;color:var(--navy);display:block;margin-bottom:8px">UNGGAH FILE LOGO KE SERVER (PNG / SVG / WEBP / JPG)</b>'
    + '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'
    + '<input type="file" id="logouploadfile" accept="image/png,image/svg+xml,image/webp,image/jpeg,image/gif">'
    + '<button type="button" class="btn btn-line btn-sm" id="btnuploadlogo">' + ic('download') + ' Unggah File Logo</button>'
    + '<button type="button" class="btn btn-sm" style="color:var(--mut);border:1px solid var(--line);background:#fff;border-radius:8px;padding:8px 12px" id="btnresetlogo">Gunakan Logo SVG Bawaan</button>'
    + '<span id="logouploadmsg" class="mini">Maksimal 5 MB • Format transparan (PNG/SVG) disarankan</span>'
    + '</div></div>'
    + fText('logoUrl', 'URL / Path Gambar Logo (kosongkan untuk SVG default)', logoUrl)
    + fText('name', 'Nama Resmi Perusahaan', co.name || 'PT Jidoka Result Indonesia', 1)
    + fText('logoText1', 'Teks Logo Baris 1 (Header/Footer)', t1, 1)
    + fText('logoText2', 'Teks Logo Baris 2 (Header/Footer)', t2, 1)
    + fText('motto', 'Motto Perusahaan (mis. PACKAGE YOUR QUALITY.)', co.motto || 'PACKAGE YOUR QUALITY.', 1)
    + fText('tagline', 'Tagline Bisnis (Footer)', co.tagline || 'Our website is not our company profile. It is our Digital Salesman, Corporate Window, and 24/7 Business Development Platform.', 1)
    + fBiTa('desc', 'Deskripsi Ringkas Perusahaan (Bilingual)', desc)
    + '<div class="f-full"><button class="btn btn-red">Simpan Profil & Logo</button></div></form>';
}

export function saveProfile(fd) {
  const co = dCo() || {};
  const updated = {
    ...co,
    name: (fd.name || '').trim() || 'PT Jidoka Result Indonesia',
    logoUrl: (fd.logoUrl || '').trim(),
    logoText1: (fd.logoText1 || '').trim() || 'JIDOKA RESULT',
    logoText2: (fd.logoText2 || '').trim() || 'INDONESIA',
    motto: (fd.motto || '').trim() || 'PACKAGE YOUR QUALITY.',
    tagline: (fd.tagline || '').trim(),
    desc: {
      en: (fd.desc_en || '').trim(),
      id: (fd.desc_id || '').trim()
    }
  };
  DB.set('company', updated);
}

export function fVideoHeroBlock(videoUrl) {
  return '<div class="f f-full" style="background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:16px 18px;margin:8px 0">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px">'
    + '<div>'
    + '<label style="margin:0;font-size:13.5px;color:var(--navy);font-weight:700;display:flex;align-items:center;gap:7px">'
    + ic('play') + ' Video Background Hero Beranda (MP4 / WebM)'
    + '</label>'
    + '<span class="mini" style="color:var(--mut);display:block;margin-top:2px">Format MP4 atau WebM, rasio 16:9, maksimal 100 MB.</span>'
    + '</div>'
    + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
    + '<input type="file" data-video-file-input accept="video/mp4,video/webm" style="display:none">'
    + '<button type="button" class="btn btn-red btn-sm" data-btn-pick-video style="display:inline-flex;align-items:center;gap:6px">'
    + ic('download') + ' Unggah Video dari Komputer'
    + '</button>'
    + '<button type="button" class="btn btn-line btn-sm" data-btn-reset-video title="Kembalikan ke video pabrik bawaan">'
    + 'Reset ke factory.mp4'
    + '</button>'
    + '</div>'
    + '</div>'
    + '<div style="margin-top:6px">'
    + '<label style="font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--mut);margin-bottom:4px;display:block">URL / Path File Video Aktif</label>'
    + '<input name="video" data-video-input value="' + esc(videoUrl || '') + '" placeholder="factory.mp4, /uploads/... atau https://…/video.mp4" style="background:#fff">'
    + '<div data-video-msg class="mini" style="margin-top:6px;line-height:1.6;color:var(--mut)">'
    + 'Klik tombol merah di atas untuk upload file video langsung dari komputer, atau letakkan file di folder website (mis. <b>factory.mp4</b>), atau tempel link video online (.mp4). Jika video tidak tersedia, otomatis menampilkan background animasi blueprint.'
    + '</div>'
    + '</div>'
    + '</div>';
}

export function fHeroLight(curVal, videoUrl) {
  const val = Math.max(10, Math.min(100, Number(curVal !== undefined ? curVal : 50)));
  const shadeOpacity = Math.max(0.08, Math.min(0.98, 1.05 - (val / 100) * 0.90)).toFixed(2);
  const videoOpacity = Math.max(0.20, Math.min(1.0, 0.25 + (val / 100) * 0.70)).toFixed(2);
  const videoBrightness = (0.75 + (val / 100) * 0.50).toFixed(2);
  const fallbackOpacity = Math.max(0.15, Math.min(0.85, 0.20 + (val / 100) * 0.60)).toFixed(2);

  const getLabel = v => {
    if (v < 35) return '🌙 Redup / Gelap';
    if (v < 65) return '⚖️ Normal / Seimbang (Default)';
    if (v < 85) return '☀️ Terang';
    return '✨ Sangat Terang / Maksimal';
  };

  const vids = String(videoUrl || 'factory.mp4').split(',').map(s => s.trim()).filter(Boolean);

  return '<div class="f f-full" style="background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:18px;margin:8px 0">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:10px">'
    + '<div><label style="margin:0;font-size:13.5px;color:var(--navy);font-weight:700;display:flex;align-items:center;gap:7px">' + ic('gauge') + ' Intensitas Cahaya Background Hero Beranda</label>'
    + '<p class="mini" style="margin:4px 0 0;color:var(--mut)">Atur tingkat kecerahan video pabrik & ilustrasi background pada banner utama Beranda. Geser slider untuk melihat perubahan live preview.</p></div>'
    + '<div style="background:var(--bg);border:1px solid var(--line);padding:6px 14px;border-radius:999px;font:700 13px \'Barlow\';color:var(--navy);display:flex;align-items:center;gap:6px">'
    + '<span id="herolightval">' + val + '%</span>'
    + '<span id="herolightlbl" class="mini" style="color:var(--mut);font-weight:600">(' + getLabel(val) + ')</span>'
    + '</div>'
    + '</div>'

    // Live Interactive Preview Box
    + '<div style="margin:14px 0 16px">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
    + '<span style="font:700 11px \'Barlow\';letter-spacing:.08em;text-transform:uppercase;color:var(--navy)">👁️ Live Preview Tampilan Hero Beranda:</span>'
    + '<span id="heroprevbadge" style="background:#0e2350;border:1px solid rgba(255,255,255,.15);color:#7ee2a8;font:700 11px \'Barlow\';padding:3px 10px;border-radius:4px">Cahaya: ' + val + '%</span>'
    + '</div>'
    + '<div class="hero-live-preview" id="herolivepreview" style="position:relative;height:210px;border-radius:12px;overflow:hidden;background:#0a1626;border:1.5px solid var(--line);box-shadow:inset 0 0 40px rgba(0,0,0,.6)">'
    + '<div id="heroprevfallback" style="position:absolute;inset:0;opacity:' + fallbackOpacity + ';transition:opacity .2s;display:' + (vids.length ? 'none' : 'flex') + ';align-items:center;justify-content:center;overflow:hidden;pointer-events:none"><style>#heroprevfallback svg{width:100%;height:100%;object-fit:cover;display:block}</style>' + blueprint() + '</div>'
    + (vids.length ? '<video id="heroprevmedia" muted loop playsinline autoplay style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1;filter:brightness(' + videoBrightness + ');transition:filter .2s"><source src="' + esc(vids[0]) + '" type="' + (vids[0].toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4') + '"></video>' : '')
    + '<div id="heroprevshade" style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,16,32,.74),rgba(8,16,32,.32) 45%,rgba(8,16,32,.9));opacity:' + shadeOpacity + ';transition:opacity .2s;pointer-events:none"></div>'
    + '<div style="position:relative;z-index:3;padding:16px 20px;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#fff;pointer-events:none">'
    + '<div><div style="font:600 9px \'Barlow\';letter-spacing:.25em;text-transform:uppercase;color:#eef2f8;text-shadow:0 1px 4px rgba(0,0,0,.8)">PT JIDOKA RESULT INDONESIA — INDUSTRIAL PACKAGING SOLUTIONS</div>'
    + '<div style="font-family:\'Barlow Condensed\';font-size:26px;font-weight:700;line-height:1;text-transform:uppercase;margin-top:6px;text-shadow:0 2px 10px rgba(0,0,0,.85)">PACKAGE YOUR <span style="color:var(--red)">QUALITY.</span></div></div>'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px">'
    + '<div style="font-size:10.5px;color:#e3e9f2;max-width:340px;line-height:1.4;text-shadow:0 1px 6px rgba(0,0,0,.85)">Karton box, imprabox, partisi, dan custom packaging untuk industri manufaktur & otomotif.</div>'
    + '<div style="display:flex;gap:6px">'
    + '<span style="background:var(--red);color:#fff;font:700 9px \'Barlow\';padding:4px 8px;border-radius:4px">MINTA PENAWARAN</span>'
    + '<span style="border:1px solid rgba(255,255,255,.5);color:#fff;font:700 9px \'Barlow\';padding:4px 8px;border-radius:4px">FACTORY TOUR</span>'
    + '</div></div></div>'
    + '</div>'
    + '</div>'

    // Slider & Presets
    + '<div style="margin:12px 0 10px">'
    + '<input type="range" name="heroLight" id="herolightrange" min="10" max="100" step="5" value="' + val + '" aria-label="Intensitas Cahaya Background Hero Beranda" style="width:100%;height:8px;border-radius:6px;accent-color:var(--red);cursor:pointer">'
    + '</div>'
    + '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    + '<button type="button" class="btn btn-line btn-sm" data-hl-set="25" style="padding:4px 10px;font-size:11.5px">🌙 25% Redup</button>'
    + '<button type="button" class="btn btn-line btn-sm" data-hl-set="50" style="padding:4px 10px;font-size:11.5px">⚖️ 50% Standar</button>'
    + '<button type="button" class="btn btn-line btn-sm" data-hl-set="75" style="padding:4px 10px;font-size:11.5px">☀️ 75% Terang</button>'
    + '<button type="button" class="btn btn-line btn-sm" data-hl-set="95" style="padding:4px 10px;font-size:11.5px">✨ 95% Maksimal</button>'
    + '</div>'
    + '<div class="mini" style="color:var(--mut)">Tersimpan dan langsung aktif di Beranda</div>'
    + '</div>'
    + '</div>';
}

export function aCompany() {
  const co = dCo();
  return '<h3>Kontak & Akses</h3><p class="tiny">Kelola kontak kantor/pabrik, email sales/investor, jam kerja, video hero beranda, password login admin, dan keamanan MFA.</p>'
    + '<form id="coform" class="form" style="margin-top:14px">'
    + fText('phone', 'Telepon Kantor', co.phone, 1)
    + fText('wa', 'Nomor WhatsApp Sales (Floating Button)', co.wa || co.phone || '', 1)
    + fText('waMsg', 'Pesan Awal WhatsApp (opsional)', co.waMsg || '')
    + fText('hours', 'Jam Operasional', co.hours, 1)
    + fText('sales', 'Email Sales (RFQ & inquiry umum)', co.sales, 1)
    + fText('corp', 'Email Corporate Development (investor)', co.corp, 1)
    + fVideoHeroBlock(co.video)
    + fHeroLight(co.heroLight, co.video)
    + fTa('addr', 'Alamat Pabrik & Kantor', co.addr)
    + fText('mapLabel', 'Label Lokasi Peta', co.mapLabel || 'Jababeka II — Cikarang, Bekasi')
    + fText('mapQuery', 'Keyword / Alamat Google Maps (otomatis geocoding)', co.mapQuery || co.addr || '')
    + '<div class="f f-full"><label>Custom Google Maps Embed URL (opsional)</label><input name="mapEmbed" value="' + esc(co.mapEmbed || '') + '" placeholder="https://maps.google.com/maps?q=...&output=embed">'
    + '<span class="mini" style="display:block;margin-top:4px;color:var(--mut)">Kosongkan untuk otomatis menggunakan pencarian alamat di atas. Peta interaktif langsung aktif di halaman Kontak website.</span></div>'
    + '<div class="f"><label>Password Baru (opsional)</label><div class="pw-wrap"><input name="npw" id="npw" type="password" placeholder="Kosongkan jika tidak diganti"><button type="button" class="pw-toggle" data-pw-target="npw" aria-label="Lihat / Sembunyikan Password" tabindex="-1">' + ic('eye') + '</button></div></div>'
    + '<div class="f" style="display:flex;align-items:flex-end"><button class="btn btn-red">Simpan Kontak & Password</button></div></form>'
    + '<hr style="border:0;border-top:1px solid var(--bdr);margin:36px 0 24px">'
    + '<div class="mfa-card" id="mfasec">'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">'
    + '<div><div style="display:flex;align-items:center;gap:8px">' + ic('shield') + '<h4 style="font-family:\'Barlow Condensed\';font-size:20px;color:var(--navy);margin:0">AUTENTIKASI DUA FAKTOR (GOOGLE AUTHENTICATOR / MFA)</h4></div>'
    + '<p class="tiny" style="margin-top:6px">Tingkatkan keamanan akun Admin CMS dengan mewajibkan verifikasi kode 6-digit dari aplikasi Google Authenticator saat login.</p></div>'
    + '<div id="mfa-status-badge"><span class="mfa-badge off">Memuat status...</span></div>'
    + '</div>'
    + '<div id="mfa-actions-box" style="margin-top:16px"><p class="tiny" style="color:var(--mut)">Menghubungkan ke modul keamanan server...</p></div>'
    + '</div>'
    + '<div id="mfa-modal-container"></div>';
}

export function aUsers() {
  return '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">'
    + '<div><h3 style="margin:0">Kelola Pengguna Admin CMS</h3>'
    + '<p class="tiny" style="margin-top:4px">Kelola akun staf administrator, hak akses peran, dan status keamanan MFA Google Authenticator masing-masing staf.</p></div>'
    + '<button class="btn btn-red btn-sm" id="btn-add-user">' + ic('plus') + ' Tambah Pengguna</button></div>'
    + '<div id="users-table-box" style="margin-top:18px"><p class="tiny" style="color:var(--mut)">Memuat daftar pengguna...</p></div>'
    + '<div id="user-modal-container"></div>';
}

/* ============================================================
   KONTEN BERANDA: Banner Hero, 4 Pilar, 4 Alasan, Sektor Industri
   ============================================================ */
export function aHomeContent(sub) {
  sub = sub || 'hero';
  const subnav = '<div class="adm-subnav">'
    + '<button class="' + (sub === 'hero' ? 'on' : '') + '" data-sub="hero">Banner Hero & Cahaya Background</button>'
    + '<button class="' + (sub === 'pillars' ? 'on' : '') + '" data-sub="pillars">4 Pilar Layanan (What We Do)</button>'
    + '<button class="' + (sub === 'why' ? 'on' : '') + '" data-sub="why">4 Alasan Memilih JRI (Why Us)</button>'
    + '<button class="' + (sub === 'industries' ? 'on' : '') + '" data-sub="industries">Sektor Industri Pelanggan</button>'
    + '</div>';

  if (sub === 'hero') {
    const co = dCo() || {};
    return '<h3>Konten Beranda — Banner Hero & Background</h3>'
      + '<p class="tiny">Kelola video latar belakang dan intensitas pencahayaan pada banner utama Beranda.</p>'
      + subnav
      + '<form id="heroform" class="form" style="margin-top:14px">'
      + fVideoHeroBlock(co.video)
      + fHeroLight(co.heroLight, co.video)
      + '<div class="f-full"><button class="btn btn-red">Simpan Pengaturan Hero</button></div></form>';
  }

  if (sub === 'pillars') {
    const P = dPillars() || [];
    return '<h3>Konten Beranda — 4 Pilar Layanan</h3>'
      + '<p class="tiny">Ditampilkan di bagian "Fokus Solusi Kami" pada Beranda. Setiap pilar memiliki nomor urut, ikon, judul, dan deskripsi bilingual.</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addpillar">' + ic('plus') + ' Tambah Pilar</button></div>'
      + P.map((p, i) => '<div class="adm-row"><div><b>' + esc(p.n) + '. ' + esc(L(p.t)) + '</b> <span class="mini">(' + esc(p.i) + ') — ' + esc(L(p.d)).slice(0, 80) + '…</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-pillar="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-pillar="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="pillared"></div>';
  }

  if (sub === 'why') {
    const W = dWhy() || [];
    return '<h3>Konten Beranda — Keunggulan JRI</h3>'
      + '<p class="tiny">Ditampilkan di bagian "Keunggulan Kami" pada Beranda. Menampilkan poin keunggulan utama perusahaan.</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addwhy">' + ic('plus') + ' Tambah Alasan</button></div>'
      + W.map((w, i) => '<div class="adm-row"><div><b>' + esc(L(w.t)) + '</b> <span class="mini">(' + esc(w.i) + ') — ' + esc(L(w.d)).slice(0, 80) + '…</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-why="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-why="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="whyed"></div>';
  }

  if (sub === 'industries') {
    const IND = dIndustries() || [];
    return '<h3>Konten Beranda & Solusi Industri</h3>'
      + '<p class="tiny">Ditampilkan di Beranda dan Halaman Solusi Industri. Mengelompokkan solusi kemasan per sektor bisnis.</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addind">' + ic('plus') + ' Tambah Industri</button></div>'
      + IND.map((ind, i) => '<div class="adm-row"><div><b>' + esc(L(ind.name)) + '</b> ' + (ind.jp ? '<span class="mini">[' + esc(ind.jp) + ']</span> ' : '') + '<span class="mini">/' + esc(ind.id) + ' · ' + esc(L(ind.d)).slice(0, 70) + '…</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-ind="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-ind="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="inded"></div>';
  }
}

export function aPillarForm(i) {
  const P = dPillars() || [];
  const p = i >= 0 ? P[i] : { n: '0' + (P.length + 1), i: 'gear', t: { en: '', id: '' }, d: { en: '', id: '' } };
  return '<form id="pillarform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fText('n', 'Nomor Pilar (mis. 01, 02)', p.n, 1)
    + fSel('i', 'Ikon', ['gear', 'factory', 'shield', 'truck', 'box', 'layers', 'trend', 'award', 'clock'], p.i)
    + fBi('t', 'Judul Pilar', p.t)
    + fBiTa('d', 'Deskripsi Pilar', p.d)
    + '<div class="f-full" style="display:flex;gap:10px"><button class="btn btn-red">Simpan Pilar</button><button type="button" class="btn btn-line" id="pillarcancel">Batal</button></div></form>';
}

export function aWhyForm(i) {
  const W = dWhy() || [];
  const w = i >= 0 ? W[i] : { i: 'award', t: { en: '', id: '' }, d: { en: '', id: '' } };
  return '<form id="whyform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fSel('i', 'Ikon', ['award', 'gauge', 'clock', 'trend', 'shield', 'factory', 'gear', 'check'], w.i)
    + fBi('t', 'Judul Alasan', w.t)
    + fBiTa('d', 'Deskripsi Alasan', w.d)
    + '<div class="f-full" style="display:flex;gap:10px"><button class="btn btn-red">Simpan Alasan</button><button type="button" class="btn btn-line" id="whycancel">Batal</button></div></form>';
}

export function aIndForm(i) {
  const IND = dIndustries() || [];
  const ind = i >= 0 ? IND[i] : { id: '', i: 'truck', jp: '', name: { en: '', id: '' }, d: { en: '', id: '' }, cases: [{ en: '', id: '' }, { en: '', id: '' }], prods: [] };
  const c1 = (ind.cases && ind.cases[0]) || { en: '', id: '' };
  const c2 = (ind.cases && ind.cases[1]) || { en: '', id: '' };
  return '<form id="indform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fText('id', 'Slug URL / ID (mis. automotive, steel)', ind.id, 1)
    + fText('jp', 'Teks Kanji Jepang (mis. 自動車)', ind.jp || '')
    + fSel('i', 'Ikon', ['truck', 'layers', 'factory', 'box', 'shield', 'gear'], ind.i)
    + fBi('name', 'Nama Industri', ind.name)
    + fBiTa('d', 'Deskripsi Solusi Industri', ind.d)
    + fBi('case1', 'Studi Kasus 1', c1)
    + fBi('case2', 'Studi Kasus 2', c2)
    + fText('prods', 'Slug Produk Terkait (pisahkan koma, mis. karton-box, imprabox)', (ind.prods || []).join(', '))
    + '<div class="f-full" style="display:flex;gap:10px"><button class="btn btn-red">Simpan Industri</button><button type="button" class="btn btn-line" id="indcancel">Batal</button></div></form>';
}

/* ============================================================
   PABRIK & MUTU: Tour, Machinery, Flow, Certs
   ============================================================ */
export function aFactoryQuality(sub) {
  sub = sub || 'tour';
  const subnav = '<div class="adm-subnav">'
    + '<button class="' + (sub === 'tour' ? 'on' : '') + '" data-sub="tour">Digital Factory Tour (5 Tahap)</button>'
    + '<button class="' + (sub === 'mach' ? 'on' : '') + '" data-sub="mach">Daftar Mesin Pabrik</button>'
    + '<button class="' + (sub === 'flow' ? 'on' : '') + '" data-sub="flow">Alur Produksi</button>'
    + '<button class="' + (sub === 'certs' ? 'on' : '') + '" data-sub="certs">Sertifikasi & Standar Mutu</button>'
    + '</div>';

  if (sub === 'tour') {
    const T = dTour() || [];
    return '<h3>Pabrik & Mutu — Digital Factory Tour</h3>'
      + '<p class="tiny">Ditampilkan di Beranda & Halaman Pabrik & Produksi. Menggambarkan 5 tahapan tur fasilitas pabrik dengan video interaktif & diagram cetak biru.</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addtour">' + ic('plus') + ' Tambah Tahap Tur</button></div>'
      + T.map((t, i) => '<div class="adm-row"><div><b>' + esc(t.n) + '. ' + esc(L(t.name)) + '</b> ' + (t.jp ? '<span class="mini">[' + esc(t.jp) + ']</span> ' : '') + (t.video ? '<span class="mini" style="background:#0e2350;color:#7ee2a8;font-weight:700;border-radius:6px;padding:3px 8px;margin-left:6px;display:inline-flex;align-items:center;gap:4px">' + ic('play') + ' Video</span> ' : '') + '<span class="mini">— ' + esc(L(t.d)).slice(0, 60) + '…</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-tour="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-tour="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="toured"></div>';
  }

  if (sub === 'mach') {
    const M = dMach() || [];
    return '<h3>Pabrik & Mutu — Daftar Mesin Pabrik</h3>'
      + '<p class="tiny">Ditampilkan di Halaman Manufacturing — tabel spesifikasi armada mesin produksi utama.</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addmach">' + ic('plus') + ' Tambah Mesin</button></div>'
      + M.map((m, i) => '<div class="adm-row"><div><b>' + esc(m[0]) + '</b> <span class="mini">' + esc(m[1]) + ' Unit · Lebar: ' + esc(m[2]) + ' · ' + esc(m[3]) + '</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-mach="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-mach="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="mached"></div>';
  }

  if (sub === 'flow') {
    const F = dFlow() || [];
    return '<h3>Pabrik & Mutu — Alur Produksi</h3>'
      + '<p class="tiny">Ditampilkan di Halaman Manufacturing — alur tahapan proses dari awal hingga akhir.</p>'
      + subnav
      + '<form id="flowform" class="form" style="margin-top:14px">'
      + fTa('flow', 'Tahapan Alur Produksi (Satu tahap per baris)', F.join('\n'))
      + '<div class="f-full"><button class="btn btn-red">Simpan Alur Produksi</button></div></form>';
  }

  if (sub === 'certs') {
    const C = dCerts() || [];
    return '<h3>Pabrik & Mutu — Sertifikasi & Standar Mutu</h3>'
      + '<p class="tiny">Ditampilkan di Halaman Standar Mutu. Daftar sertifikasi ISO, standar internal, dan persetujuan pelanggan industri.</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addcert">' + ic('plus') + ' Tambah Sertifikasi</button></div>'
      + C.map((c, i) => '<div class="adm-row"><div><b>' + esc(L(c.name)) + '</b> <span class="mini">— ' + esc(L(c.d)).slice(0, 80) + '…</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-cert="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-cert="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="certed"></div>';
  }
}

export function aTourForm(i) {
  const T = dTour() || [];
  const t = i >= 0 ? T[i] : { n: '0' + (T.length + 1), jp: '', name: { en: '', id: '' }, d: { en: '', id: '' }, data: [], video: '' };
  const pairs = a => (a || []).map(r => r[0] + ' | ' + r[1]).join('\n');
  const curVideo = (t.video || '').trim();
  return '<form id="tourform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fText('n', 'Nomor Tahap (mis. 01, 02)', t.n, 1)
    + fText('jp', 'Teks Kanji Jepang (mis. 原材料)', t.jp)
    + fBi('name', 'Nama Tahap Tur', t.name)
    + fBiTa('d', 'Deskripsi Tahap', t.d)
    + fTa('data', 'Data Teknis / Matriks (Format per baris: Label | Nilai)', pairs(t.data))
    + '<div class="f-full" style="background:var(--bg);border:1.5px solid var(--line);border-radius:12px;padding:18px;margin:12px 0">'
    + '<label style="font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:8px;font-size:14px;color:var(--navy)">' + ic('play') + ' Video Footage Tahap Ini (MP4 / WebM / YouTube)</label>'
    + '<p class="mini" style="margin-bottom:14px;color:var(--mut)">Unggah file video footage nyata fasilitas pabrik (.mp4, .webm hingga 100 MB) atau masukkan URL video / embed YouTube. Jika kosong, sistem otomatis menampilkan diagram Blueprint SVG.</p>'
    + '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px">'
    + '<input type="file" id="tourvideofile" accept="video/mp4,video/webm,video/ogg,video/quicktime" style="font-size:13px;max-width:280px">'
    + '<button type="button" class="btn btn-line btn-sm" id="btnuploadtourvideo">' + ic('download') + ' Unggah File Video</button>'
    + '<span id="tourvideomsg" class="mini">Maksimal 100 MB</span>'
    + '</div>'
    + '<div style="display:flex;gap:10px;align-items:center">'
    + '<input type="text" name="video" id="tourvideourl" value="' + esc(curVideo) + '" placeholder="/uploads/video.mp4 atau https://www.youtube.com/watch?v=..." style="flex:1;padding:9px 12px;border:1.5px solid var(--line);border-radius:8px;font-size:13.5px">'
    + (curVideo ? '<button type="button" class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:8px;padding:8px 12px" id="btndeltourvideo">' + ic('trash') + ' Hapus</button>' : '')
    + '</div>'
    + '<div id="tourvideoprev" style="margin-top:14px">'
    + (curVideo ? (
        curVideo.includes('youtube.com') || curVideo.includes('youtu.be')
          ? '<iframe src="' + esc(curVideo) + '" style="width:100%;max-width:540px;height:290px;border-radius:10px;border:1px solid var(--line)"></iframe>'
          : '<video controls playsinline style="width:100%;max-width:540px;max-height:290px;border-radius:10px;border:1px solid var(--line);background:#000;display:block"><source src="' + esc(curVideo) + '" type="video/mp4"><source src="' + esc(curVideo) + '" type="video/webm"></video>'
      ) : '<div class="mini" style="color:var(--mut);background:#fff;padding:12px 14px;border-radius:8px;border:1px dashed var(--line)">ℹ Belum ada video untuk tahap ini. Default menampilkan Diagram Cetak Biru (Blueprint SVG).</div>')
    + '</div>'
    + '</div>'
    + '<div class="f-full" style="display:flex;gap:10px"><button class="btn btn-red">Simpan Tahap Tur</button><button type="button" class="btn btn-line" id="tourcancel">Batal</button></div></form>';
}

export function aMachForm(i) {
  const M = dMach() || [];
  const m = i >= 0 ? M[i] : ['', '1', '', ''];
  return '<form id="machform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fText('name', 'Tipe / Nama Mesin (mis. Corrugator 5-ply)', m[0], 1)
    + fText('qty', 'Jumlah Unit (mis. 2)', m[1], 1)
    + fText('cap', 'Kapasitas / Lebar Maksimum (mis. 1,400 mm)', m[2], 1)
    + fText('fn', 'Fungsi / Produk Dihasilkan (mis. Karton box board)', m[3], 1)
    + '<div class="f-full" style="display:flex;gap:10px"><button class="btn btn-red">Simpan Mesin</button><button type="button" class="btn btn-line" id="machcancel">Batal</button></div></form>';
}

export function aCertForm(i) {
  const C = dCerts() || [];
  const c = i >= 0 ? C[i] : { name: { en: '', id: '' }, d: { en: '', id: '' } };
  return '<form id="certform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fBi('name', 'Nama Sertifikasi / Standar', c.name)
    + fBiTa('d', 'Deskripsi & Status (mis. Certified / In-Process)', c.d)
    + '<div class="f-full" style="display:flex;gap:10px"><button class="btn btn-red">Simpan Sertifikasi</button><button type="button" class="btn btn-line" id="certcancel">Batal</button></div></form>';
}

/* ============================================================
   OUR WAY & KORPORAT: 7 Prinsip, Sejarah, Governance
   ============================================================ */
export function aWayCorporate(sub) {
  sub = sub || 'way';
  const subnav = '<div class="adm-subnav">'
    + '<button class="' + (sub === 'way' ? 'on' : '') + '" data-sub="way">7 Prinsip DNA Jepang (Our Way)</button>'
    + '<button class="' + (sub === 'hist' ? 'on' : '') + '" data-sub="hist">Linimasa Sejarah Perusahaan</button>'
    + '<button class="' + (sub === 'gov' ? 'on' : '') + '" data-sub="gov">Tata Kelola Perusahaan (Governance)</button>'
    + '</div>';

  if (sub === 'way') {
    const W = dWay() || [];
    return '<h3>Nilai & Profil Perusahaan — 7 Prinsip Budaya Jepang</h3>'
      + '<p class="tiny">Ditampilkan di Halaman Our Way & Beranda. Fondasi etos kerja dan filosofi manufaktur Jepang (Kaizen, 5S, Jidoka, dll).</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addwayp">' + ic('plus') + ' Tambah Prinsip</button></div>'
      + W.map((w, i) => '<div class="adm-row"><div><b>' + esc(w.n) + '</b> ' + (w.kj ? '<span class="mini">[' + esc(w.kj) + ']</span> ' : '') + '<span class="mini">— ' + esc(L(w.s)) + '</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-wayp="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-wayp="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="wayped"></div>';
  }

  if (sub === 'hist') {
    const H = dHist() || [];
    return '<h3>Nilai & Profil Perusahaan — Linimasa Sejarah Perusahaan</h3>'
      + '<p class="tiny">Ditampilkan di Halaman Profil Perusahaan. Tonggak sejarah pendirian dan ekspansi PT JRI.</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addhist">' + ic('plus') + ' Tambah Tahun</button></div>'
      + H.map((h, i) => '<div class="adm-row"><div><b>Tahun ' + esc(h.yr) + '</b> <span class="mini">— ' + esc(L(h.t)).slice(0, 80) + '…</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-hist="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-hist="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="histed"></div>';
  }

  if (sub === 'gov') {
    const G = dGov() || [];
    return '<h3>Nilai & Profil Perusahaan — Tata Kelola Perusahaan (Governance)</h3>'
      + '<p class="tiny">Ditampilkan di Halaman Profil Perusahaan. Poin komitmen tata kelola dan kepatuhan regulasi.</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addgov">' + ic('plus') + ' Tambah Poin</button></div>'
      + G.map((g, i) => '<div class="adm-row"><div><b>' + (i + 1) + '. ' + esc(L(g)).slice(0, 90) + '…</b></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-gov="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-gov="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="goved"></div>';
  }
}

export function aWayPForm(i) {
  const W = dWay() || [];
  const w = i >= 0 ? W[i] : { kj: '', n: '', s: { en: '', id: '' }, d: { en: '', id: '' } };
  return '<form id="waypform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fText('kj', 'Huruf Kanji (mis. 改善, 5S, 自働化)', w.kj, 1)
    + fText('n', 'Nama Prinsip (mis. Kaizen, Jidoka, Heijunka)', w.n, 1)
    + fBi('s', 'Subjudul / Esensi Prinsip', w.s)
    + fBiTa('d', 'Deskripsi Lengkap', w.d)
    + '<div class="f-full" style="display:flex;gap:10px"><button class="btn btn-red">Simpan Prinsip</button><button type="button" class="btn btn-line" id="waypcancel">Batal</button></div></form>';
}

export function aHistForm(i) {
  const H = dHist() || [];
  const h = i >= 0 ? H[i] : { yr: '', t: { en: '', id: '' } };
  return '<form id="histform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fText('yr', 'Tahun (mis. 2012, 2026)', h.yr, 1)
    + fBiTa('t', 'Pencapaian / Sejarah', h.t)
    + '<div class="f-full" style="display:flex;gap:10px"><button class="btn btn-red">Simpan Sejarah</button><button type="button" class="btn btn-line" id="histcancel">Batal</button></div></form>';
}

export function aGovForm(i) {
  const G = dGov() || [];
  const g = i >= 0 ? G[i] : { en: '', id: '' };
  return '<form id="govform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fBiTa('t', 'Poin Tata Kelola / Kepatuhan', g)
    + '<div class="f-full" style="display:flex;gap:10px"><button class="btn btn-red">Simpan Tata Kelola</button><button type="button" class="btn btn-line" id="govcancel">Batal</button></div></form>';
}

export function aBackup() {
  return '<h3>Cadangkan & Pulihkan (Backup / Restore)</h3>'
    + '<p class="tiny">Seluruh data CMS tersimpan aman di database server. Gunakan fitur ekspor/impor JSON untuk mengelola cadangan berkala atau migrasi data.</p>'
    + '<textarea id="expj" class="tj" style="margin:14px 0 10px" readonly>' + esc(JSON.stringify(dbRead(), null, 2)) + '</textarea>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:26px"><button class="btn btn-line btn-sm" id="dlj">' + ic('download') + ' Download JSON</button><button class="btn btn-line btn-sm" id="cpj">Salin</button></div>'
    + '<h4 class="redlbl">Import / Muat JSON</h4>'
    + '<textarea id="impj" class="tj" placeholder="Tempel isi JSON backup di sini…" style="margin-bottom:10px"></textarea>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-red btn-sm" id="impb">Muat JSON</button>'
    + '<button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:10px 16px;font-weight:700;letter-spacing:.05em" id="rstb">Reset ke Default</button></div>'
    + '<p class="tiny" style="margin-top:14px">Data yang diimpor langsung disimpan ke database MySQL server dan ter-refresh di semua halaman website.</p>';
}

export function renderAdmin(tab, sub) {
  if (!isLogged()) {
    return '<section class="sec" style="padding-top:48px"><div class="wrap" style="max-width:440px"><div class="panel-card">'
      + '<div id="login-step1">'
      + '<h3 style="font-family:\'Barlow Condensed\';font-size:26px;text-transform:uppercase;color:var(--navy)">Login Admin CMS</h3>'
      + '<p class="tiny" style="margin:6px 0 16px">Autentikasi akun admin server.<br>Default: <b>admin@jidoka.co.id</b> / <b>jidoka2026</b></p>'
      + '<form id="lform" class="form" style="grid-template-columns:1fr">'
      + '<div class="f"><label>Email</label><input name="email" id="lemail" type="email" value="admin@jidoka.co.id" required></div>'
      + '<div class="f"><label>Password</label><div class="pw-wrap"><input name="pw" id="lpw" type="password" required autocomplete="current-password"><button type="button" class="pw-toggle" id="lpwtoggle" aria-label="Lihat / Sembunyikan Password" tabindex="-1">' + ic('eye') + '</button></div><div class="err" id="lerr">Email atau password salah</div></div>'
      + '<button class="btn btn-red" style="width:100%" id="lsubmit">Masuk</button></form></div>'
      + '<div id="login-step2" style="display:none">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' + ic('shield') + '<h3 style="font-family:\'Barlow Condensed\';font-size:24px;text-transform:uppercase;color:var(--navy);margin:0">Verifikasi 2 Langkah</h3></div>'
      + '<p class="tiny" id="mfa-sub-text" style="margin-bottom:18px">Buka aplikasi <b>Google Authenticator</b> pada ponsel Anda dan masukkan 6 digit kode akun <b id="mfa-display-email">admin@jidoka.co.id</b>.</p>'
      + '<form id="mfaform" class="form" style="grid-template-columns:1fr">'
      + '<div class="f"><label id="mfalabel">Kode Google Authenticator (6 Digit)</label><input name="mfacode" id="mfacode" type="text" maxlength="6" inputmode="numeric" autocomplete="one-time-code" placeholder="000 000" class="mfa-input" required><div class="err" id="mfaerr">Kode tidak valid</div></div>'
      + '<button class="btn btn-red" style="width:100%" id="mfasubmit">Verifikasi & Masuk</button>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;font-size:12px">'
      + '<a href="#" id="toggle-backup-mode" style="color:var(--navy);font-weight:600">Gunakan Kode Cadangan</a>'
      + '<a href="#" id="back-to-step1" style="color:var(--mut)">← Kembali</a>'
      + '</div></form></div>'
      + '</div></div></section>';
  }
  tab = tab || 'dash';
  const unhandled = cachedLeads.filter(l => l.status === 'new').length;
  const tabs = [
    ['dash', 'Dashboard'],
    ['inbox', 'Pesan Masuk (RFQ)' + (unhandled ? ' (' + unhandled + ')' : '')],
    ['profile', 'Profil & Logo'],
    ['home-content', 'Konten Beranda'],
    ['products', 'Produk'],
    ['factory-quality', 'Pabrik & Mutu'],
    ['way-corporate', 'Budaya & Profil Perusahaan'],
    ['news', 'Berita & Aktivitas'],
    ['caps', 'Kapabilitas & Solusi'],
    ['resources', 'Dokumen'],
    ['users', 'Kelola Pengguna'],
    ['company', 'Kontak & Akses'],
    ['backup', 'Backup & Pulihkan']
  ];
  let body = '';
  try {
    body = tab === 'inbox' ? aInbox()
      : tab === 'profile' ? aProfile()
      : tab === 'home-content' ? aHomeContent(sub)
      : tab === 'products' ? aProducts()
      : tab === 'factory-quality' ? aFactoryQuality(sub)
      : tab === 'way-corporate' ? aWayCorporate(sub)
      : tab === 'news' ? aNews()
      : tab === 'caps' ? aCaps()
      : tab === 'resources' ? aRes()
      : tab === 'users' ? aUsers()
      : tab === 'company' ? aCompany()
      : tab === 'backup' ? aBackup()
      : aDash();
  } catch (e) {
    body = '<p style="color:var(--red)">Error: ' + esc(e.message) + '</p>';
  }
  return '<section class="page-hero"><div class="wrap"><h1>Admin CMS</h1><p class="lead">Perubahan langsung tampil di website — tanpa menyentuh kode. Data tersimpan di database server.</p></div></section>'
    + '<section class="sec" style="padding-top:10px"><div class="wrap adm">'
    + '<div class="adm-nav">' + tabs.map(t => '<button class="' + (tab === t[0] ? 'on' : '') + '" data-at="' + t[0] + '">' + t[1] + '</button>').join('') + '<button id="admout" style="color:var(--red)">⎋ Keluar</button></div>'
    + '<div class="adm-card">' + body + '</div></div></section>';
}

function initHeroLightControls(container) {
  const c = container || document;
  const range = c.querySelector('#herolightrange');
  const valEl = c.querySelector('#herolightval');
  const lblEl = c.querySelector('#herolightlbl');
  const prevShade = c.querySelector('#heroprevshade');
  let prevMedia = c.querySelector('#heroprevmedia');
  const prevFallback = c.querySelector('#heroprevfallback');
  const prevBadge = c.querySelector('#heroprevbadge');
  const previewBox = c.querySelector('#herolivepreview');
  const vidInput = c.querySelector('input[name="video"]');
  const pickBtn = c.querySelector('[data-btn-pick-video]');
  const fileIn = c.querySelector('[data-video-file-input]');
  const resetBtn = c.querySelector('[data-btn-reset-video]');
  const msgEl = c.querySelector('[data-video-msg]');

  const getLabel = v => {
    if (v < 35) return '(🌙 Redup / Gelap)';
    if (v < 65) return '(⚖️ Normal / Seimbang)';
    if (v < 85) return '(☀️ Terang)';
    return '(✨ Sangat Terang)';
  };

  const updateVisuals = () => {
    if (!range) return;
    const v = Math.max(10, Math.min(100, Number(range.value || 50)));
    if (valEl) valEl.textContent = v + '%';
    if (lblEl) lblEl.textContent = getLabel(v);
    if (prevBadge) prevBadge.textContent = 'Cahaya: ' + v + '%';

    const shadeOpacity = Math.max(0.08, Math.min(0.98, 1.05 - (v / 100) * 0.90)).toFixed(2);
    const videoBrightness = (0.75 + (v / 100) * 0.50).toFixed(2);
    const fallbackOpacity = Math.max(0.15, Math.min(0.85, 0.20 + (v / 100) * 0.60)).toFixed(2);

    if (prevShade) prevShade.style.opacity = shadeOpacity;
    if (prevMedia) {
      prevMedia.style.opacity = '1';
      prevMedia.style.filter = 'brightness(' + videoBrightness + ')';
    }
    if (prevFallback) {
      if (prevMedia && prevMedia.style.display !== 'none') {
        prevFallback.style.opacity = '0';
        prevFallback.style.display = 'none';
      } else {
        prevFallback.style.opacity = fallbackOpacity;
        prevFallback.style.display = 'flex';
      }
    }
  };

  if (range) {
    range.oninput = updateVisuals;
    c.querySelectorAll('[data-hl-set]').forEach(btn => {
      btn.onclick = () => {
        range.value = btn.dataset.hlSet;
        updateVisuals();
      };
    });
  }

  const updateVideoPreview = (newSrc) => {
    const src = (newSrc || '').split(',')[0].trim();
    if (!src) {
      if (prevMedia) prevMedia.style.display = 'none';
      if (prevFallback) {
        prevFallback.style.display = 'flex';
        prevFallback.style.opacity = '0.6';
      }
      return;
    }

    const curLight = Number(range ? range.value : 50) || 50;
    const videoBrightness = (0.75 + (curLight / 100) * 0.50).toFixed(2);

    if (!prevMedia) {
      if (previewBox) {
        prevMedia = document.createElement('video');
        prevMedia.id = 'heroprevmedia';
        prevMedia.muted = true;
        prevMedia.loop = true;
        prevMedia.playsInline = true;
        prevMedia.autoplay = true;
        prevMedia.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1;filter:brightness(' + videoBrightness + ');transition:filter .2s';
        const s = document.createElement('source');
        s.src = src;
        s.type = src.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
        prevMedia.appendChild(s);
        const shade = c.querySelector('#heroprevshade');
        if (shade) previewBox.insertBefore(prevMedia, shade);
        else previewBox.appendChild(prevMedia);
      }
    } else {
      let source = prevMedia.querySelector('source');
      if (!source) {
        source = document.createElement('source');
        prevMedia.appendChild(source);
      }
      source.src = src;
      source.type = src.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
      prevMedia.style.display = 'block';
      prevMedia.load();
      prevMedia.play().catch(() => {});
    }

    if (prevMedia) {
      prevMedia.onloadeddata = () => {
        if (prevFallback) {
          prevFallback.style.display = 'none';
          prevFallback.style.opacity = '0';
        }
      };
      prevMedia.onerror = () => {
        if (prevFallback) {
          prevFallback.style.display = 'flex';
          prevFallback.style.opacity = '0.6';
        }
      };
    }
  };

  if (vidInput) {
    vidInput.addEventListener('input', () => updateVideoPreview(vidInput.value));
  }

  if (pickBtn && fileIn) {
    pickBtn.onclick = () => fileIn.click();
    fileIn.onchange = async () => {
      const file = fileIn.files && fileIn.files[0];
      if (!file) return;

      const ext = (file.name.slice(file.name.lastIndexOf('.')) || '').toLowerCase();
      if (!['.mp4', '.webm'].includes(ext)) {
        alert('Format file tidak didukung. Mohon pilih file video dengan format .mp4 atau .webm');
        fileIn.value = '';
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        alert('Ukuran file video melebihi batas 100 MB (' + (file.size / (1024 * 1024)).toFixed(1) + ' MB). Mohon kompres video terlebih dahulu.');
        fileIn.value = '';
        return;
      }

      pickBtn.disabled = true;
      const origHtml = pickBtn.innerHTML;
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      pickBtn.textContent = 'Mengunggah (' + sizeMB + ' MB)...';
      if (msgEl) {
        msgEl.style.color = 'var(--gold, #d97706)';
        msgEl.textContent = '⏳ Mengunggah video "' + esc(file.name) + '" (' + sizeMB + ' MB) ke server... Mohon tunggu.';
      }

      const fd = new FormData();
      fd.append('file', file);

      try {
        const res = await authFetch('/api/upload', {
          method: 'POST',
          body: fd
        });
        const data = await res.json();
        const uploadedUrl = (data.file && data.file.url) || data.url;
        const uploadedName = (data.file && data.file.orig_name) || data.orig_name || file.name;
        if (res.ok && data.success && uploadedUrl) {
          if (vidInput) {
            vidInput.value = uploadedUrl;
            updateVideoPreview(uploadedUrl);
          }
          if (msgEl) {
            msgEl.style.color = '#10b981';
            msgEl.textContent = '✓ Video berhasil diunggah: ' + esc(uploadedName) + ' (' + sizeMB + ' MB). Klik tombol "Simpan" di bawah untuk menyimpan perubahan.';
          }
          toast('Video berhasil diunggah ke server');
        } else {
          if (msgEl) {
            msgEl.style.color = 'var(--red, #dc2626)';
            msgEl.textContent = '❌ Gagal upload: ' + esc(data.message || 'Terjadi kesalahan pada server');
          }
          toast('Gagal mengunggah video: ' + (data.message || ''));
        }
      } catch (err) {
        console.error('Upload video error:', err);
        if (msgEl) {
          msgEl.style.color = 'var(--red, #dc2626)';
          msgEl.textContent = '❌ Gagal koneksi saat upload: ' + esc(err.message);
        }
        toast('Gagal mengunggah video (kesalahan jaringan)');
      } finally {
        pickBtn.disabled = false;
        pickBtn.innerHTML = origHtml;
        fileIn.value = '';
      }
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      if (vidInput) {
        vidInput.value = 'factory.mp4';
        updateVideoPreview('factory.mp4');
      }
      if (msgEl) {
        msgEl.style.color = 'var(--mut)';
        msgEl.textContent = 'Video di-reset ke bawaan (factory.mp4). Klik tombol Simpan di bawah untuk menerapkan.';
      }
      toast('URL video di-reset ke factory.mp4');
    };
  }
}

export function mountAdmin(seg, router, goHash) {
  if (!isLogged()) {
    const lf = qs('#lform');
    if (lf) {
      const toggle = qs('#lpwtoggle');
      const pwInput = qs('#lpw');
      if (toggle && pwInput) {
        toggle.onclick = () => {
          const isPw = pwInput.type === 'password';
          pwInput.type = isPw ? 'text' : 'password';
          toggle.innerHTML = isPw ? ic('eyeOff') : ic('eye');
          toggle.setAttribute('aria-label', isPw ? 'Sembunyikan password' : 'Lihat password');
        };
      }
      lf.onsubmit = async e => {
        e.preventDefault();
        const email = (lf.email && lf.email.value) || '';
        const pw = (lf.pw && lf.pw.value) || '';
        const res = await doLogin(email, pw);
        if (res.ok) {
          toast('Selamat datang');
          await fetchLeads();
          router(true);
        } else if (res.mfa_required) {
          currentMfaTicket = res.mfa_ticket;
          isBackupMode = false;
          const s1 = qs('#login-step1');
          const s2 = qs('#login-step2');
          const dispEmail = qs('#mfa-display-email');
          const codeInp = qs('#mfacode');
          if (s1 && s2) {
            s1.style.display = 'none';
            s2.style.display = 'block';
          }
          if (dispEmail) dispEmail.textContent = email;
          if (codeInp) {
            codeInp.value = '';
            codeInp.focus();
          }
        } else {
          const fe = qs('#lerr');
          if (fe) {
            fe.textContent = res.message || 'Email atau password salah';
            fe.parentElement.classList.add('bad');
            fe.style.display = 'block';
          }
        }
      };
    }

    const mf = qs('#mfaform');
    if (mf) {
      const backupToggle = qs('#toggle-backup-mode');
      const backBtn = qs('#back-to-step1');
      const codeInp = qs('#mfacode');
      const mfaLabel = qs('#mfalabel');
      const mfaSubText = qs('#mfa-sub-text');

      if (backupToggle) {
        backupToggle.onclick = e => {
          e.preventDefault();
          isBackupMode = !isBackupMode;
          if (isBackupMode) {
            if (mfaLabel) mfaLabel.textContent = 'Kode Cadangan Darurat (8 Karakter)';
            if (codeInp) {
              codeInp.placeholder = 'XXXX-XXXX';
              codeInp.maxLength = 9;
              codeInp.inputMode = 'text';
              codeInp.value = '';
            }
            backupToggle.textContent = 'Gunakan Google Authenticator';
            if (mfaSubText) mfaSubText.innerHTML = 'Masukkan salah satu dari 8 <b>Kode Cadangan Darurat</b> yang Anda simpan saat aktivasi MFA.';
          } else {
            if (mfaLabel) mfaLabel.textContent = 'Kode Google Authenticator (6 Digit)';
            if (codeInp) {
              codeInp.placeholder = '000 000';
              codeInp.maxLength = 6;
              codeInp.inputMode = 'numeric';
              codeInp.value = '';
            }
            backupToggle.textContent = 'Gunakan Kode Cadangan';
            const userEmail = (lf && lf.email && lf.email.value) || 'admin@jidoka.co.id';
            if (mfaSubText) mfaSubText.innerHTML = 'Buka aplikasi <b>Google Authenticator</b> pada ponsel Anda dan masukkan 6 digit kode akun <b>' + esc(userEmail) + '</b>.';
          }
          if (codeInp) codeInp.focus();
        };
      }

      if (backBtn) {
        backBtn.onclick = e => {
          e.preventDefault();
          const s1 = qs('#login-step1');
          const s2 = qs('#login-step2');
          if (s1 && s2) {
            s2.style.display = 'none';
            s1.style.display = 'block';
          }
        };
      }

      mf.onsubmit = async e => {
        e.preventDefault();
        const code = (codeInp && codeInp.value) || '';
        const res = await doMfaLogin(currentMfaTicket, code, isBackupMode);
        if (res.ok) {
          toast(res.message || 'Verifikasi berhasil');
          await fetchLeads();
          router(true);
        } else {
          const fe = qs('#mfaerr');
          if (fe) {
            fe.textContent = res.message || 'Kode verifikasi tidak valid';
            fe.parentElement.classList.add('bad');
            fe.style.display = 'block';
          }
        }
      };
    }
    return;
  }

  // Preload leads in background for badge count if not loaded yet
  if (!cachedLeads.length) {
    fetchLeads().then(() => {
      const unh = cachedLeads.filter(l => l.status === 'new').length;
      const ibBtn = qs('.adm-nav [data-at="inbox"]');
      if (ibBtn && unh) ibBtn.textContent = 'Pesan Masuk (RFQ) (' + unh + ')';
    });
  }

  qa('.adm-nav [data-at]').forEach(b => b.onclick = () => goHash('#/admin/' + b.dataset.at));
  qa('.adm-subnav [data-sub]').forEach(b => b.onclick = () => goHash('#/admin/' + (seg[1] || 'home-content') + '/' + b.dataset.sub));

  const out = qs('#admout');
  if (out) {
    out.onclick = () => {
      doLogout();
      toast('Anda telah keluar');
      router(true);
    };
  }

  const T = seg[1] || 'dash';

  if (T === 'inbox') {
    // Refresh inbox button
    const refb = qs('#refinbox');
    if (refb) {
      refb.onclick = async () => {
        await fetchLeads();
        toast('Data pesan masuk diperbarui');
        router(true);
      };
    }

    // Toggle lead accordion
    qa('[data-lead-toggle]').forEach(el => {
      el.onclick = () => {
        const item = el.closest('.inbox-item');
        if (item) item.classList.toggle('open');
      };
    });

    // Mark handled
    qa('[data-lead-handle]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.leadHandle;
        try {
          const res = await authFetch('/api/leads/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'handled' })
          });
          if (res.ok) {
            toast('Lead ditandai selesai');
            await fetchLeads();
            router(true);
          }
        } catch (e) {
          toast('Gagal memperbarui status');
        }
      };
    });

    // Mark unhandled
    qa('[data-lead-unhandle]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.leadUnhandle;
        try {
          const res = await authFetch('/api/leads/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'new' })
          });
          if (res.ok) {
            toast('Lead ditandai baru');
            await fetchLeads();
            router(true);
          }
        } catch (e) {
          toast('Gagal memperbarui status');
        }
      };
    });

    // Delete lead
    qa('[data-lead-del]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.leadDel;
        if (confirm('Hapus pesan lead ini?')) {
          try {
            await authFetch('/api/leads/' + id, { method: 'DELETE' });
            toast('Lead dihapus');
            await fetchLeads();
            router(true);
          } catch (e) {
            toast('Gagal menghapus lead');
          }
        }
      };
    });
  }

  if (T === 'home-content') {
    const sub = seg[2] || 'hero';

    if (sub === 'hero') {
      const hf = qs('#heroform');
      if (hf) {
        initHeroLightControls(hf);
        hf.onsubmit = e => {
          e.preventDefault();
          const fd = {};
          qa('input', hf).forEach(el => fd[el.name] = el.value);
          const curCo = dCo() || {};
          DB.set('company', {
            ...curCo,
            video: (fd.video || '').trim(),
            heroLight: Number(fd.heroLight !== undefined ? fd.heroLight : 50)
          });
          toast('Pengaturan Hero & Background tersimpan');
          router(true);
        };
      }
    }

    if (sub === 'pillars') {
      const ed = qs('#pillared');
      const open = i => {
        ed.innerHTML = aPillarForm(i);
        ed.scrollIntoView({ behavior: 'smooth' });
        const f = qs('#pillarform');
        f.onsubmit = e => {
          e.preventDefault();
          const fd = {};
          qa('input,select,textarea', f).forEach(el => fd[el.name] = el.value);
          const P = dPillars() || [];
          const o = {
            n: (fd.n || '').trim() || '01',
            i: fd.i,
            t: { en: fd.t_en, id: fd.t_id },
            d: { en: fd.d_en, id: fd.d_id }
          };
          if (i >= 0) P[i] = o;
          else P.push(o);
          DB.set('pillars', P);
          toast('Pilar tersimpan');
          router(true);
        };
        qs('#pillarcancel').onclick = () => { ed.innerHTML = ''; };
      };
      const ap = qs('#addpillar');
      if (ap) ap.onclick = () => open(-1);
      qa('[data-pe-pillar]').forEach(b => b.onclick = () => open(+b.dataset.pePillar));
      qa('[data-pd-pillar]').forEach(b => b.onclick = () => {
        if (confirm('Hapus pilar ini?')) {
          const P = dPillars() || [];
          P.splice(+b.dataset.pdPillar, 1);
          DB.set('pillars', P);
          toast('Pilar dihapus');
          router(true);
        }
      });
    }

    if (sub === 'why') {
      const ed = qs('#whyed');
      const open = i => {
        ed.innerHTML = aWhyForm(i);
        ed.scrollIntoView({ behavior: 'smooth' });
        const f = qs('#whyform');
        f.onsubmit = e => {
          e.preventDefault();
          const fd = {};
          qa('input,select,textarea', f).forEach(el => fd[el.name] = el.value);
          const W = dWhy() || [];
          const o = {
            i: fd.i,
            t: { en: fd.t_en, id: fd.t_id },
            d: { en: fd.d_en, id: fd.d_id }
          };
          if (i >= 0) W[i] = o;
          else W.push(o);
          DB.set('why', W);
          toast('Alasan tersimpan');
          router(true);
        };
        qs('#whycancel').onclick = () => { ed.innerHTML = ''; };
      };
      const aw = qs('#addwhy');
      if (aw) aw.onclick = () => open(-1);
      qa('[data-pe-why]').forEach(b => b.onclick = () => open(+b.dataset.peWhy));
      qa('[data-pd-why]').forEach(b => b.onclick = () => {
        if (confirm('Hapus alasan ini?')) {
          const W = dWhy() || [];
          W.splice(+b.dataset.pdWhy, 1);
          DB.set('why', W);
          toast('Alasan dihapus');
          router(true);
        }
      });
    }

    if (sub === 'industries') {
      const ed = qs('#inded');
      const open = i => {
        ed.innerHTML = aIndForm(i);
        ed.scrollIntoView({ behavior: 'smooth' });
        const f = qs('#indform');
        f.onsubmit = e => {
          e.preventDefault();
          const fd = {};
          qa('input,select,textarea', f).forEach(el => fd[el.name] = el.value);
          const IND = dIndustries() || [];
          const cases = [];
          if (fd.case1_en || fd.case1_id) cases.push({ en: fd.case1_en, id: fd.case1_id });
          if (fd.case2_en || fd.case2_id) cases.push({ en: fd.case2_en, id: fd.case2_id });
          const prods = (fd.prods || '').split(',').map(s => s.trim()).filter(Boolean);
          const o = {
            id: (fd.id || '').trim().toLowerCase(),
            i: fd.i,
            jp: (fd.jp || '').trim(),
            name: { en: fd.name_en, id: fd.name_id },
            d: { en: fd.d_en, id: fd.d_id },
            cases: cases,
            prods: prods
          };
          if (i >= 0) IND[i] = o;
          else IND.push(o);
          DB.set('industries', IND);
          toast('Industri tersimpan');
          router(true);
        };
        qs('#indcancel').onclick = () => { ed.innerHTML = ''; };
      };
      const ai = qs('#addind');
      if (ai) ai.onclick = () => open(-1);
      qa('[data-pe-ind]').forEach(b => b.onclick = () => open(+b.dataset.peInd));
      qa('[data-pd-ind]').forEach(b => b.onclick = () => {
        if (confirm('Hapus sektor industri ini?')) {
          const IND = dIndustries() || [];
          IND.splice(+b.dataset.pdInd, 1);
          DB.set('industries', IND);
          toast('Industri dihapus');
          router(true);
        }
      });
    }
  }

  if (T === 'products') {
    const ped = qs('#ped');
    const open = i => {
      ped.innerHTML = aProdForm(i);
      ped.scrollIntoView({ behavior: 'smooth' });

      const P = dP();
      const p = i >= 0 ? P[i] : null;
      let curImages = p && Array.isArray(p.images) ? [...p.images] : [];

      const gridEl = qs('#pimagesgrid');
      const jsonIn = qs('#pimagesjson');
      const fileIn = qs('#pimagesfile');
      const pickBtn = qs('#btnpickpimages');
      const msgEl = qs('#pimagesmsg');

      const renderGrid = () => {
        if (jsonIn) jsonIn.value = JSON.stringify(curImages);
        if (!gridEl) return;
        if (!curImages.length) {
          gridEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px;background:var(--card-bg, #f8fafc);border:1px dashed var(--line);border-radius:10px;color:var(--mut)" class="mini">📷 Belum ada foto yang diunggah. Klik tombol "Pilih & Unggah Foto" di atas.</div>';
          return;
        }
        gridEl.innerHTML = curImages.map((src, idx) => {
          return '<div class="adm-photoitem">'
            + '<img src="' + esc(src) + '" alt="Foto ' + (idx + 1) + '">'
            + (idx === 0 ? '<div class="adm-cover-tag">Foto Utama</div>' : '')
            + '<div class="adm-photo-acts">'
            + (idx > 0 ? '<button type="button" class="adm-photo-btn" data-pimg-cover="' + idx + '" title="Jadikan Foto Utama">⭐ Cover</button>' : '')
            + '<button type="button" class="adm-photo-btn adm-photo-del" data-pimg-del="' + idx + '" title="Hapus foto">🗑 Hapus</button>'
            + '</div>'
            + '</div>';
        }).join('');

        qa('[data-pimg-cover]', gridEl).forEach(btn => {
          btn.onclick = () => {
            const idx = +btn.dataset.pimgCover;
            const [item] = curImages.splice(idx, 1);
            curImages.unshift(item);
            renderGrid();
            toast('Foto utama diperbarui');
          };
        });

        qa('[data-pimg-del]', gridEl).forEach(btn => {
          btn.onclick = () => {
            const idx = +btn.dataset.pimgDel;
            curImages.splice(idx, 1);
            renderGrid();
            toast('Foto dihapus');
          };
        });
      };

      renderGrid();

      if (pickBtn && fileIn) {
        pickBtn.onclick = () => fileIn.click();
        fileIn.onchange = async () => {
          const files = Array.from(fileIn.files || []);
          if (!files.length) return;
          pickBtn.disabled = true;
          if (msgEl) {
            msgEl.style.color = 'var(--gold, #d97706)';
            msgEl.textContent = `Mengunggah ${files.length} foto... mohon tunggu`;
          }

          let uploadedCount = 0;
          for (const file of files) {
            if (file.size > 25 * 1024 * 1024) {
              alert(`File ${file.name} melebihi batas 25 MB`);
              continue;
            }
            const fd = new FormData();
            fd.append('file', file);
            try {
              const res = await authFetch('/api/upload', {
                method: 'POST',
                body: fd
              });
              if (res.ok) {
                const data = await res.json();
                const url = (data.file && data.file.url) || data.url;
                if (url) {
                  curImages.push(url);
                  uploadedCount++;
                }
              }
            } catch (err) {
              console.error('Upload error:', err);
            }
          }

          fileIn.value = '';
          pickBtn.disabled = false;
          if (msgEl) {
            msgEl.style.color = 'var(--grn, #16a34a)';
            msgEl.textContent = `✓ Berhasil mengunggah ${uploadedCount} foto.`;
            setTimeout(() => { if (msgEl) msgEl.textContent = ''; }, 4000);
          }
          renderGrid();
        };
      }

      // 3D Model file upload
      const m3dFile = qs('#pmodel3dfile');
      const m3dBtn = qs('#btnpickpmodel3d');
      const m3dUrl = qs('#pmodel3durl');
      const m3dMsg = qs('#pmodel3dmsg');

      if (m3dBtn && m3dFile) {
        m3dBtn.onclick = () => m3dFile.click();
        m3dFile.onchange = async () => {
          const file = m3dFile.files[0];
          if (!file) return;
          if (file.size > 50 * 1024 * 1024) {
            alert('Ukuran file 3D melebihi 50 MB');
            return;
          }
          m3dBtn.disabled = true;
          if (m3dMsg) {
            m3dMsg.style.color = 'var(--gold, #d97706)';
            m3dMsg.textContent = 'Mengunggah file 3D (.glb)...';
          }
          const fd = new FormData();
          fd.append('file', file);
          try {
            const res = await authFetch('/api/upload', {
              method: 'POST',
              body: fd
            });
            if (res.ok) {
              const data = await res.json();
              const url = (data.file && data.file.url) || data.url;
              if (url) {
                if (m3dUrl) m3dUrl.value = url;
                if (m3dMsg) {
                  m3dMsg.style.color = 'var(--grn, #16a34a)';
                  m3dMsg.textContent = '✓ File 3D berhasil diunggah!';
                }
              }
            } else {
              if (m3dMsg) {
                m3dMsg.style.color = 'var(--red, #dc2626)';
                m3dMsg.textContent = 'Gagal mengunggah file 3D';
              }
            }
          } catch (e) {
            if (m3dMsg) {
              m3dMsg.style.color = 'var(--red, #dc2626)';
              m3dMsg.textContent = 'Error: ' + e.message;
            }
          }
          m3dBtn.disabled = false;
          m3dFile.value = '';
        };
      }

      const f = qs('#pform');
      f.onsubmit = e => {
        e.preventDefault();
        const fd = {};
        qa('input,select,textarea', f).forEach(el => fd[el.name] = el.value);
        saveProd(fd);
        toast('Produk tersimpan');
        router(true);
      };
      qs('#pcancel').onclick = () => { ped.innerHTML = ''; };
    };
    const ap = qs('#addp');
    if (ap) ap.onclick = () => open(-1);
    qa('[data-pe]').forEach(b => b.onclick = () => open(+b.dataset.pe));
    qa('[data-pd]').forEach(b => b.onclick = () => {
      if (confirm('Hapus produk ini?')) {
        const P = dP();
        P.splice(+b.dataset.pd, 1);
        DB.set('products', P);
        toast('Produk dihapus');
        router(true);
      }
    });
  }

  if (T === 'factory-quality') {
    const sub = seg[2] || 'tour';

    if (sub === 'tour') {
      const ed = qs('#toured');
      const open = i => {
        ed.innerHTML = aTourForm(i);
        ed.scrollIntoView({ behavior: 'smooth' });
        const f = qs('#tourform');
        const upBtn = qs('#btnuploadtourvideo');
        const fileIn = qs('#tourvideofile');
        const upMsg = qs('#tourvideomsg');
        const urlIn = qs('#tourvideourl');
        const prevBox = qs('#tourvideoprev');
        const delBtn = qs('#btndeltourvideo');

        const updateTourVideoPreview = url => {
          const v = (url || '').trim();
          if (!v) {
            prevBox.innerHTML = '<div class="mini" style="color:var(--mut);background:#fff;padding:12px 14px;border-radius:8px;border:1px dashed var(--line)">ℹ Belum ada video untuk tahap ini. Default menampilkan Diagram Cetak Biru (Blueprint SVG).</div>';
            return;
          }
          const ytMatch = v.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
          if (ytMatch && ytMatch[1]) {
            prevBox.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + ytMatch[1] + '" style="width:100%;max-width:540px;height:290px;border-radius:10px;border:1px solid var(--line)"></iframe>';
          } else {
            prevBox.innerHTML = '<video controls playsinline style="width:100%;max-width:540px;max-height:290px;border-radius:10px;border:1px solid var(--line);background:#000;display:block"><source src="' + v + '" type="video/mp4"><source src="' + v + '" type="video/webm"></video>';
          }
        };

        if (urlIn) {
          urlIn.oninput = () => updateTourVideoPreview(urlIn.value);
        }

        if (delBtn) {
          delBtn.onclick = () => {
            if (urlIn) urlIn.value = '';
            updateTourVideoPreview('');
            delBtn.style.display = 'none';
            toast('Tautan video dibersihkan');
          };
        }

        if (upBtn && fileIn) {
          upBtn.onclick = async () => {
            const file = fileIn.files[0];
            if (!file) {
              alert('Pilih file video terlebih dahulu');
              return;
            }
            if (file.size > 100 * 1024 * 1024) {
              alert('Ukuran video melebihi batas 100 MB');
              return;
            }
            upBtn.disabled = true;
            upMsg.textContent = 'Mengunggah video... mohon tunggu';
            upMsg.style.color = 'var(--gold)';

            const formData = new FormData();
            formData.append('file', file);

            try {
              const res = await authFetch('/api/upload', {
                method: 'POST',
                body: formData
              });
              const data = await res.json();
              const videoUrl = (data.file && data.file.url) || data.url;
              const videoName = (data.file && data.file.filename) || data.filename || file.name;
              if (data.success && videoUrl) {
                if (urlIn) urlIn.value = videoUrl;
                upMsg.textContent = '✓ Video berhasil diunggah: ' + videoName;
                upMsg.style.color = '#10b981';
                updateTourVideoPreview(videoUrl);
                toast('Video berhasil diunggah ke server');
              } else {
                upMsg.textContent = 'Gagal upload: ' + (data.message || 'Error');
                upMsg.style.color = 'var(--red)';
                toast(data.message || 'Gagal upload video');
              }
            } catch (err) {
              upMsg.textContent = 'Error jaringan saat upload video';
              upMsg.style.color = 'var(--red)';
              toast('Error jaringan saat upload video');
            } finally {
              upBtn.disabled = false;
            }
          };
        }

        f.onsubmit = e => {
          e.preventDefault();
          const fd = {};
          qa('input,textarea', f).forEach(el => fd[el.name] = el.value);
          const T = dTour() || [];
          const o = {
            n: (fd.n || '').trim() || '01',
            jp: (fd.jp || '').trim(),
            name: { en: fd.name_en, id: fd.name_id },
            d: { en: fd.d_en, id: fd.d_id },
            data: parsePairs(fd.data),
            video: (fd.video || '').trim()
          };
          if (i >= 0) T[i] = o;
          else T.push(o);
          DB.set('tour', T);
          toast('Tahap tur tersimpan');
          router(true);
        };
        qs('#tourcancel').onclick = () => { ed.innerHTML = ''; };
      };
      const at = qs('#addtour');
      if (at) at.onclick = () => open(-1);
      qa('[data-pe-tour]').forEach(b => b.onclick = () => open(+b.dataset.peTour));
      qa('[data-pd-tour]').forEach(b => b.onclick = () => {
        if (confirm('Hapus tahap tur ini?')) {
          const T = dTour() || [];
          T.splice(+b.dataset.pdTour, 1);
          DB.set('tour', T);
          toast('Tahap tur dihapus');
          router(true);
        }
      });
    }

    if (sub === 'mach') {
      const ed = qs('#mached');
      const open = i => {
        ed.innerHTML = aMachForm(i);
        ed.scrollIntoView({ behavior: 'smooth' });
        const f = qs('#machform');
        f.onsubmit = e => {
          e.preventDefault();
          const fd = {};
          qa('input', f).forEach(el => fd[el.name] = el.value);
          const M = dMach() || [];
          const row = [(fd.name || '').trim(), (fd.qty || '').trim(), (fd.cap || '').trim(), (fd.fn || '').trim()];
          if (i >= 0) M[i] = row;
          else M.push(row);
          DB.set('mach', M);
          toast('Mesin tersimpan');
          router(true);
        };
        qs('#machcancel').onclick = () => { ed.innerHTML = ''; };
      };
      const am = qs('#addmach');
      if (am) am.onclick = () => open(-1);
      qa('[data-pe-mach]').forEach(b => b.onclick = () => open(+b.dataset.peMach));
      qa('[data-pd-mach]').forEach(b => b.onclick = () => {
        if (confirm('Hapus mesin ini?')) {
          const M = dMach() || [];
          M.splice(+b.dataset.pdMach, 1);
          DB.set('mach', M);
          toast('Mesin dihapus');
          router(true);
        }
      });
    }

    if (sub === 'flow') {
      const f = qs('#flowform');
      if (f) {
        f.onsubmit = e => {
          e.preventDefault();
          const fl = lines(f.flow.value);
          DB.set('flow', fl);
          toast('Alur produksi tersimpan');
          router(true);
        };
      }
    }

    if (sub === 'certs') {
      const ed = qs('#certed');
      const open = i => {
        ed.innerHTML = aCertForm(i);
        ed.scrollIntoView({ behavior: 'smooth' });
        const f = qs('#certform');
        f.onsubmit = e => {
          e.preventDefault();
          const fd = {};
          qa('input,textarea', f).forEach(el => fd[el.name] = el.value);
          const C = dCerts() || [];
          const o = {
            name: { en: fd.name_en, id: fd.name_id },
            d: { en: fd.d_en, id: fd.d_id }
          };
          if (i >= 0) C[i] = o;
          else C.push(o);
          DB.set('certs', C);
          toast('Sertifikasi tersimpan');
          router(true);
        };
        qs('#certcancel').onclick = () => { ed.innerHTML = ''; };
      };
      const ac = qs('#addcert');
      if (ac) ac.onclick = () => open(-1);
      qa('[data-pe-cert]').forEach(b => b.onclick = () => open(+b.dataset.peCert));
      qa('[data-pd-cert]').forEach(b => b.onclick = () => {
        if (confirm('Hapus sertifikasi ini?')) {
          const C = dCerts() || [];
          C.splice(+b.dataset.pdCert, 1);
          DB.set('certs', C);
          toast('Sertifikasi dihapus');
          router(true);
        }
      });
    }
  }

  if (T === 'way-corporate') {
    const sub = seg[2] || 'way';

    if (sub === 'way') {
      const ed = qs('#wayped');
      const open = i => {
        ed.innerHTML = aWayPForm(i);
        ed.scrollIntoView({ behavior: 'smooth' });
        const f = qs('#waypform');
        f.onsubmit = e => {
          e.preventDefault();
          const fd = {};
          qa('input,textarea', f).forEach(el => fd[el.name] = el.value);
          const W = dWay() || [];
          const o = {
            kj: (fd.kj || '').trim(),
            n: (fd.n || '').trim(),
            s: { en: fd.s_en, id: fd.s_id },
            d: { en: fd.d_en, id: fd.d_id }
          };
          if (i >= 0) W[i] = o;
          else W.push(o);
          DB.set('way', W);
          toast('Prinsip tersimpan');
          router(true);
        };
        qs('#waypcancel').onclick = () => { ed.innerHTML = ''; };
      };
      const aw = qs('#addwayp');
      if (aw) aw.onclick = () => open(-1);
      qa('[data-pe-wayp]').forEach(b => b.onclick = () => open(+b.dataset.peWayp));
      qa('[data-pd-wayp]').forEach(b => b.onclick = () => {
        if (confirm('Hapus prinsip ini?')) {
          const W = dWay() || [];
          W.splice(+b.dataset.pdWayp, 1);
          DB.set('way', W);
          toast('Prinsip dihapus');
          router(true);
        }
      });
    }

    if (sub === 'hist') {
      const ed = qs('#histed');
      const open = i => {
        ed.innerHTML = aHistForm(i);
        ed.scrollIntoView({ behavior: 'smooth' });
        const f = qs('#histform');
        f.onsubmit = e => {
          e.preventDefault();
          const fd = {};
          qa('input,textarea', f).forEach(el => fd[el.name] = el.value);
          const H = dHist() || [];
          const o = {
            yr: (fd.yr || '').trim(),
            t: { en: fd.t_en, id: fd.t_id }
          };
          if (i >= 0) H[i] = o;
          else H.push(o);
          DB.set('hist', H);
          toast('Sejarah tersimpan');
          router(true);
        };
        qs('#histcancel').onclick = () => { ed.innerHTML = ''; };
      };
      const ah = qs('#addhist');
      if (ah) ah.onclick = () => open(-1);
      qa('[data-pe-hist]').forEach(b => b.onclick = () => open(+b.dataset.peHist));
      qa('[data-pd-hist]').forEach(b => b.onclick = () => {
        if (confirm('Hapus tahun sejarah ini?')) {
          const H = dHist() || [];
          H.splice(+b.dataset.pdHist, 1);
          DB.set('hist', H);
          toast('Sejarah dihapus');
          router(true);
        }
      });
    }

    if (sub === 'gov') {
      const ed = qs('#goved');
      const open = i => {
        ed.innerHTML = aGovForm(i);
        ed.scrollIntoView({ behavior: 'smooth' });
        const f = qs('#govform');
        f.onsubmit = e => {
          e.preventDefault();
          const fd = {};
          qa('textarea', f).forEach(el => fd[el.name] = el.value);
          const G = dGov() || [];
          const o = { en: fd.t_en, id: fd.t_id };
          if (i >= 0) G[i] = o;
          else G.push(o);
          DB.set('gov', G);
          toast('Tata kelola tersimpan');
          router(true);
        };
        qs('#govcancel').onclick = () => { ed.innerHTML = ''; };
      };
      const ag = qs('#addgov');
      if (ag) ag.onclick = () => open(-1);
      qa('[data-pe-gov]').forEach(b => b.onclick = () => open(+b.dataset.peGov));
      qa('[data-pd-gov]').forEach(b => b.onclick = () => {
        if (confirm('Hapus poin tata kelola ini?')) {
          const G = dGov() || [];
          G.splice(+b.dataset.pdGov, 1);
          DB.set('gov', G);
          toast('Tata kelola dihapus');
          router(true);
        }
      });
    }
  }

  if (T === 'news') {
    const ned = qs('#ned');
    const open = i => {
      ned.innerHTML = aNewsForm(i);
      ned.scrollIntoView({ behavior: 'smooth' });
      const f = qs('#nform');
      f.onsubmit = e => {
        e.preventDefault();
        const fd = {};
        qa('input,textarea', f).forEach(el => fd[el.name] = el.value);
        saveNews(fd);
        toast('Berita tersimpan');
        router(true);
      };
      qs('#ncancel').onclick = () => { ned.innerHTML = ''; };
    };
    const an = qs('#addn');
    if (an) an.onclick = () => open(-1);
    qa('[data-ne]').forEach(b => b.onclick = () => open(+b.dataset.ne));
    qa('[data-nd]').forEach(b => b.onclick = () => {
      if (confirm('Hapus berita ini?')) {
        const N = dN();
        N.splice(+b.dataset.nd, 1);
        DB.set('news', N);
        toast('Berita dihapus');
        router(true);
      }
    });
  }

  if (T === 'caps') {
    const f = qs('#cform');
    if (f) {
      f.onsubmit = e => {
        e.preventDefault();
        const fd = {};
        qa('input,textarea', f).forEach(el => fd[el.name] = el.value);
        saveCaps(fd);
        toast('Kapabilitas tersimpan');
        router(true);
      };
    }
  }

  if (T === 'resources') {
    const red = qs('#red');
    const open = i => {
      red.innerHTML = aResForm(i);
      red.scrollIntoView({ behavior: 'smooth' });
      const f = qs('#rform');
      f.onsubmit = e => {
        e.preventDefault();
        const fd = {};
        qa('input,select,textarea', f).forEach(el => fd[el.name] = el.value);
        saveRes(fd);
        toast('Dokumen tersimpan');
        router(true);
      };
      qs('#rcancel').onclick = () => { red.innerHTML = ''; };

      // File upload handler
      const upBtn = qs('#btnuploadres');
      const fileIn = qs('#resuploadfile');
      const upMsg = qs('#uploadmsg');
      if (upBtn && fileIn) {
        upBtn.onclick = async () => {
          if (!fileIn.files || !fileIn.files[0]) {
            toast('Pilih file terlebih dahulu');
            return;
          }
          const file = fileIn.files[0];
          const formData = new FormData();
          formData.append('file', file);
          if (upMsg) upMsg.textContent = 'Mengunggah file...';
          try {
            const res = await authFetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            const data = await res.json();
            if (res.ok && data.success && data.url) {
              const urlIn = f.querySelector('input[name="url"]');
              if (urlIn) urlIn.value = data.url;
              const sizeIn = f.querySelector('input[name="size"]');
              if (sizeIn && !sizeIn.value) {
                const mb = (data.size_bytes / (1024 * 1024)).toFixed(1);
                sizeIn.value = mb > 0.1 ? mb + ' MB' : Math.round(data.size_bytes / 1024) + ' KB';
              }
              if (upMsg) upMsg.textContent = '✓ Berhasil diunggah: ' + esc(data.orig_name);
              toast('File berhasil diunggah');
            } else {
              if (upMsg) upMsg.textContent = 'Gagal: ' + (data.message || 'Error');
              toast('Gagal mengunggah file');
            }
          } catch (err) {
            if (upMsg) upMsg.textContent = 'Gagal: ' + err.message;
            toast('Error jaringan saat upload');
          }
        };
      }
    };
    const ar = qs('#addr');
    if (ar) ar.onclick = () => open(-1);
    qa('[data-re]').forEach(b => b.onclick = () => open(+b.dataset.re));
    qa('[data-rd]').forEach(b => b.onclick = () => {
      if (confirm('Hapus dokumen ini?')) {
        const R = dR();
        R.splice(+b.dataset.rd, 1);
        DB.set('resources', R);
        toast('Dokumen dihapus');
        router(true);
      }
    });
  }

  if (T === 'profile') {
    const f = qs('#profform');
    if (f) {
      const updatePreview = () => {
        const previewBox = qs('#logopreviewbox');
        if (!previewBox) return;
        const urlIn = f.querySelector('input[name="logoUrl"]');
        const t1In = f.querySelector('input[name="logoText1"]');
        const t2In = f.querySelector('input[name="logoText2"]');
        const nameIn = f.querySelector('input[name="name"]');
        const u = urlIn ? urlIn.value.trim() : '';
        const t1 = (t1In && t1In.value.trim()) || 'JIDOKA RESULT';
        const t2 = (t2In && t2In.value.trim()) || 'INDONESIA';
        const n = (nameIn && nameIn.value.trim()) || 'JRI';
        previewBox.querySelectorAll('.logo-preview-display').forEach(d => {
          d.innerHTML = '<div class="logo">' + logo(u, n) + '<span class="logo-t"><b>' + esc(t1) + '</b><i>' + esc(t2) + '</i></span></div>';
        });
      };

      f.onsubmit = e => {
        e.preventDefault();
        const fd = {};
        qa('input,textarea', f).forEach(el => fd[el.name] = el.value);
        saveProfile(fd);
        toast('Profil & Logo berhasil disimpan');
        router(true);
      };

      const upBtn = qs('#btnuploadlogo');
      const fileIn = qs('#logouploadfile');
      const upMsg = qs('#logouploadmsg');
      const resetBtn = qs('#btnresetlogo');

      if (upBtn && fileIn) {
        upBtn.onclick = async () => {
          if (!fileIn.files || !fileIn.files[0]) {
            toast('Pilih file gambar logo terlebih dahulu');
            return;
          }
          const file = fileIn.files[0];
          const formData = new FormData();
          formData.append('file', file);
          if (upMsg) upMsg.textContent = 'Mengunggah logo...';
          try {
            const res = await authFetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            const data = await res.json();
            if (res.ok && data.success && data.url) {
              const urlIn = f.querySelector('input[name="logoUrl"]');
              if (urlIn) urlIn.value = data.url;
              if (upMsg) upMsg.textContent = '✓ Logo berhasil diunggah: ' + esc(data.orig_name);
              updatePreview();
              toast('Logo berhasil diunggah');
            } else {
              if (upMsg) upMsg.textContent = 'Gagal: ' + (data.message || 'Error');
              toast('Gagal mengunggah logo');
            }
          } catch (err) {
            if (upMsg) upMsg.textContent = 'Gagal: ' + err.message;
            toast('Error jaringan saat upload');
          }
        };
      }

      if (resetBtn) {
        resetBtn.onclick = () => {
          const urlIn = f.querySelector('input[name="logoUrl"]');
          if (urlIn) urlIn.value = '';
          if (upMsg) upMsg.textContent = 'Logo direset ke SVG emblem bawaan.';
          updatePreview();
          toast('Kembali ke logo SVG emblem bawaan');
        };
      }

      ['logoUrl', 'logoText1', 'logoText2', 'name'].forEach(fld => {
        const inp = f.querySelector('input[name="' + fld + '"]');
        if (inp) inp.oninput = updatePreview;
      });
    }
  }

  if (T === 'users') {
    const tableBox = qs('#users-table-box');
    const modalBox = qs('#user-modal-container');
    const addBtn = qs('#btn-add-user');
    const curUser = getUser() || {};

    const loadUsers = async () => {
      if (!tableBox) return;
      tableBox.innerHTML = '<p class="tiny" style="color:var(--mut)">Memuat daftar pengguna...</p>';
      const res = await getUsers();
      if (!res.success || !Array.isArray(res.data)) {
        tableBox.innerHTML = '<p class="tiny" style="color:var(--red)">' + esc(res.message || 'Gagal memuat pengguna') + '</p>';
        return;
      }

      const users = res.data;
      if (users.length === 0) {
        tableBox.innerHTML = '<p class="empty">Belum ada pengguna terdaftar.</p>';
        return;
      }

      tableBox.innerHTML = '<div class="tbl"><table>'
        + '<thead><tr>'
        + '<th>Nama & Email</th>'
        + '<th>Peran</th>'
        + '<th>Google Authenticator</th>'
        + '<th>Tanggal Dibuat</th>'
        + '<th style="text-align:right">Aksi</th>'
        + '</tr></thead>'
        + '<tbody>'
        + users.map(u => {
          const isSelf = curUser.id === u.id || curUser.email === u.email;
          const roleBadge = u.role === 'admin'
            ? '<span class="mfa-badge on" style="font-size:10px">Administrator</span>'
            : '<span class="mfa-badge off" style="font-size:10px">Editor</span>';
          const mfaBadge = u.mfa_enabled
            ? '<span class="mfa-badge on" style="font-size:10px">' + ic('checkc') + ' Aktif 🛡️</span>'
            : '<span class="mfa-badge off" style="font-size:10px">⚠️ Belum Aktif</span>';
          const dateStr = u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

          return '<tr data-uid="' + u.id + '">'
            + '<td><b>' + esc(u.name || 'Admin') + '</b>' + (isSelf ? ' <small style="color:var(--red)">(Anda)</small>' : '')
            + '<br><span class="mini" style="color:var(--mut)">' + esc(u.email) + '</span></td>'
            + '<td>' + roleBadge + '</td>'
            + '<td>' + mfaBadge + '</td>'
            + '<td class="mini">' + esc(dateStr) + '</td>'
            + '<td style="text-align:right"><div style="display:inline-flex;gap:6px;justify-content:flex-end">'
            + '<button type="button" class="btn btn-line btn-sm" data-edit-u="' + u.id + '" title="Edit Pengguna">' + ic('edit') + '</button>'
            + (u.mfa_enabled ? '<button type="button" class="btn btn-line btn-sm" data-reset-mfa-u="' + u.id + '" title="Reset MFA (jika HP hilang)" style="color:#d97706;border-color:#fde68a">' + ic('shield') + ' Reset MFA</button>' : '')
            + (!isSelf ? '<button type="button" class="btn btn-sm" data-del-u="' + u.id + '" title="Hapus Pengguna" style="color:var(--red);border:1.5px solid var(--red);border-radius:8px;padding:6px 10px;background:#fff">' + ic('trash') + '</button>' : '')
            + '</div></td></tr>';
        }).join('')
        + '</tbody></table></div>';

      // Bind edit buttons
      qa('[data-edit-u]').forEach(btn => {
        btn.onclick = () => {
          const u = users.find(x => x.id === Number(btn.dataset.editU));
          if (u) openEditModal(u);
        };
      });

      // Bind reset MFA buttons
      qa('[data-reset-mfa-u]').forEach(btn => {
        btn.onclick = () => {
          const u = users.find(x => x.id === Number(btn.dataset.resetMfaU));
          if (u) openResetMfaModal(u);
        };
      });

      // Bind delete buttons
      qa('[data-del-u]').forEach(btn => {
        btn.onclick = () => {
          const u = users.find(x => x.id === Number(btn.dataset.delU));
          if (u) openDeleteModal(u);
        };
      });
    };

    const closeModal = () => {
      if (modalBox) modalBox.innerHTML = '';
    };

    const openAddModal = () => {
      modalBox.innerHTML = '<div class="mfa-modal-overlay"><div class="mfa-modal">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<h4>Tambah Pengguna Admin Baru</h4>'
        + '<button type="button" class="btn-close" id="u-close" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--mut)">' + ic('x') + '</button>'
        + '</div>'
        + '<p class="tiny" style="margin:6px 0 14px">Buat akun untuk staf atau pengelola website. Pengguna dapat langsung login dan mengaktifkan Google Authenticator sendiri di ponselnya.</p>'
        + '<form id="u-add-form" class="form" style="grid-template-columns:1fr">'
        + '<div class="f"><label>Nama Lengkap</label><input type="text" id="u-name" required placeholder="Contoh: Budi Santoso"></div>'
        + '<div class="f"><label>Email</label><input type="email" id="u-email" required placeholder="nama@jidoka.co.id"></div>'
        + '<div class="f"><label>Peran (Hak Akses)</label><select id="u-role"><option value="admin">Administrator (Hak Akses Penuh)</option><option value="editor">Editor (Hanya Kelola Konten)</option></select></div>'
        + '<div class="f"><label>Kata Sandi Awal (Minimal 8 karakter huruf & angka)</label><input type="password" id="u-pw" required placeholder="Minimal 8 karakter"></div>'
        + '<div class="err" id="u-err"></div>'
        + '<div style="display:flex;gap:10px;margin-top:14px">'
        + '<button class="btn btn-red" style="flex:1" id="u-sub-btn">Simpan Pengguna</button>'
        + '<button type="button" class="btn btn-line" id="u-cancel">Batal</button>'
        + '</div></form>'
        + '</div></div>';

      qs('#u-close').onclick = closeModal;
      qs('#u-cancel').onclick = closeModal;

      qs('#u-add-form').onsubmit = async e => {
        e.preventDefault();
        const name = qs('#u-name').value;
        const email = qs('#u-email').value;
        const role = qs('#u-role').value;
        const password = qs('#u-pw').value;
        const btn = qs('#u-sub-btn');
        btn.disabled = true;
        btn.textContent = 'Menyimpan...';

        const res = await createUser({ name, email, role, password });
        if (res.success) {
          toast('Pengguna baru berhasil ditambahkan');
          closeModal();
          loadUsers();
        } else {
          btn.disabled = false;
          btn.textContent = 'Simpan Pengguna';
          const errEl = qs('#u-err');
          if (errEl) {
            errEl.textContent = res.message || 'Gagal menambah pengguna';
            errEl.style.display = 'block';
          }
        }
      };
    };

    const openEditModal = (u) => {
      modalBox.innerHTML = '<div class="mfa-modal-overlay"><div class="mfa-modal">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<h4>Edit Pengguna</h4>'
        + '<button type="button" class="btn-close" id="u-edit-close" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--mut)">' + ic('x') + '</button>'
        + '</div>'
        + '<p class="tiny" style="margin:6px 0 14px">Ubah nama, peran, atau reset kata sandi untuk akun <b>' + esc(u.email) + '</b>.</p>'
        + '<form id="u-edit-form" class="form" style="grid-template-columns:1fr">'
        + '<div class="f"><label>Nama Lengkap</label><input type="text" id="u-edit-name" value="' + esc(u.name || '') + '" required></div>'
        + '<div class="f"><label>Email (Tidak dapat diubah)</label><input type="email" value="' + esc(u.email) + '" disabled style="background:#f1f5f9;cursor:not-allowed"></div>'
        + '<div class="f"><label>Peran (Hak Akses)</label><select id="u-edit-role"><option value="admin"' + (u.role === 'admin' ? ' selected' : '') + '>Administrator (Hak Akses Penuh)</option><option value="editor"' + (u.role === 'editor' ? ' selected' : '') + '>Editor (Hanya Kelola Konten)</option></select></div>'
        + '<div class="f"><label>Ganti Kata Sandi (Kosongkan jika tidak ingin diubah)</label><input type="password" id="u-edit-pw" placeholder="Minimal 8 karakter jika diisi"></div>'
        + '<div class="err" id="u-edit-err"></div>'
        + '<div style="display:flex;gap:10px;margin-top:14px">'
        + '<button class="btn btn-red" style="flex:1" id="u-edit-sub">Simpan Perubahan</button>'
        + '<button type="button" class="btn btn-line" id="u-edit-cancel">Batal</button>'
        + '</div></form>'
        + '</div></div>';

      qs('#u-edit-close').onclick = closeModal;
      qs('#u-edit-cancel').onclick = closeModal;

      qs('#u-edit-form').onsubmit = async e => {
        e.preventDefault();
        const name = qs('#u-edit-name').value;
        const role = qs('#u-edit-role').value;
        const password = qs('#u-edit-pw').value;
        const btn = qs('#u-edit-sub');
        btn.disabled = true;
        btn.textContent = 'Menyimpan...';

        const payload = { name, role };
        if (password && password.trim()) payload.password = password.trim();

        const res = await updateUser(u.id, payload);
        if (res.success) {
          toast('Data pengguna berhasil diperbarui');
          closeModal();
          loadUsers();
        } else {
          btn.disabled = false;
          btn.textContent = 'Simpan Perubahan';
          const errEl = qs('#u-edit-err');
          if (errEl) {
            errEl.textContent = res.message || 'Gagal update pengguna';
            errEl.style.display = 'block';
          }
        }
      };
    };

    const openResetMfaModal = (u) => {
      modalBox.innerHTML = '<div class="mfa-modal-overlay"><div class="mfa-modal">'
        + '<div style="display:flex;align-items:center;gap:8px">' + ic('shield') + '<h4 style="margin:0;color:#d97706">Konfirmasi Reset MFA</h4></div>'
        + '<p class="tiny" style="margin:12px 0 16px">Apakah Anda yakin ingin me-reset Google Authenticator untuk akun <b>' + esc(u.email) + '</b>?<br><br>'
        + 'Fitur ini digunakan saat ponsel staf hilang atau rusak. Status MFA akan dikembalikan ke <b>Nonaktif</b> sehingga staf dapat login menggunakan kata sandinya dan mendaftarkan ponsel barunya.</p>'
        + '<div style="display:flex;gap:10px">'
        + '<button class="btn btn-red" style="flex:1" id="u-conf-reset-mfa">Ya, Reset MFA Staf</button>'
        + '<button type="button" class="btn btn-line" id="u-cancel-reset-mfa">Batal</button>'
        + '</div></div></div>';

      qs('#u-cancel-reset-mfa').onclick = closeModal;
      qs('#u-conf-reset-mfa').onclick = async () => {
        const btn = qs('#u-conf-reset-mfa');
        btn.disabled = true;
        btn.textContent = 'Mereset...';
        const res = await resetUserMfa(u.id);
        if (res.success) {
          toast('MFA akun staf berhasil di-reset');
          closeModal();
          loadUsers();
        } else {
          btn.disabled = false;
          btn.textContent = 'Ya, Reset MFA Staf';
          toast(res.message || 'Gagal reset MFA');
        }
      };
    };

    const openDeleteModal = (u) => {
      modalBox.innerHTML = '<div class="mfa-modal-overlay"><div class="mfa-modal">'
        + '<div style="display:flex;align-items:center;gap:8px">' + ic('trash') + '<h4 style="margin:0;color:var(--red)">Hapus Pengguna</h4></div>'
        + '<p class="tiny" style="margin:12px 0 16px">Apakah Anda yakin ingin menghapus akun <b>' + esc(u.name || u.email) + ' (' + esc(u.email) + ')</b>?<br><br>Akun ini tidak akan dapat login lagi ke Admin CMS.</p>'
        + '<div style="display:flex;gap:10px">'
        + '<button class="btn btn-red" style="flex:1" id="u-conf-del">Hapus Akun</button>'
        + '<button type="button" class="btn btn-line" id="u-cancel-del">Batal</button>'
        + '</div></div></div>';

      qs('#u-cancel-del').onclick = closeModal;
      qs('#u-conf-del').onclick = async () => {
        const btn = qs('#u-conf-del');
        btn.disabled = true;
        btn.textContent = 'Menghapus...';
        const res = await deleteUser(u.id);
        if (res.success) {
          toast('Pengguna berhasil dihapus');
          closeModal();
          loadUsers();
        } else {
          btn.disabled = false;
          btn.textContent = 'Hapus Akun';
          toast(res.message || 'Gagal menghapus pengguna');
        }
      };
    };

    if (addBtn) addBtn.onclick = openAddModal;
    loadUsers();
  }

  if (T === 'company') {
    qa('[data-pw-target]').forEach(btn => {
      btn.onclick = () => {
        const inp = qs('#' + btn.dataset.pwTarget);
        if (inp) {
          const isPw = inp.type === 'password';
          inp.type = isPw ? 'text' : 'password';
          btn.innerHTML = isPw ? ic('eyeOff') : ic('eye');
          btn.setAttribute('aria-label', isPw ? 'Sembunyikan password' : 'Lihat password');
        }
      };
    });
    const f = qs('#coform');
    if (f) {
      initHeroLightControls(f);
      f.onsubmit = async e => {
        e.preventDefault();
        const fd = {};
        qa('input,textarea', f).forEach(el => fd[el.name] = el.value);
        const curCo = dCo() || {};
        DB.set('company', {
          ...curCo,
          phone: fd.phone,
          wa: (fd.wa || '').trim(),
          waMsg: (fd.waMsg || '').trim(),
          sales: fd.sales,
          corp: fd.corp,
          addr: fd.addr,
          hours: fd.hours,
          video: (fd.video || '').trim(),
          heroLight: Number(fd.heroLight !== undefined ? fd.heroLight : 50),
          mapLabel: (fd.mapLabel || '').trim(),
          mapQuery: (fd.mapQuery || '').trim(),
          mapEmbed: (fd.mapEmbed || '').trim()
        });
        if (fd.npw) {
          try {
            const res = await authFetch('/api/auth/password', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password: fd.npw })
            });
            const data = await res.json();
            if (res.ok && data.success) {
              toast('Password admin diperbarui');
            } else {
              toast(data.message || 'Gagal update password');
            }
          } catch (err) {
            toast('Gagal menghubungi server');
          }
        }
        toast('Tersimpan');
        router(true);
      };
    }

    // MFA Management in Company Tab
    const mfaSec = qs('#mfasec');
    if (mfaSec) {
      const badgeEl = qs('#mfa-status-badge');
      const actionsEl = qs('#mfa-actions-box');
      const modalEl = qs('#mfa-modal-container');

      const renderStatus = async () => {
        try {
          const st = await getMfaStatus();
          if (st.mfa_enabled) {
            badgeEl.innerHTML = '<span class="mfa-badge on">' + ic('checkc') + ' Aktif & Terlindungi</span>';
            actionsEl.innerHTML = '<div style="display:flex;flex-direction:column;gap:12px">'
              + '<p class="tiny" style="color:var(--txt)">Akun Admin saat ini terlindungi dengan autentikasi dua faktor Google Authenticator.<br>'
              + 'Sisa Kode Cadangan Darurat: <b>' + (st.backup_codes_remaining || 0) + ' kode</b></p>'
              + '<div style="display:flex;gap:10px;flex-wrap:wrap">'
              + '<button type="button" class="btn btn-line btn-sm" id="btn-mfa-regen">' + ic('sync') + ' Buat Ulang Kode Cadangan</button>'
              + '<button type="button" class="btn btn-sm" id="btn-mfa-disable" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 14px;background:#fff">' + ic('trash') + ' Nonaktifkan MFA</button>'
              + '</div></div>';

            const regenBtn = qs('#btn-mfa-regen');
            if (regenBtn) regenBtn.onclick = () => showRegenModal();

            const disableBtn = qs('#btn-mfa-disable');
            if (disableBtn) disableBtn.onclick = () => showDisableModal();
          } else {
            badgeEl.innerHTML = '<span class="mfa-badge off">⚠️ Belum Aktif</span>';
            actionsEl.innerHTML = '<div style="display:flex;flex-direction:column;gap:12px">'
              + '<p class="tiny" style="color:var(--txt)">Akun saat ini hanya dilindungi kata sandi. Sangat disarankan mengaktifkan Google Authenticator untuk mencegah akses tidak sah.</p>'
              + '<div><button type="button" class="btn btn-red btn-sm" id="btn-mfa-setup">' + ic('shield') + ' Aktifkan Google Authenticator</button></div>'
              + '</div>';

            const setupBtn = qs('#btn-mfa-setup');
            if (setupBtn) setupBtn.onclick = () => showSetupModal();
          }
        } catch (e) {
          badgeEl.innerHTML = '<span class="mfa-badge off">Gagal memuat status</span>';
        }
      };

      const closeModal = () => {
        if (modalEl) modalEl.innerHTML = '';
      };

      const showSetupModal = async () => {
        modalEl.innerHTML = '<div class="mfa-modal-overlay"><div class="mfa-modal">'
          + '<h4>Menyiapkan Google Authenticator...</h4>'
          + '<p class="tiny">Menghubungi server untuk membuat kunci rahasia aman...</p>'
          + '</div></div>';

        const res = await setupMfa();
        if (!res.success) {
          modalEl.innerHTML = '<div class="mfa-modal-overlay"><div class="mfa-modal">'
            + '<h4>Gagal Memulai Setup</h4>'
            + '<p class="tiny" style="color:var(--red)">' + esc(res.message || 'Terjadi kesalahan') + '</p>'
            + '<button type="button" class="btn btn-line btn-sm" id="mfa-close-err" style="margin-top:14px">Tutup</button>'
            + '</div></div>';
          qs('#mfa-close-err').onclick = closeModal;
          return;
        }

        const formattedSecret = (res.secret.match(/.{1,4}/g) || [res.secret]).join(' ');

        modalEl.innerHTML = '<div class="mfa-modal-overlay"><div class="mfa-modal">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<h4>Aktivasi Google Authenticator</h4>'
          + '<button type="button" class="btn-close" id="mfa-close-x" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--mut)">' + ic('x') + '</button>'
          + '</div>'
          + '<p class="tiny" style="margin:6px 0 12px">Ikuti 2 langkah berikut untuk mengamankan akun Admin:</p>'
          + '<div style="background:#f8fafc;border:1px solid var(--bdr);border-radius:8px;padding:12px;margin-bottom:14px">'
          + '<b style="font-size:13px;display:block;margin-bottom:6px">Langkah 1: Pindai QR Code di Google Authenticator</b>'
          + '<p class="tiny">Buka aplikasi Google Authenticator di ponsel Anda, tap ikon <b>+</b> dan pilih <b>Scan a QR code</b>.</p>'
          + '<div style="text-align:center"><div class="mfa-qr-box">' + res.qrSvg + '</div></div>'
          + '<div style="text-align:center;margin-top:4px">'
          + '<span class="mini" style="display:block;margin-bottom:4px">Atau masukkan Kunci Rahasia ini secara manual:</span>'
          + '<span class="mfa-secret-key" id="mfasecrettext">' + esc(formattedSecret) + '</span>'
          + '<div style="margin-top:6px"><button type="button" class="btn btn-line btn-sm" id="btn-copy-secret" style="font-size:11px;padding:4px 8px">📋 Salin Kunci</button></div>'
          + '</div></div>'
          + '<form id="mfa-verify-setup-form">'
          + '<b style="font-size:13px;display:block;margin-bottom:6px">Langkah 2: Konfirmasi Kode 6-Digit</b>'
          + '<p class="tiny" style="margin-bottom:8px">Masukkan 6 digit kode yang tampil di Google Authenticator:</p>'
          + '<input type="text" id="mfa-setup-code" maxlength="6" inputmode="numeric" placeholder="000 000" class="mfa-input" style="width:100%" required autofocus>'
          + '<div class="err" id="mfa-setup-err" style="margin-top:6px"></div>'
          + '<div style="display:flex;gap:10px;margin-top:14px">'
          + '<button class="btn btn-red" style="flex:1" id="btn-submit-setup">Verifikasi & Aktifkan</button>'
          + '<button type="button" class="btn btn-line" id="mfa-cancel-setup">Batal</button>'
          + '</div></form>'
          + '</div></div>';

        qs('#mfa-close-x').onclick = closeModal;
        qs('#mfa-cancel-setup').onclick = closeModal;

        qs('#btn-copy-secret').onclick = () => {
          navigator.clipboard.writeText(res.secret);
          toast('Kunci rahasia disalin ke clipboard');
        };

        const setupForm = qs('#mfa-verify-setup-form');
        setupForm.onsubmit = async e => {
          e.preventDefault();
          const code = qs('#mfa-setup-code').value;
          const subBtn = qs('#btn-submit-setup');
          subBtn.disabled = true;
          subBtn.textContent = 'Memverifikasi...';

          const verRes = await verifyMfaSetup(code);
          if (verRes.success) {
            toast('Google Authenticator berhasil diaktifkan!');
            showBackupCodesModal(verRes.backupCodes || []);
            renderStatus();
          } else {
            subBtn.disabled = false;
            subBtn.textContent = 'Verifikasi & Aktifkan';
            const errEl = qs('#mfa-setup-err');
            if (errEl) {
              errEl.textContent = verRes.message || 'Kode tidak valid';
              errEl.style.display = 'block';
            }
          }
        };
      };

      const showBackupCodesModal = (codes) => {
        const gridHtml = codes.map(c => '<div class="mfa-backup-item">' + esc(c) + '</div>').join('');
        modalEl.innerHTML = '<div class="mfa-modal-overlay"><div class="mfa-modal">'
          + '<div style="display:flex;align-items:center;gap:8px">' + ic('checkc') + '<h4 style="margin:0;color:#166534">MFA Berhasil Diaktifkan!</h4></div>'
          + '<p class="tiny" style="margin:10px 0 6px">Simpan <b>8 Kode Cadangan Darurat</b> ini di tempat yang aman. Setiap kode hanya dapat digunakan satu kali untuk login jika Anda kehilangan akses ke ponsel Anda:</p>'
          + '<div class="mfa-backup-grid">' + gridHtml + '</div>'
          + '<div style="display:flex;gap:10px;margin-top:18px">'
          + '<button type="button" class="btn btn-line btn-sm" id="btn-copy-backup" style="flex:1">📋 Salin Semua Kode</button>'
          + '<button type="button" class="btn btn-red btn-sm" id="btn-close-backup" style="flex:1">Selesai (Tutup)</button>'
          + '</div></div></div>';

        qs('#btn-copy-backup').onclick = () => {
          navigator.clipboard.writeText(codes.join('\n'));
          toast('Semua kode cadangan disalin ke clipboard');
        };

        qs('#btn-close-backup').onclick = () => {
          closeModal();
          renderStatus();
        };
      };

      const showDisableModal = () => {
        modalEl.innerHTML = '<div class="mfa-modal-overlay"><div class="mfa-modal">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<h4 style="color:var(--red)">Nonaktifkan Google Authenticator</h4>'
          + '<button type="button" class="btn-close" id="mfa-dis-close" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--mut)">' + ic('x') + '</button>'
          + '</div>'
          + '<p class="tiny" style="margin:8px 0 14px">Untuk keamanan, masukkan password admin dan kode 6 digit Google Authenticator saat ini untuk mengonfirmasi penonaktifan:</p>'
          + '<form id="mfa-dis-form" class="form" style="grid-template-columns:1fr">'
          + '<div class="f"><label>Password Admin</label><input type="password" id="mfa-dis-pw" required></div>'
          + '<div class="f"><label>Kode Google Authenticator Saat Ini (6 Digit)</label><input type="text" id="mfa-dis-code" maxlength="6" inputmode="numeric" placeholder="000 000" class="mfa-input" required></div>'
          + '<div class="err" id="mfa-dis-err"></div>'
          + '<div style="display:flex;gap:10px;margin-top:14px">'
          + '<button class="btn btn-red" style="flex:1" id="mfa-dis-btn">Konfirmasi Nonaktifkan</button>'
          + '<button type="button" class="btn btn-line" id="mfa-dis-cancel">Batal</button>'
          + '</div></form>'
          + '</div></div>';

        qs('#mfa-dis-close').onclick = closeModal;
        qs('#mfa-dis-cancel').onclick = closeModal;

        qs('#mfa-dis-form').onsubmit = async e => {
          e.preventDefault();
          const pw = qs('#mfa-dis-pw').value;
          const code = qs('#mfa-dis-code').value;
          const btn = qs('#mfa-dis-btn');
          btn.disabled = true;
          btn.textContent = 'Memproses...';

          const res = await disableMfa(pw, code);
          if (res.success) {
            toast('MFA berhasil dinonaktifkan');
            closeModal();
            renderStatus();
          } else {
            btn.disabled = false;
            btn.textContent = 'Konfirmasi Nonaktifkan';
            const errEl = qs('#mfa-dis-err');
            if (errEl) {
              errEl.textContent = res.message || 'Gagal menonaktifkan MFA';
              errEl.style.display = 'block';
            }
          }
        };
      };

      const showRegenModal = () => {
        modalEl.innerHTML = '<div class="mfa-modal-overlay"><div class="mfa-modal">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<h4>Buat Ulang Kode Cadangan Darurat</h4>'
          + '<button type="button" class="btn-close" id="mfa-reg-close" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--mut)">' + ic('x') + '</button>'
          + '</div>'
          + '<p class="tiny" style="margin:8px 0 14px">Masukkan password admin untuk membuat 8 kode cadangan baru (kode cadangan lama akan hangus):</p>'
          + '<form id="mfa-reg-form" class="form" style="grid-template-columns:1fr">'
          + '<div class="f"><label>Password Admin</label><input type="password" id="mfa-reg-pw" required></div>'
          + '<div class="err" id="mfa-reg-err"></div>'
          + '<div style="display:flex;gap:10px;margin-top:14px">'
          + '<button class="btn btn-red" style="flex:1" id="mfa-reg-btn">Buat Kode Baru</button>'
          + '<button type="button" class="btn btn-line" id="mfa-reg-cancel">Batal</button>'
          + '</div></form>'
          + '</div></div>';

        qs('#mfa-reg-close').onclick = closeModal;
        qs('#mfa-reg-cancel').onclick = closeModal;

        qs('#mfa-reg-form').onsubmit = async e => {
          e.preventDefault();
          const pw = qs('#mfa-reg-pw').value;
          const btn = qs('#mfa-reg-btn');
          btn.disabled = true;
          btn.textContent = 'Membuat...';

          const res = await regenerateBackupCodes(pw);
          if (res.success) {
            toast('Kode cadangan baru berhasil dibuat');
            showBackupCodesModal(res.backupCodes || []);
            renderStatus();
          } else {
            btn.disabled = false;
            btn.textContent = 'Buat Kode Baru';
            const errEl = qs('#mfa-reg-err');
            if (errEl) {
              errEl.textContent = res.message || 'Gagal membuat kode cadangan';
              errEl.style.display = 'block';
            }
          }
        };
      };

      renderStatus();
    }
  }

  if (T === 'backup') {
    const dl = qs('#dlj');
    if (dl) {
      dl.onclick = () => {
        try {
          const b = new Blob([qs('#expj').value], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(b);
          a.download = 'jri-content-backup.json';
          document.body.appendChild(a);
          a.click();
          a.remove();
          toast('Download dimulai');
        } catch (e) {
          toast('Download diblokir — gunakan tombol Salin');
        }
      };
    }
    const cp = qs('#cpj');
    if (cp) {
      cp.onclick = () => {
        const t = qs('#expj');
        t.focus();
        t.select();
        let ok = false;
        try {
          ok = document.execCommand('copy');
        } catch (e) {}
        toast(ok ? 'JSON tersalin ke clipboard' : 'Salin manual dengan Ctrl+C');
      };
    }
    const ib = qs('#impb');
    if (ib) {
      ib.onclick = async () => {
        try {
          const d = JSON.parse(qs('#impj').value);
          if (typeof d !== 'object' || !d || Array.isArray(d)) throw new Error('bukan objek');
          await DB.importBackup(d);
          toast('Data berhasil dimuat');
          router(true);
        } catch (e) {
          toast('JSON tidak valid: ' + e.message);
        }
      };
    }
    const rb = qs('#rstb');
    if (rb) {
      rb.onclick = () => {
        if (confirm('Hapus SEMUA perubahan dan kembali ke data default?')) {
          DB.resetAll();
          toast('Kembali ke data default');
          router(true);
        }
      };
    }
  }
}
