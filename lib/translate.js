// Free, no-API-key translation to Sindhi (sd), with a permanent Supabase cache.
// Sindhi is low-resource, so every reliable free option is Google-backed.
// We try several Google-backed endpoints in turn; if one is rate-limited or
// blocked, the next one takes over. Every successful translation is stored in
// Supabase, so each unique phrase is translated only ONCE (ever) -> tiny quota
// usage and far fewer requests to the free endpoints.

import { createHash } from 'crypto';
import { supabaseAdmin } from './supabase';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function hashKey(text, from) {
  return createHash('sha1').update(from + '|sd|' + String(text)).digest('hex');
}

// ---- Supabase cache helpers (no-op if env / table is missing) ----
async function cacheGet(keys) {
  const db = supabaseAdmin();
  if (!db || !keys.length) return {};
  try {
    const { data } = await db.from('translations').select('hash,translated').in('hash', keys);
    const map = {};
    (data || []).forEach((r) => { map[r.hash] = r.translated; });
    return map;
  } catch (e) {
    return {};
  }
}

async function cachePut(rows) {
  const db = supabaseAdmin();
  if (!db || !rows.length) return;
  try {
    await db.from('translations').upsert(rows, { onConflict: 'hash' });
  } catch (e) {}
}

// ---- Chunking ----
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

// ---- Providers (all Google-backed; first non-empty wins) ----
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

async function viaGoogleClients5(text, from) {
  const url =
    'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=' +
    from + '&tl=sd&q=' + encodeURIComponent(text);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const data = await res.json();
  if (Array.isArray(data)) {
    const parts = data.map((d) => (Array.isArray(d) ? d[0] : typeof d === 'string' ? d : '')).filter(Boolean);
    return parts.join('') || null;
  }
  if (data && Array.isArray(data.sentences)) {
    return data.sentences.map((s) => s.trans || '').join('') || null;
  }
  return null;
}

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

// Translate without touching the cache.
async function translateRaw(text, from) {
  const chunks = chunkText(text);
  const out = [];
  for (const ch of chunks) {
    const t = await translateChunk(ch, from);
    out.push(t == null ? ch : t);
  }
  return out.join('');
}

// ---- Public API ----
export async function toSindhi(text, from = 'auto') {
  if (!text) return '';
  const key = hashKey(text, from);
  const hit = await cacheGet([key]);
  if (hit[key] != null) return hit[key];
  const out = await translateRaw(text, from);
  if (out && out !== text) {
    await cachePut([{ hash: key, source: String(text).slice(0, 1000), lang: 'sd', translated: out }]);
  }
  return out;
}

// Translate many strings: one cache read, limited-concurrency misses, one write.
export async function toSindhiMany(texts, from = 'auto') {
  const list = texts || [];
  const keys = list.map((t) => (t ? hashKey(t, from) : null));
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
  const cached = await cacheGet(uniqueKeys);

  const results = new Array(list.length);
  const missIndices = [];
  list.forEach((t, i) => {
    if (!t) { results[i] = ''; return; }
    if (cached[keys[i]] != null) results[i] = cached[keys[i]];
    else missIndices.push(i);
  });

  const toWrite = [];
  const written = new Set();
  let mi = 0;
  const concurrency = Math.min(4, missIndices.length || 1);
  async function worker() {
    while (mi < missIndices.length) {
      const i = missIndices[mi++];
      const t = list[i];
      const out = await translateRaw(t, from);
      results[i] = out;
      if (out && out !== t && !written.has(keys[i])) {
        written.add(keys[i]);
        toWrite.push({ hash: keys[i], source: String(t).slice(0, 1000), lang: 'sd', translated: out });
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  await cachePut(toWrite);
  return results;
}
