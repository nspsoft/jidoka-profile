# PT Jidoka Result Indonesia — Corporate & Digital Sales Platform Website

PT Jidoka Result Indonesia ("Jidoka"/"JRI") adalah produsen solusi packaging industri — karton box, imprabox, partition, custom packaging, serta PE sheet & film — untuk industri manufaktur domestik & ekspor, dengan sistem kendali internal bernama JICOS dan motto "PACKAGE YOUR QUALITY." Website ini diposisikan sebagai Digital Salesman + Corporate Window + 24/7 Business Development Platform bagi customer, engineer, purchasing, Japanese management/holding, investor, dan mitra strategis.

## Cara Menjalankan Lokal

Pada fase baseline (M0 / REV-6), aplikasi berupa Single Page Application (SPA) mandiri tanpa build step maupun dependensi eksternal:

1. Buka file `index.html` secara langsung di web browser pilihan Anda (Chrome, Firefox, Edge, Safari), atau
2. Jalankan melalui local web server (misalnya melalui Laragon di `http://localhost/jri-website/`, extension Live Server VS Code, atau HTTP static server lainnya).

## Struktur File Saat Ini

```
jri-website/
├── .gitignore          # Konfigurasi file yang diabaikan git
├── AGENTS.md           # Aturan kerja agen AI untuk pengembangan proyek
├── DECISIONS.md        # Log keputusan teknis & arsitektur
├── PRD.md              # Product Requirements Document (v2.0)
├── README.md           # Dokumentasi awal proyek
└── index.html          # Implementasi baseline SPA mandiri (REV-6)
```
