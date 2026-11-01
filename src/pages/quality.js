import { dCerts } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { L } from '../i18n.js';

export function renderQuality() {
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Quality', id: 'Standar Mutu' })) + '<div class="wrap"><h1>' + L({ en: 'Quality System', id: 'Sistem Manajemen Mutu' }) + '</h1><p class="lead">' + L({ en: 'Inspection, certification and improvement — a system, not a slogan.', id: 'Pengendalian mutu, kepatuhan sertifikasi, dan continuous improvement yang terintegrasi secara sistematis.' }) + '</p></div></section>'
    + '<section class="sec"><div class="wrap"><p class="qquote reveal">' + L({ en: 'We do not inspect quality into products. We build quality into the process — and we prove it with data.', id: 'Kualitas bukan sekadar diperiksa di akhir, melainkan dibangun langsung ke dalam setiap tahapan proses produksi berbasis data terukur.' }) + '</p>'
    + '<div class="stages">'
    + '<div class="stage reveal"><span class="sn">STAGE 01</span><h3>' + L({ en: 'Incoming Check', id: 'Pemeriksaan Bahan Baku (Incoming)' }) + '</h3><p>' + L({ en: 'Raw material verified by lot: paper board grade, resin grade, dimension and moisture — before release to production.', id: 'Bahan baku diverifikasi ketat per lot: grade lembaran, grade resin, dimensi, dan kadar air — sebelum dialirkan ke lantai produksi.' }) + '</p></div>'
    + '<div class="sarr">' + ic('arrow') + '</div>'
    + '<div class="stage reveal"><span class="sn">STAGE 02</span><h3>' + L({ en: 'Process Control', id: 'Pengendalian Proses (In-Process)' }) + '</h3><p>' + L({ en: 'In-process checkpoints per JICOS: dimension, print registration, thickness, flute bonding. Operators stop the line on abnormality (jidoka).', id: 'Pemeriksaan berkala berbasis JICOS: dimensi part, registrasi cetak, ketebalan, dan daya rekat flute. Operator berwenang menghentikan lini saat terjadi ketidaksesuaian (jidoka).' }) + '</p></div>'
    + '<div class="sarr">' + ic('arrow') + '</div>'
    + '<div class="stage reveal"><span class="sn">STAGE 03</span><h3>' + L({ en: 'Outgoing Inspection', id: 'Inspeksi Akhir Produk (Outgoing)' }) + '</h3><p>' + L({ en: 'Final inspection against customer spec: ECT/BCT, tensile, fit-check — every lot ships with an inspection record.', id: 'Inspeksi akhir sesuai standar spesifikasi pelanggan: uji ECT/BCT, tensile strength, dan fit-check partisi — setiap lot pengiriman disertai sertifikat inspeksi.' }) + '</p></div></div>'
    + '<div class="grid2" style="margin-top:52px"><div><h4 class="redlbl">' + L({ en: 'Certification & Standards', id: 'Sertifikasi & Standar Industri' }) + '</h4>'
    + dCerts().map(c => '<div class="cert">' + ic('award') + '<div><b>' + L(c.name) + '</b><span>' + L(c.d) + '</span></div></div>').join('') + '</div>'
    + '<div><h4 class="redlbl">' + L({ en: 'Continuous Improvement — PDCA', id: 'Siklus Perbaikan Berkelanjutan (PDCA)' }) + '</h4>'
    + '<p class="sec-lead" style="margin-bottom:16px">' + L({ en: 'Every customer feedback, defect and near-miss enters the PDCA cycle — owned, dated, closed, and verified on the floor.', id: 'Setiap masukan mitra, temuan deviasi, dan potensi risiko dikelola dalam siklus PDCA — tercatat, bertenggat waktu jelas, dituntaskan, dan diverifikasi langsung di lapangan.' }) + '</p>'
    + '<ul class="checks">'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Feedback → root cause analysis within 48h', id: 'Masukan pelanggan → analisis akar masalah (root cause) maksimal 48 jam' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Countermeasure verified at the actual place (genba)', id: 'Tindakan pencegahan diverifikasi langsung di area kerja nyata (genba)' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Standard updated & shared across shifts', id: 'Standar kerja diperbarui dan disosialisasikan lintas shift' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Result reviewed at monthly quality meeting', id: 'Hasil evaluasi ditinjau rutin dalam rapat jaminan mutu bulanan' }) + '</span></li></ul></div></div>'
    + '<div style="margin-top:56px"><span class="kicker">' + L({ en: 'Delivery commitment', id: 'Komitmen Pengiriman' }) + '</span><div class="del-grid">'
    + '<div class="del reveal">' + ic('clock') + '<b>' + L({ en: 'On-Time Delivery', id: 'Ketepatan Waktu Pengiriman' }) + '</b><p>' + L({ en: 'Right time, right item, right quantity — tracked daily and reported to customers.', id: 'Tepat waktu, tepat item, dan tepat jumlah — dipantau setiap hari dan dilaporkan secara transparan kepada pelanggan.' }) + '</p></div>'
    + '<div class="del reveal">' + ic('shield') + '<b>' + L({ en: 'Safety & Loading Standard', id: 'Standar Keselamatan & Muat Barang' }) + '</b><p>' + L({ en: 'Driver & vehicle condition, product protection method, and steel racks that make handling and counting easy and error-free.', id: 'Kelaikan armada & pengemudi, metode proteksi muatan, serta sistem rak baja yang memastikan bongkar-muat aman dan akurat.' }) + '</p></div>'
    + '<div class="del reveal">' + ic('trend') + '<b>' + L({ en: 'Fast Deviation Response', id: 'Respons Deviasi Cepat' }) + '</b><p>' + L({ en: 'Clear communication and same-day action when anything deviates from plan.', id: 'Komunikasi responsif dan tindakan penanganan pada hari yang sama jika terjadi deviasi jadwal atau rute.' }) + '</p></div></div></div></div></section>' + ctaBand();
}
