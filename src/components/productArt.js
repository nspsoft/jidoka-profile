import { esc } from './dom.js';

export function art(k, label) {
  const head = '<svg viewBox="0 0 300 190" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="190" fill="#eef2f8"/><g stroke="#16336e" stroke-width="2" fill="#fff">';
  const foot = '</g><text x="150" y="176" text-anchor="middle" font-family="Barlow Condensed" font-size="12" letter-spacing="2" fill="#5a6478">' + esc(label || '') + '</text></svg>';
  if (k === 'roll') return head + '<g class="fl1"><circle cx="105" cy="88" r="44" fill="#fff"/><circle cx="105" cy="88" r="15" fill="#d71920" stroke="none"/><path d="M105 44h95a44 44 0 0 1 0 88h-95" fill="#fff"/></g><path d="M60 150h185" stroke="#b3925a" stroke-width="3" stroke-dasharray="6 6" fill="none"/>' + foot;
  if (k === 'box') return head + '<g class="fl1"><path d="M95 70l55-25 55 25v55l-55 25-55-25z"/><path d="M95 70l55 25 55-25M150 95v55"/></g><g class="fl2"><path d="M58 92l30-14 30 14v30l-30 14-30-14z" fill="#fff"/></g>' + foot;
  if (k === 'part') return head + '<g class="fl1"><rect x="80" y="45" width="140" height="100" rx="6"/><path d="M150 45v100M80 95h140M115 45v100M185 45v100" stroke="#b3925a"/></g>' + foot;
  if (k === 'sheet') return head + '<g class="fl1"><rect x="70" y="100" width="160" height="14" rx="4"/><rect x="82" y="80" width="160" height="14" rx="4" fill="#f5f7fa"/><rect x="70" y="60" width="160" height="14" rx="4" fill="#f5f7fa"/></g><path d="M70 140h160" stroke="#d71920" stroke-width="3" fill="none"/>' + foot;
  return head + '<g class="fl1"><path d="M90 60h70l50 40v50H90z"/><path d="M160 60v40h50" stroke="#b3925a"/><circle cx="120" cy="120" r="10" fill="#d71920" stroke="none"/></g>' + foot;
}
