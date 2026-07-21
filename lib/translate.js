// Translation to Sindhi (sd), with a permanent Supabase cache.
// Provider order: Gemini (LLM, best Sindhi quality) first when configured, then
// Azure (Microsoft Translator), then several free Google-backed endpoints as a
// last-resort fallback. Every successful result is cached in Supabase, so each
// unique phrase is translated only ONCE (ever).
//
// Optional env vars (set in Vercel):
//   GEMINI_API_KEY            - Google AI Studio key (enables high-quality LLM translation)
//   GEMINI_MODEL              - optional, defaults to "gemini-2.0-flash"
//   AZURE_TRANSLATOR_KEY      - Microsoft Translator resource key
//   AZURE_TRANSLATOR_REGION   - resource region, e.g. "eastus"
//   AZURE_TRANSLATOR_ENDPOINT - optional, defaults to the global endpoint

import { createHash } from 'crypto';
import { supabaseAdmin } from './supabase';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Bump this whenever translation instructions change, so stale translations
// are ignored without requiring a destructive database-wide cache deletion.
const TRANSLATION_CACHE_VERSION = 'v4-headline-strict-post';

function hashKey(text, from) {
  return createHash('sha1').update(TRANSLATION_CACHE_VERSION + '|' + from + '|sd|' + String(text)).digest('hex');
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
      slice.lastIndexOf('۔'),
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

// ---- Provider 0: Gemini (LLM) — best Sindhi quality, primary if configured ----
async function viaGemini(text, from) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key;
  const prompt =
    'You are a professional Sindhi newspaper translator. Translate to natural, journalistic Sindhi (سنڌي) as written in Sindhi newspapers like Kawish and Ibrat. Rules:\n' +
    '1. Keep proper nouns, names and numbers intact.\n' +
    '2. Verbs MUST agree with the subject gender — men/masculine nouns: ڪيو، ويو، چيو، پهتو; women/feminine nouns: ڪئي، وئي، چئي، پهتي.\n' +
    '3. CRITICAL HEADLINE RULE: A Sindhi news headline for a past/completed event MUST end with a past perfective verb. NEVER end with present tense ٿو or ٿي — that is always wrong in Sindhi newspaper headlines. Examples: 'expansion accelerates' → توسيع تيز ٿي وئي (NOT تيز ڪري ٿو or تيز ٿي); 'theft increases by 300%' → چوري ۾ 300 سيڪڙو واڌ ٿي وئي (NOT واڌ ٿي); 'study warns' → تحقيق خبردار ڪري ڇڏيو (NOT تحقيق خبردار ڪري ٿي); 'sets record' → رڪارڊ قائم ڪري ڇڏيو (NOT قائم ڪري ٿو). These are firm rules, not suggestions.\n' +
    'Output ONLY the Sindhi translation, nothing else.\n\nText:\n' + String(text);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const out =
      data && data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    return out ? String(out).trim() : null;
  } catch (e) {
    return null;
  }
}



// ---- Post-processing: fix headlines ending with present tense ----
// Last-resort: if Gemini outputs present tense (ٿو/ٿي) at headline end,
// force to past perfective so headlines never end with present tense.
function fixHeadlineEnding(text) {
  if (!text || text.length > 120) return text;
  const trimmed = text.trim();
  // Check if ends with ٿو (masculine present) — change to 'ٿي ويو'
  if (trimmed.endsWith('ٿو') && trimmed.length > 2) {
    return trimmed.slice(0, -2) + 'ٿي ويو';
  }
  // Check if ends with ٿي (feminine/simple present) — change to 'ٿي وئي'
  if (trimmed.endsWith('ٿي') && trimmed.length > 2) {
    return trimmed.slice(0, -2) + 'ٿي وئي';
  }
  return trimmed;
}

// ---- Provider 1: Azure / Microsoft Translator ----
async function viaAzure(text, from) {
  const key = process.env.AZURE_TRANSLATOR_KEY;
  if (!key) return null;
  const region = process.env.AZURE_TRANSLATOR_REGION || '';
  const endpoint = (process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com').replace(/\/$/, '');
  const fromParam = from && from !== 'auto' ? '&from=' + from : '';
  const url = endpoint + '/translate?api-version=3.0&to=sd' + fromParam;
  const headers = { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/json' };
  if (region) headers['Ocp-Apim-Subscription-Region'] = region;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify([{ Text: text }]),
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const out = data && data[0] && data[0].translations && data[0].translations[0] && data[0].translations[0].text;
  return out || null;
}

// ---- Providers 2-4: free Google-backed endpoints (fallback) ----
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

// ---- Provider (Gemini-only): Paraphrase already-Sindhi content ----
async function viaGeminiRewrite(text) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key;
  const prompt =
    'You are a Sindhi news editor. Rewrite the following Sindhi text in your own words. ' +
    'Keep the same news meaning. Use natural journalistic Sindhi (سنڌي) as written in Kawish newspaper. ' +
    'Change the sentence structure, use synonyms, but keep proper nouns, names and numbers intact. ' +
    'Do NOT translate — this text is already Sindhi. Output ONLY the rewritten Sindhi text.\n\nText:\n' + String(text);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const out =
      data && data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    return out ? String(out).trim() : null;
  } catch (e) {
    return null;
  }
}

const PROVIDERS = [viaGemini, viaAzure, viaGoogleGtx, viaGoogleClients5, viaLingva];

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

async function translateRaw(text, from) {
  const chunks = chunkText(text);
  const out = [];
  for (const ch of chunks) {
    const t = await translateChunk(ch, from);
    out.push(t == null ? ch : t);
  }
  const joined = out.join('');
  return fixHeadlineEnding(joined);
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

// ---- Rewrite (already Sindhi content: paraphrase so it is original) ----
export async function toSindhiRewrite(text) {
  if (!text) return '';
  const key = createHash('sha1').update('rewrite|sd|' + String(text)).digest('hex');
  const hit = await cacheGet([key]);
  if (hit[key] != null) return hit[key];
  const out = await viaGeminiRewrite(text);
  if (out && out !== text) {
    await cachePut([{ hash: key, source: String(text).slice(0, 1000), lang: 'sd', translated: out }]);
  }
  // If Gemini failed or key not set, return original text unchanged.
  return out || text;
}

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
  const concurrency = Math.min(3, missIndices.length || 1);
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

