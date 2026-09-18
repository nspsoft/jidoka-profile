# DECISIONS.md — Log Keputusan Teknis & Arsitektur

- 2026-09-18: Setup build tool Vite (vanilla JS) sebagai dev server & bundler tanpa mengubah kode baseline index.html.
- 2026-09-18: Pecah CSS dari index.html ke src/styles/ (tokens.css, base.css, hero.css, pages.css, admin.css, header.css, di-bundle via main.css). Urutan cascading dan spesifisitas mobile header patch dipertahankan.
- 2026-09-18: Ekstrak data default (16 modul di src/data/defaults/) dan abstraksi lapisan data via src/data/db.js. Bentuk kontrak data PRD §5 dipertahankan 100%.
