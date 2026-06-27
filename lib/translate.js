// Free, no-API-key translation to Sindhi (sd).
// Sindhi is low-resource, so every reliable free option is Google-backed.
// We try several Google-backed endpoints in turn; if one is rate-limited or
// blocked, the next one takes over -> almost nothing is left untranslated.

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Split text into <= max-char pieces, breaking on sentence/space boundaries.
function chunkText(text, max = 1200) {
  const out = [];
  let rem = String(text).trim();
  while (rem.length > max) {
    const slice = rem.slice(0, max);
    let idx = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('\u06d4'),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? '),
      slice.lastIndexOf('\n'),
      slice.lastIndexOf(' ')
    );
    if (idx < max * 0.5) idx = max;
    out.push(rem.slice(0, idx));
    rem = rem.slice(idx);
  }
  if (rem.trim()) out.push(rem);
  return out;
}

// Provider 1: classic gtx endpoint.
async function viaGoogleGtx(text, from) {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' +
    from + '&tl=sd&dt=t&q=' + encodeURIComponent(text);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const data = await res.json();
  const out = (data[0] || []).map((c) => (c && c[0]) || '').join('');
  return out || null;
}

// Provider 2: chrome-extension dictionary endpoint (different host + limits).
async function viaGoogleClients5(text, from) {
  const url =
    'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=' +
    from + '&tl=sd&q=' + encodeURIComponent(text);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const data = await res.json();
  if (Array.isArray(data)) {
    const parts = data.map((d) => (Array.isArray(d) ? d[0] : typeof d === 'string' ? d : '')).filter(Boolean);
    const out = parts.join('');
    return out || null;
  }
  if (data && Array.isArray(data.sentences)) {
    return data.sentences.map((s) => s.trans || '').join('') || null;
  }
  return null;
}

// Provider 3: Lingva (open-source Google Translate proxy), multiple instances.
const LINGVA = [
  'https://lingva.ml',
  'https://translate.plausibility.cloud',
  'https://lingva.garudalinux.org',
];
async function viaLingva(text, from) {
  const src = from || 'auto';
  for (const base of LINGVA) {
    try {
      const url = base + '/api/v1/' + src + '/sd/' + encodeURIComponent(text);
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.translation) return data.translation;
    } catch (e) {}
  }
  return null;
}

const PROVIDERS = [viaGoogleGtx, viaGoogleClients5, viaLingva];

async function translateChunk(text, from) {
  for (let round = 0; round < 2; round++) {
    for (const provider of PROVIDERS) {
      try {
        const out = await provider(text, from);
        if (out && out.trim()) return out;
      } catch (e) {}
    }
    await sleep(500 * (round + 1));
  }
  return null;
}

export async function toSindhi(text, from = 'auto') {
  if (!text) return '';
  const chunks = chunkText(text);
  const out = [];
  for (const ch of chunks) {
    const t = await translateChunk(ch, from);
    out.push(t == null ? ch : t);
  }
  return out.join('');
}

// Translate many strings with limited concurrency (avoids rate limiting).
export async function toSindhiMany(texts, from = 'auto') {
  const list = texts || [];
  const results = new Array(list.length);
  let idx = 0;
  const concurrency = Math.min(4, list.length || 1);
  async function worker() {
    while (idx < list.length) {
      const cur = idx++;
      results[cur] = await toSindhi(list[cur], from);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}
