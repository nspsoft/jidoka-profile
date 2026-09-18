import './styles/main.css';
import { qs, esc } from './components/dom.js';
import { initRouter, syncHdr } from './router.js';

window.addEventListener('error', function (e) {
  const app = qs('#app');
  if (app && !app.innerHTML.trim()) {
    app.innerHTML = '<div class="wrap" style="padding:60px 24px;font-family:sans-serif"><h2 style="color:#b0141a">Script error</h2><p style="color:#5a6478">' + esc(e.message || 'unknown') + '</p></div>';
  }
});

window.addEventListener('scroll', () => {
  const totop = qs('#totop');
  if (totop) totop.classList.toggle('show', window.scrollY > 500);
  syncHdr();
}, { passive: true });

const totop = qs('#totop');
if (totop) {
  totop.onclick = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  };
}

initRouter();
