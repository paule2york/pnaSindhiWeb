// Encode/decode a source article URL into a URL-safe token used by /article.
export function encodeUrl(u = '') {
  const b64 = Buffer.from(String(u), 'utf-8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeUrl(token = '') {
  const b64 = String(token).replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64').toString('utf-8');
}

// Short, stable, SAMAA-style numeric id derived from the source URL.
// Pure JS (no Node 'crypto') so it is safe in client components too.
export function shortId(link = '') {
  const s = String(link || '');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h = h >>> 0;
  return String((h % 900000000) + 100000000);
}

// Build a readable slug from a (Sindhi) title (kept for optional use / SEO).
export function slugify(s = '') {
  let out = String(s || '').trim();
  out = out.split(/\s+/).join('-');
  const bad = ['/', '?', '#', '&', '%', '+', '='];
  for (const ch of bad) out = out.split(ch).join('-');
  while (out.indexOf('--') !== -1) out = out.split('--').join('-');
  while (out.startsWith('-')) out = out.slice(1);
  while (out.endsWith('-')) out = out.slice(0, -1);
  if (out.length > 70) {
    out = out.slice(0, 70);
    while (out.endsWith('-')) out = out.slice(0, -1);
  }
  return out || 'khabar';
}

// Build the canonical in-site article path from a feed item.
// SAMAA-style: just a short number, e.g. /article/482913057
export function articlePath(item = {}) {
  if (!item || item.source === 'local' || !item.link) return '/';
  const token = shortId(item.link);
  return `/article/${token}${item.native ? '?n=1' : ''}`;
}
