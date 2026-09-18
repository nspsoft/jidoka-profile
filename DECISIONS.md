# DECISIONS.md — Log Keputusan Teknis & Arsitektur

- 2026-09-18: Setup build tool Vite (vanilla JS) sebagai dev server & bundler tanpa mengubah kode baseline index.html.
- 2026-09-18: Pecah CSS dari index.html ke src/styles/ (tokens.css, base.css, hero.css, pages.css, admin.css, header.css, di-bundle via main.css). Urutan cascading dan spesifisitas mobile header patch dipertahankan.
