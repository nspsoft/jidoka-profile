# DECISIONS.md — Log Keputusan Teknis & Arsitektur

- 2026-09-18: Setup build tool Vite (vanilla JS) sebagai dev server & bundler tanpa mengubah kode baseline index.html.
- 2026-09-18: Pecah CSS dari index.html ke src/styles/ (tokens.css, base.css, hero.css, pages.css, admin.css, header.css, di-bundle via main.css). Urutan cascading dan spesifisitas mobile header patch dipertahankan.
- 2026-09-18: Ekstrak data default (16 modul di src/data/defaults/) dan abstraksi lapisan data via src/data/db.js. Bentuk kontrak data PRD §5 dipertahankan 100%.
- 2026-09-18: Modularisasi JavaScript ES modules selesai sesuai PRD §4.2: i18n.js, router.js, layout/ (header, footer, mobilemenu, chrome), pages/ (12 modul halaman termasuk admin), components/ (store, dom, icons, crumbs, toast, blueprint, productArt, productCard, ctaBand, forms, okCard). index.html menjadi shell statis dengan entry src/main.js. Parity 100%, 0 dependensi runtime baru.
