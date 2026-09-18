import { qs, qa } from '../components/dom.js';
import { setLang } from '../i18n.js';
import { renderHeader } from './header.js';
import { renderMobileMenu, closeMM } from './mobilemenu.js';
import { renderFooter } from './footer.js';

let rerouteHandler = null;
let syncHdrHandler = null;

export function initChrome(onReroute, onSyncHdr) {
  rerouteHandler = onReroute;
  syncHdrHandler = onSyncHdr;
  const backdrop = qs('.backdrop');
  if (backdrop) backdrop.onclick = closeMM;
}

export function buildChrome() {
  const raw = ((location.hash || '').replace(/^#\/?/, '').split('/')[0]) || 'home';
  const cur = raw === 'product' ? 'products' : raw;

  const hdr = qs('#hdr');
  if (hdr) hdr.innerHTML = renderHeader(cur);

  const mm = qs('#mm');
  if (mm) mm.innerHTML = renderMobileMenu();

  const ftr = qs('#ftr');
  if (ftr) ftr.innerHTML = renderFooter();

  qa('#hdr .burger').forEach(b => {
    b.onclick = () => {
      const m = qs('#mm');
      const bd = qs('.backdrop');
      if (m) m.classList.add('open');
      if (bd) bd.classList.add('show');
    };
  });

  const mmclose = qs('#mmclose');
  if (mmclose) mmclose.onclick = closeMM;

  qa('#mm a').forEach(a => a.addEventListener('click', closeMM));

  qa('.lang button').forEach(b => {
    b.onclick = () => {
      setLang(b.dataset.l);
      buildChrome();
      if (rerouteHandler) rerouteHandler(true);
    };
  });

  if (syncHdrHandler) syncHdrHandler();
}
