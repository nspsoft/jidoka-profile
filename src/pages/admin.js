import { DB, dbRead, dbWrite, DEF, dP, dN, dC, dR, dCo } from '../data/db.js';
import { isLogged, doLogin, doLogout, authFetch } from '../data/auth.js';
import { esc, qs, qa, lines, parsePairs, slug } from '../components/dom.js';
import { ic } from '../components/icons.js';
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
  const p = i >= 0 ? P[i] : { id: '', art: 'box', cat: { en: '', id: '' }, name: '', lead: { en: '', id: '' }, material: '', spec: [], mfg: [], apps: [], quality: [] };
  const pairs = a => (a || []).map(r => r[0] + ' | ' + r[1]).join('\n');
  return '<form id="pform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fText('name', 'Nama Produk', p.name, 1)
    + fText('iden', 'Slug URL (huruf kecil, tanpa spasi)', p.id, 1)
    + fSel('art', 'Ilustrasi', ['roll', 'box', 'part', 'sheet', 'cust'], p.art)
    + fBi('cat', 'Kategori', p.cat)
    + fBiTa('lead', 'Deskripsi Singkat', p.lead)
    + fText('material', 'Material', p.material)
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
  const o = {
    id: id,
    art: fd.art,
    name: fd.name.trim() || 'Produk',
    cat: { en: fd.cat_en || fd.cat_id, id: fd.cat_id || fd.cat_en },
    lead: { en: fd.lead_en, id: fd.lead_id },
    material: fd.material,
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
  const r = i >= 0 ? R[i] : { i: 'file', name: { en: '', id: '' }, d: { en: '', id: '' }, meta: '', size: '' };
  return '<form id="rform" class="form" style="margin-top:18px;border-top:2px solid var(--line);padding-top:18px">'
    + '<input type="hidden" name="i" value="' + i + '">'
    + fSel('ric', 'Ikon', ['building', 'file', 'award', 'factory'], r.i)
    + fText('meta', 'Label Format (mis. PDF • EN / ID)', r.meta, 1)
    + fText('size', 'Ukuran (mis. 4.2 MB)', r.size)
    + fBi('name', 'Nama Dokumen', r.name)
    + fBiTa('d', 'Deskripsi', r.d)
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
    size: fd.size
  };
  if (i >= 0) R[i] = o;
  else R.push(o);
  DB.set('resources', R);
}

export function aCompany() {
  const co = dCo();
  return '<h3>Perusahaan & Akses</h3><p class="tiny">Dipakai di footer, halaman Contact, Corporate, dan video background hero beranda. Ganti password admin di bagian bawah.</p>'
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

export function aBackup() {
  return '<h3>Backup / Restore</h3>'
    + '<p class="tiny">Data CMS tersimpan di localStorage browser ini. Untuk memindahkan ke komputer lain atau mengirim ke developer: <b>Download / Salin</b> JSON di bawah, lalu di tempat lain gunakan <b>Muat JSON</b>.</p>'
    + '<textarea id="expj" class="tj" style="margin:14px 0 10px" readonly>' + esc(JSON.stringify(dbRead(), null, 2)) + '</textarea>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:26px"><button class="btn btn-line btn-sm" id="dlj">' + ic('download') + ' Download JSON</button><button class="btn btn-line btn-sm" id="cpj">Salin</button></div>'
    + '<h4 class="redlbl">Import / Muat JSON</h4>'
    + '<textarea id="impj" class="tj" placeholder="Tempel isi JSON backup di sini…" style="margin-bottom:10px"></textarea>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-red btn-sm" id="impb">Muat JSON</button>'
    + '<button class="btn btn-sm" style="color:var(--red);border:1.5px solid var(--red);border-radius:9px;padding:10px 16px;font-weight:700;letter-spacing:.05em" id="rstb">Reset ke Default</button></div>'
    + '<p class="tiny" style="margin-top:14px">Catatan produksi (PRD §11.4): pada versi live, CMS ini akan tersambung ke backend/database dengan autentikasi server-side — struktur data yang sama dapat dipakai langsung.</p>';
}

export function renderAdmin(tab) {
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
    ['products', 'Produk'],
    ['news', 'Berita & Aktivitas'],
    ['caps', 'Kapabilitas'],
    ['resources', 'Resources'],
    ['company', 'Perusahaan & Akses'],
    ['backup', 'Backup / Restore']
  ];
  let body = '';
  try {
    body = tab === 'inbox' ? aInbox() : tab === 'products' ? aProducts() : tab === 'news' ? aNews() : tab === 'caps' ? aCaps() : tab === 'resources' ? aRes() : tab === 'company' ? aCompany() : tab === 'backup' ? aBackup() : aDash();
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

  if (T === 'products') {
    const ped = qs('#ped');
    const open = i => {
      ped.innerHTML = aProdForm(i);
      ped.scrollIntoView({ behavior: 'smooth' });
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

  if (T === 'company') {
    const f = qs('#coform');
    if (f) {
      f.onsubmit = e => {
        e.preventDefault();
        const fd = {};
        qa('input,textarea', f).forEach(el => fd[el.name] = el.value);
        DB.set('company', {
          phone: fd.phone,
          sales: fd.sales,
          corp: fd.corp,
          addr: fd.addr,
          hours: fd.hours,
          video: (fd.video || '').trim()
        });
        if (fd.npw) {
          const d = dbRead(), s = d.settings || {};
          s.password = fd.npw;
          DB.set('settings', s);
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
      ib.onclick = () => {
        try {
          const d = JSON.parse(qs('#impj').value);
          if (typeof d !== 'object' || !d || Array.isArray(d)) throw new Error('bukan objek');
          dbWrite(d);
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
