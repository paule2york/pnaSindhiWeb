// Free Google Translate endpoint (no API key). Translates text to Sindhi (sd).
// Long text is split into chunks and retried so NOTHING is left untranslated.

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';

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

async function translateChunk(text, from, tries = 3) {
  const url = ENDPOINT + '?client=gtx&sl=' + from + '&tl=sd&dt=t&q=' + encodeURIComponent(text);
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 86400 },
      });
      if (res.status === 429 || res.status >= 500) {
        await sleep(400 * (i + 1));
        continue;
      }
      if (!res.ok) return null;
      const data = await res.json();
      const out = (data[0] || []).map((c) => (c && c[0]) || '').join('');
      if (out) return out;
      return null;
    } catch (e) {
      await sleep(400 * (i + 1));
    }
  }
  return null;
}

export async function toSindhi(text, from = 'auto') {
  if (!text) return '';
  const chunks = chunkText(text);
  const out = [];
  for (const ch of chunks) {
    let t = await translateChunk(ch, from);
    if (t == null) {
      await sleep(600);
      t = await translateChunk(ch, from);
    }
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
