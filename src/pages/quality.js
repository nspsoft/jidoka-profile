import { dCerts } from '../data/db.js';
import { crumbs } from '../components/crumbs.js';
import { ctaBand } from '../components/ctaBand.js';
import { ic } from '../components/icons.js';
import { L } from '../i18n.js';

export function renderQuality() {
  return '<section class="page-hero">' + crumbs(null, L({ en: 'Quality', id: 'Kualitas' })) + '<div class="wrap"><h1>' + L({ en: 'Quality system', id: 'Sistem kualitas' }) + '</h1><p class="lead">' + L({ en: 'Inspection, certification and improvement — a system, not a slogan.', id: 'Inspeksi, sertifikasi, dan perbaikan — sebuah sistem, bukan slogan.' }) + '</p></div></section>'
    + '<section class="sec"><div class="wrap"><p class="qquote reveal">' + L({ en: 'We do not inspect quality into products. We build quality into the process — and we prove it with data.', id: 'Kami tidak memeriksa kualitas ke dalam produk. Kami membangun kualitas ke dalam proses — dan membuktikannya dengan data.' }) + '</p>'
    + '<div class="stages">'
    + '<div class="stage reveal"><span class="sn">STAGE 01</span><h3>' + L({ en: 'Incoming check', id: 'Inspeksi incoming' }) + '</h3><p>' + L({ en: 'Raw material verified by lot: paper board grade, resin grade, dimension and moisture — before release to production.', id: 'Bahan baku diverifikasi per lot: grade board, grade resin, dimensi, dan moisture — sebelum dilepas ke produksi.' }) + '</p></div>'
    + '<div class="sarr">' + ic('arrow') + '</div>'
    + '<div class="stage reveal"><span class="sn">STAGE 02</span><h3>' + L({ en: 'Process control', id: 'Kontrol proses' }) + '</h3><p>' + L({ en: 'In-process checkpoints per JICOS: dimension, print registration, thickness, flute bonding. Operators stop the line on abnormality (jidoka).', id: 'Checkpoint in-process per JICOS: dimensi, registrasi cetak, thickness, bonding flute. Operator menghentikan line saat abnormal (jidoka).' }) + '</p></div>'
    + '<div class="sarr">' + ic('arrow') + '</div>'
    + '<div class="stage reveal"><span class="sn">STAGE 03</span><h3>' + L({ en: 'Outgoing inspection', id: 'Inspeksi outgoing' }) + '</h3><p>' + L({ en: 'Final inspection against customer spec: ECT/BCT, tensile, fit-check — every lot ships with an inspection record.', id: 'Inspeksi akhir sesuai spesifikasi customer: ECT/BCT, tensile, fit-check — setiap lot dikirim dengan catatan inspeksi.' }) + '</p></div></div>'
    + '<div class="grid2" style="margin-top:52px"><div><h4 class="redlbl">' + L({ en: 'Certification & standards', id: 'Sertifikasi & standar' }) + '</h4>'
    + dCerts().map(c => '<div class="cert">' + ic('award') + '<div><b>' + L(c.name) + '</b><span>' + L(c.d) + '</span></div></div>').join('') + '</div>'
    + '<div><h4 class="redlbl">' + L({ en: 'Continuous improvement — PDCA', id: 'Perbaikan berkelanjutan — PDCA' }) + '</h4>'
    + '<p class="sec-lead" style="margin-bottom:16px">' + L({ en: 'Every customer feedback, defect and near-miss enters the PDCA cycle — owned, dated, closed, and verified on the floor.', id: 'Setiap feedback customer, cacat, dan near-miss masuk ke siklus PDCA — dimiliki, bertanggal, ditutup, dan diverifikasi di lapangan.' }) + '</p>'
    + '<ul class="checks">'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Feedback → root cause analysis within 48h', id: 'Feedback → analisis akar masalah dalam 48 jam' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Countermeasure verified at the actual place (genba)', id: 'Tindakan diverifikasi di tempat nyata (genba)' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Standard updated & shared across shifts', id: 'Standar diperbarui & dibagikan antar shift' }) + '</span></li>'
    + '<li>' + ic('checkc') + '<span>' + L({ en: 'Result reviewed at monthly quality meeting', id: 'Hasil ditinjau di rapat kualitas bulanan' }) + '</span></li></ul></div></div>'
    + '<div style="margin-top:56px"><span class="kicker">' + L({ en: 'Delivery commitment', id: 'Komitmen pengiriman' }) + '</span><div class="del-grid">'
    + '<div class="del reveal">' + ic('clock') + '<b>' + L({ en: 'On-Time Delivery', id: 'Pengiriman Tepat Waktu' }) + '</b><p>' + L({ en: 'Right time, right item, right quantity — tracked daily and reported to customers.', id: 'Tepat waktu, tepat item, tepat quantity — dipantau harian dan dilaporkan ke customer.' }) + '</p></div>'
    + '<div class="del reveal">' + ic('shield') + '<b>' + L({ en: 'Safety & Loading Standard', id: 'Standar Keselamatan & Loading' }) + '</b><p>' + L({ en: 'Driver & vehicle condition, product protection method, and steel racks that make handling and counting easy and error-free.', id: 'Kondisi driver & kendaraan, metode proteksi produk, dan steel rack yang memudahkan handling dan counting tanpa error.' }) + '</p></div>'
    + '<div class="del reveal">' + ic('trend') + '<b>' + L({ en: 'Fast Deviation Response', id: 'Respons Deviasi Cepat' }) + '</b><p>' + L({ en: 'Clear communication and same-day action when anything deviates from plan.', id: 'Komunikasi jelas dan tindakan di hari yang sama saat ada penyimpangan dari rencana.' }) + '</p></div></div></div></div></section>' + ctaBand();
}
