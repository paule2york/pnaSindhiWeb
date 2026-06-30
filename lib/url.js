// Encode/decode a source article URL into a URL-safe token used by /article.
export function encodeUrl(u = '') {
  const b64 = Buffer.from(String(u), 'utf-8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeUrl(token = '') {
  const b64 = String(token).replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64').toString('utf-8');
}

// Build a readable, SEO-friendly slug from a (Sindhi) title for permalinks.
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
export function articlePath(item = {}) {
  if (!item || item.source === 'local' || !item.link) return '/';
  const token = item.id || encodeUrl(item.link);
  const slug = slugify(item.title || 'khabar');
  return `/article/${slug}/${token}${item.native ? '?n=1' : ''}`;
}
