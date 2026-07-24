// Fetch a source article and extract a readable title, image and paragraphs.
// Lightweight, dependency-free readability good enough for a free MVP.
function decodeEntities(s = '') {
  return String(s)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&rsquo;|&lsquo;/gi, "'")
    .replace(/&rdquo;|&ldquo;/gi, '"')
    .replace(/&ndash;|&mdash;/gi, '-')
    .replace(/&[a-z]+;/gi, ' ');
}

// Quote char class (" or ') without putting raw quotes inside a built string.
const Q = '[\\x22\\x27]';

function meta(html, prop) {
  const re = new RegExp('<meta[^>]+(?:property|name)=' + Q + prop + Q + '[^>]*>', 'i');
  const tag = html.match(re);
  if (!tag) return '';
  const c = tag[0].match(/content=[\x22\x27]([^\x22\x27]*)[\x22\x27]/i);
  return c ? decodeEntities(c[1]).trim() : '';
}

const JUNK = /(a a resize|google news|on google|follow us|subscribe|whatsapp channel|download our app|join our|شامل ڪريو)/i;

// Remove source-bylines from start of article paragraphs.
// UrduPoint prefixes each paragraph with something like:
// "RAWALPINDI: (UrduPoint/UrduPoint / Pakistan Point News-July 21st, 2026) A video..."
// Other sources may have "KARACHI: (Dawn) ..." patterns.
function cleanParaPrefix(text) {
  // English pattern: "LOCATION: (SourceName/.../Date) "
  // Urdu/Sindhi pattern: "(APP - UrduPoint/Pakistan Point News - Date) "
  let t = text.replace(/^[A-Z\s]+:\s*\([^)]+\)\s*/, '').trim();
  // Remove UrduPoint brand prefix: starts with bracket containing APP/UrduPoint/Pakistan Point
  if (t === text) {
    t = text.replace(/^\([^)]*(?:اردو پوائنٹ|UrduPoint|پاڪستان پوائنٽ|APP|Pakistan Point)[^)]*\)\s*/, '').trim();
  }
  return t;
}

function cleanTitle(title, siteName) {
  let t = (title || '').trim();
  t = t.replace(/\s*[|\u2013\u2014-]\s*ARY News\s*$/i, '').trim();
  if (siteName && t.endsWith(siteName)) {
    const sep = t.slice(0, t.length - siteName.length).trimEnd();
    if (/[|\u2013\u2014-]$/.test(sep)) t = sep.replace(/[|\u2013\u2014-]$/, '').trimEnd();
  }
  return t;
}

export async function extractArticle(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PnaSindhiBot/1.0)' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    let html = await res.text();
    html = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ');

    const image = meta(html, 'og:image');
    const siteName = meta(html, 'og:site_name');
    const rawTitle = meta(html, 'og:title') || decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')).trim();
    const title = cleanTitle(rawTitle, siteName);

    let publishedDate = meta(html, 'article:published_time') || meta(html, 'og:published_time') || meta(html, 'article:modified_time') || meta(html, 'og:updated_time') || '';
    if (!publishedDate) {
      const tm = html.match(/<time[^>]+datetime=[\x22\x27]([^\x22\x27]+)[\x22\x27]/i);
      if (tm) publishedDate = tm[1];
    }

    let scope = html;
    const art = html.match(/<article[\s\S]*?<\/article>/i);
    if (art) scope = art[0];

    const paragraphs = [];
    const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let m;
    while ((m = re.exec(scope)) !== null) {
      let text = decodeEntities(m[1].replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
      // Strip location: (SourceName/.../Date) prefix from first paragraphs
      text = cleanParaPrefix(text);
      if (text.length >= 40 && !/^(advertisement|read more|also read)/i.test(text) && !JUNK.test(text)) {
        paragraphs.push(text);
      }
      if (paragraphs.length >= 30) break;
    }

    return { title, image, siteName, paragraphs, publishedDate };
  } catch (e) {
    return null;
  }
}
