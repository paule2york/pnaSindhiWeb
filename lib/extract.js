// Fetch a source article and extract a readable title, image and paragraphs.
// Lightweight, dependency-free readability good enough for a free MVP.
function decodeEntities(s = '') {
  return String(s)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '\"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&rsquo;|&lsquo;/gi, "'")
    .replace(/&rdquo;|&ldquo;/gi, '\"')
    .replace(/&ndash;|&mdash;/gi, '-')
    .replace(/&[a-z]+;/gi, ' ');
}

function meta(html, prop) {
  const re = new RegExp('<meta[^>]+(?:property|name)=[\"\\']' + prop + '[\"\\'][^>]*>', 'i');
  const tag = html.match(re);
  if (!tag) return '';
  const c = tag[0].match(/content=[\"']([^\"']*)[\"']/i);
  return c ? decodeEntities(c[1]).trim() : '';
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

    const title = meta(html, 'og:title') || decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')).trim();
    const image = meta(html, 'og:image');
    const siteName = meta(html, 'og:site_name');

    let scope = html;
    const art = html.match(/<article[\s\S]*?<\/article>/i);
    if (art) scope = art[0];

    const paragraphs = [];
    const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let m;
    while ((m = re.exec(scope)) !== null) {
      const text = decodeEntities(m[1].replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
      if (text.length >= 40 && !/^(advertisement|read more|also read)/i.test(text)) {
        paragraphs.push(text);
      }
      if (paragraphs.length >= 30) break;
    }

    return { title, image, siteName, paragraphs };
  } catch (e) {
    return null;
  }
}
