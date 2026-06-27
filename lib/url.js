// Encode/decode a source article URL into a URL-safe token used by /article.
export function encodeUrl(u = '') {
  const b64 = Buffer.from(String(u), 'utf-8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeUrl(token = '') {
  const b64 = String(token).replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64').toString('utf-8');
}
