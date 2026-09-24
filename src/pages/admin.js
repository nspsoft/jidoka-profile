import { DB, dbRead, dbWrite, DEF, dP, dN, dC, dR, dCo, dPillars, dWhy, dIndustries, dTour, dMach, dFlow, dCerts, dWay, dHist, dGov } from '../data/db.js';
import { isLogged, doLogin, doLogout, authFetch } from '../data/auth.js';
import { esc, qs, qa, lines, parsePairs, slug } from '../components/dom.js';
import { logo, ic } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { fText, fTa, fBi, fBiTa, fSel } from '../components/forms.js';
import { L } from '../i18n.js';

export { isLogged, doLogin, doLogout };

let cachedLeads = [];

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
  return '<h3>Dashboard</h3><div class="stat-mini" style="margin-top:16px">'
    + '<div><b>' + cnt('products') + '</b><span class="mini" style="display:block;margin-top:4px">Produk</span></div>'
    + '<div><b>' + cnt('news') + '</b><span class="mini" style="display:block;margin-top:4px">Berita</span></div>'
    + '<div><b>' + cnt('resources') + '</b><span class="mini" style="display:block;margin-top:4px">Resources</span></div>'
    + '<div><b>' + cachedLeads.length + (newLeads ? ' <small style="color:var(--red);font-size:14px">(' + newLeads + ' baru)</small>' : '') + '</b><span class="mini" style="display:block;margin-top:4px">Inbox Leads</span></div></div>'
    + '<p class="tiny" style="margin-top:18px">Pilih menu di sebelah kiri untuk mengelola konten dan pesan masuk. Data tersimpan di database server (PRD §5, §6 M2).</p>';
}

export function aInbox() {
  if (!cachedLeads.length) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3>Inbox Leads (0)</h3><button class="btn btn-line btn-sm" id="refinbox">↻ Refresh</button></div>'
      + '<p class="tiny">Daftar pesan & RFQ masuk dari formulir kontak website (PRD §5, §6 M2).</p>'
      + '<p class="empty" style="padding:40px 0;text-align:center">Belum ada pesan atau RFQ masuk.</p>';
  }

  const unhandled = cachedLeads.filter(l => l.status === 'new').length;
  return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3>Inbox Leads (' + cachedLeads.length + (unhandled ? ' · <span style="color:var(--red)">' + unhandled + ' Baru</span>' : '') + ')</h3><button class="btn btn-line btn-sm" id="refinbox">↻ Refresh</button></div>'
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
    + '<p class="tiny">Ditampilkan di beranda (bagian News) — indikator perusahaan aktif (PRD §8).</p>'
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
  return '<h3>Data Kapabilitas</h3><p class="tiny">Ditampilkan di beranda — bagian “Our capabilities” (PRD §10: data numerik kapabilitas).</p>'
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
  return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3>Resources (' + dR().length + ')</h3><button class="btn btn-red btn-sm" id="addr">' + ic('plus') + ' Tambah Dokumen</button></div>'
    + '<p class="tiny">Ditampilkan di halaman Resources — pusat dokumen download (PRD §7.9).</p>'
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
    + '<p class="tiny">Kelola logo visual perusahaan, teks brand header/footer, slogan, tagline, dan profil resmi bisnis (PRD §5, §6 M2).</p>'
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

export function aCompany() {
  const co = dCo();
  return '<h3>Kontak & Akses</h3><p class="tiny">Kelola kontak kantor/pabrik, email sales/investor, jam kerja, video hero beranda, dan password login admin.</p>'
    + '<form id="coform" class="form" style="margin-top:14px">'
    + fText('phone', 'Telepon / WhatsApp', co.phone, 1)
    + fText('hours', 'Jam Operasional', co.hours, 1)
    + fText('sales', 'Email Sales (RFQ & inquiry umum)', co.sales, 1)
    + fText('corp', 'Email Corporate Development (investor)', co.corp, 1)
    + '<div class="f f-full"><label>URL Video Hero Beranda (mp4)</label><input name="video" value="' + esc(co.video || '') + '" placeholder="factory.mp4 atau https://…/video.mp4 — pisahkan beberapa URL dengan koma">'
    + '<span class="mini" style="display:block;margin-top:6px;line-height:1.6">Letakkan file video bernama <b>factory.mp4</b> di folder yang sama dengan index.html, atau tempel URL video online (.mp4). Jika video gagal dimuat, otomatis tampil background animasi blueprint.</span></div>'
    + fTa('addr', 'Alamat Pabrik & Kantor', co.addr)
    + '<div class="f"><label>Password Baru (opsional)</label><input name="npw" type="password" placeholder="Kosongkan jika tidak diganti"></div>'
    + '<div class="f" style="display:flex;align-items:flex-end"><button class="btn btn-red">Simpan</button></div></form>';
}

/* ============================================================
   KONTEN BERANDA: 4 Pilar, 4 Alasan, Sektor Industri
   ============================================================ */
export function aHomeContent(sub) {
  sub = sub || 'pillars';
  const subnav = '<div class="adm-subnav">'
    + '<button class="' + (sub === 'pillars' ? 'on' : '') + '" data-sub="pillars">4 Pilar Layanan (What We Do)</button>'
    + '<button class="' + (sub === 'why' ? 'on' : '') + '" data-sub="why">4 Alasan Memilih JRI (Why Us)</button>'
    + '<button class="' + (sub === 'industries' ? 'on' : '') + '" data-sub="industries">Sektor Industri Pelanggan</button>'
    + '</div>';

  if (sub === 'pillars') {
    const P = dPillars() || [];
    return '<h3>Konten Beranda — 4 Pilar Layanan</h3>'
      + '<p class="tiny">Ditampilkan di bagian "What we do" pada Beranda (PRD §7.1). Setiap pilar memiliki nomor urut, ikon, judul, dan deskripsi bilingual.</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addpillar">' + ic('plus') + ' Tambah Pilar</button></div>'
      + P.map((p, i) => '<div class="adm-row"><div><b>' + esc(p.n) + '. ' + esc(L(p.t)) + '</b> <span class="mini">(' + esc(p.i) + ') — ' + esc(L(p.d)).slice(0, 80) + '…</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-pillar="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-pillar="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="pillared"></div>';
  }

  if (sub === 'why') {
    const W = dWhy() || [];
    return '<h3>Konten Beranda — 4 Alasan Memilih JRI</h3>'
      + '<p class="tiny">Ditampilkan di bagian "Why us" pada Beranda (PRD §7.1). Menampilkan poin keunggulan utama perusahaan.</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addwhy">' + ic('plus') + ' Tambah Alasan</button></div>'
      + W.map((w, i) => '<div class="adm-row"><div><b>' + esc(L(w.t)) + '</b> <span class="mini">(' + esc(w.i) + ') — ' + esc(L(w.d)).slice(0, 80) + '…</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-why="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-why="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="whyed"></div>';
  }

  if (sub === 'industries') {
    const IND = dIndustries() || [];
    return '<h3>Konten Beranda & Aplikasi — Sektor Industri</h3>'
      + '<p class="tiny">Ditampilkan di Beranda dan Halaman Application (PRD §7.3). Mengelompokkan solusi kemasan per sektor bisnis.</p>'
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
      + '<p class="tiny">Ditampilkan di Beranda & Halaman Manufacturing (PRD §7.4). Menggambarkan 5 tahapan tur fasilitas pabrik dengan video interaktif & diagram cetak biru.</p>'
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
      + '<p class="tiny">Ditampilkan di Halaman Quality (PRD §7.5). Daftar sertifikasi ISO, standar internal, dan persetujuan customer.</p>'
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
    return '<h3>Our Way & Korporat — 7 Prinsip DNA Jepang</h3>'
      + '<p class="tiny">Ditampilkan di Halaman Our Way & Beranda (PRD §7.6). Fondasi filosofi manufaktur Jepang (Kaizen, 5S, Jidoka, dll).</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addwayp">' + ic('plus') + ' Tambah Prinsip</button></div>'
      + W.map((w, i) => '<div class="adm-row"><div><b>' + esc(w.n) + '</b> ' + (w.kj ? '<span class="mini">[' + esc(w.kj) + ']</span> ' : '') + '<span class="mini">— ' + esc(L(w.s)) + '</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-wayp="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-wayp="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="wayped"></div>';
  }

  if (sub === 'hist') {
    const H = dHist() || [];
    return '<h3>Our Way & Korporat — Linimasa Sejarah Perusahaan</h3>'
      + '<p class="tiny">Ditampilkan di Halaman Corporate (PRD §7.7). Tonggak sejarah pendirian dan ekspansi PT JRI.</p>'
      + subnav
      + '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="btn btn-red btn-sm" id="addhist">' + ic('plus') + ' Tambah Tahun</button></div>'
      + H.map((h, i) => '<div class="adm-row"><div><b>Tahun ' + esc(h.yr) + '</b> <span class="mini">— ' + esc(L(h.t)).slice(0, 80) + '…</span></div><div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" data-pe-hist="' + i + '">' + ic('edit') + ' Edit</button><button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:8px 12px" data-pd-hist="' + i + '">' + ic('trash') + '</button></div></div>').join('')
      + '<div id="histed"></div>';
  }

  if (sub === 'gov') {
    const G = dGov() || [];
    return '<h3>Our Way & Korporat — Tata Kelola Perusahaan (Governance)</h3>'
      + '<p class="tiny">Ditampilkan di Halaman Corporate (PRD §7.7). Poin komitmen tata kelola dan kepatuhan regulasi.</p>'
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
  return '<h3>Backup / Restore</h3>'
    + '<p class="tiny">Data CMS tersimpan di database server. Format data 100% kompatibel dengan cadangan lama REV-6 (PRD §5). Gunakan <b>Muat JSON</b> untuk restore cadangan lama atau eksternal.</p>'
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
    return '<section class="sec" style="padding-top:48px"><div class="wrap" style="max-width:430px"><div class="panel-card">'
      + '<h3 style="font-family:\'Barlow Condensed\';font-size:26px;text-transform:uppercase;color:var(--navy)">Login Admin CMS</h3>'
      + '<p class="tiny" style="margin:6px 0 16px">Autentikasi akun admin server (PRD §5, §6 M2).<br>Default: <b>admin@jidoka.co.id</b> / <b>jidoka2026</b></p>'
      + '<form id="lform" class="form" style="grid-template-columns:1fr">'
      + '<div class="f"><label>Email</label><input name="email" type="email" value="admin@jidoka.co.id" required></div>'
      + '<div class="f"><label>Password</label><input name="pw" type="password" required><div class="err" id="lerr">Email atau password salah</div></div>'
      + '<button class="btn btn-red" style="width:100%">Masuk</button></form></div></div></section>';
  }
  tab = tab || 'dash';
  const unhandled = cachedLeads.filter(l => l.status === 'new').length;
  const tabs = [
    ['dash', 'Dashboard'],
    ['inbox', 'Inbox' + (unhandled ? ' (' + unhandled + ')' : '')],
    ['profile', 'Profil & Logo'],
    ['home-content', 'Konten Beranda'],
    ['products', 'Produk'],
    ['factory-quality', 'Pabrik & Mutu'],
    ['way-corporate', 'Our Way & Korporat'],
    ['news', 'Berita & Aktivitas'],
    ['caps', 'Kapabilitas'],
    ['resources', 'Resources'],
    ['company', 'Kontak & Akses'],
    ['backup', 'Backup / Restore']
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

export function mountAdmin(seg, router, goHash) {
  if (!isLogged()) {
    const lf = qs('#lform');
    if (lf) {
      lf.onsubmit = async e => {
        e.preventDefault();
        const email = (lf.email && lf.email.value) || '';
        const pw = (lf.pw && lf.pw.value) || '';
        const res = await doLogin(email, pw);
        if (res.ok) {
          toast('Selamat datang');
          await fetchLeads();
          router(true);
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
    return;
  }

  // Preload leads in background for badge count if not loaded yet
  if (!cachedLeads.length) {
    fetchLeads().then(() => {
      const unh = cachedLeads.filter(l => l.status === 'new').length;
      const ibBtn = qs('.adm-nav [data-at="inbox"]');
      if (ibBtn && unh) ibBtn.textContent = 'Inbox (' + unh + ')';
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
        toast('Inbox diperbarui');
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
    const sub = seg[2] || 'pillars';

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

  if (T === 'company') {
    const f = qs('#coform');
    if (f) {
      f.onsubmit = async e => {
        e.preventDefault();
        const fd = {};
        qa('input,textarea', f).forEach(el => fd[el.name] = el.value);
        const curCo = dCo() || {};
        DB.set('company', {
          ...curCo,
          phone: fd.phone,
          sales: fd.sales,
          corp: fd.corp,
          addr: fd.addr,
          hours: fd.hours,
          video: (fd.video || '').trim()
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
