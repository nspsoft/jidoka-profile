export const qs = (s, c = document) => c.querySelector(s);
export const qa = (s, c = document) => [...c.querySelectorAll(s)];
export const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const lines = t => String(t || '').split('\n').map(s => s.trim()).filter(Boolean);
export const parsePairs = t => lines(t).map(l => {
  const i = l.indexOf('|');
  return i < 0 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()];
});
export const slug = s => String(s || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const RM = (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
