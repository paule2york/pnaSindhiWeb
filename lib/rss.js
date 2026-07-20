import { XMLParser } from 'fast-xml-parser';
import { toSindhiMany } from './translate';
import { encodeUrl } from './url';
import { saveArticles, getStoredNews } from './store';
import { extractArticle } from './extract';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

// English / Urdu Pakistani sources (these get machine-translated to Sindhi).
const FEEDS = {
  top: [
    { url: 'https://www.dawn.com/feeds/home', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/home', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/1', source: 'Geo News' },
    { url: 'https://www.pakistantoday.com.pk/feed/', source: 'Pakistan Today' },
    { url: 'https://arynews.tv/feed/', source: 'ARY News' },
    { url: 'https://propakistani.pk/feed/', source: 'ProPakistani' },
    { url: 'https://www.urdupoint.com/en/sitemap/news.rss', source: 'UrduPoint' },
  ],
  sindh: [
    { url: 'https://www.dawn.com/feeds/pakistan', source: 'Dawn' },
    { url: 'https://www.geo.tv/rss/1/2', source: 'Geo News' },
    { url: 'https://arynews.tv/category/pakistan/sindh/feed/', source: 'ARY News' },
  ],
  pakistan: [
    { url: 'https://www.dawn.com/feeds/pakistan', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/pakistan', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/2', source: 'Geo News' },
    { url: 'https://arynews.tv/category/pakistan/feed/', source: 'ARY News' },
    { url: 'https://www.urdupoint.com/en/sitemap/news.rss', source: 'UrduPoint' },
  ],
  world: [
    { url: 'https://www.dawn.com/feeds/world', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/world', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/3', source: 'Geo News' },
  ],
  business: [
    { url: 'https://www.dawn.com/feeds/business', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/business', source: 'Express Tribune' },
    { url: 'https://www.brecorder.com/feeds/latest-news', source: 'Business Recorder' },
  ],
  sports: [
    { url: 'https://www.dawn.com/feeds/sport', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/sports', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/5', source: 'Geo News' },
  ],
  health: [
    { url: 'https://tribune.com.pk/feed/health', source: 'Express Tribune' },
    { url: 'https://arynews.tv/category/health/feed/', source: 'ARY News' },
    { url: 'https://www.dawn.com/feeds/sci-tech', source: 'Dawn' },
  ],
  tech: [
    { url: 'https://propakistani.pk/feed/', source: 'ProPakistani' },
    { url: 'https://tribune.com.pk/feed/technology', source: 'Express Tribune' },
    { url: 'https://www.techjuice.pk/feed/', source: 'TechJuice' },
  ],
  entertainment: [
    { url: 'https://tribune.com.pk/feed/life-style', source: 'Express Tribune' },
    { url: 'https://arynews.tv/category/showbiz/feed/', source: 'ARY News' },
    { url: 'https://www.geo.tv/rss/1/8', source: 'Geo News' },
  ],
  offbeat: [
    { url: 'https://tribune.com.pk/feed/life-style', source: 'Express Tribune' },
    { url: 'https://propakistani.pk/feed/', source: 'ProPakistani' },
    { url: 'https://arynews.tv/category/showbiz/feed/', source: 'ARY News' },
  ],
  local: [
    { url: 'https://www.dawn.com/feeds/pakistan', source: 'Dawn' },
    { url: 'https://www.geo.tv/rss/1/2', source: 'Geo News' },
  ],
  politics: [
    { url: 'https://www.dawn.com/feeds/pakistan', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/pakistan', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/2', source: 'Geo News' },
  ],
};

// Native Sindhi-language sources (already in Sindhi -> NO translation needed).
const SINDHI_FEEDS = {
  top: [{ url: 'https://dailyibrat.com/feed/', source: 'عبرت' }],
  sindh: [{ url: 'https://dailyibrat.com/feed/', source: 'عبرت' }],
  pakistan: [{ url: 'https://dailyibrat.com/feed/', source: 'عبرت' }],
  world: [],
  sports: [],
  entertainment: [],
  business: [],
  health: [],
  tech: [],
  offbeat: [],
  local: [{ url: 'https://dailyibrat.com/feed/', source: 'عبرت' }],
  politics: [],
};

export const SOURCES = [
  'Dawn', 'Geo News', 'Express Tribune', 'ARY News',
  'Pakistan Today', 'Business Recorder', 'ProPakistani', 'UrduPoint',
  'عبرت',
];

function pickFeeds(category) {
  if (category && FEEDS[category]) return FEEDS[category];
  return FEEDS.top;
}
function pickSindhiFeeds(category) {
  if (category && SINDHI_FEEDS[category]) return SINDHI_FEEDS[category];
  return SINDHI_FEEDS.top || [];
}

function textOf(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object' && '#text' in v) return String(v['#text']);
  return '';
}

function getLink(it) {
  if (typeof it.link === 'string') return it.link;
  if (Array.isArray(it.link)) {
    const alt = it.link.find((l) => l && l['@_rel'] === 'alternate') || it.link[0];
    return (alt && (alt['@_href'] || textOf(alt))) || '';
  }
  if (it.link && typeof it.link === 'object') return it.link['@_href'] || textOf(it.link) || '';
  return textOf(it.guid) || '';
}

function getImage(it) {
  const enc = (it.enclosure && it.enclosure['@_url']) || (Array.isArray(it.enclosure) ? it.enclosure[0] && it.enclosure[0]['@_url'] : null);
  const mediaC = (it['media:content'] && it['media:content']['@_url']) || (Array.isArray(it['media:content']) ? it['media:content'][0] && it['media:content'][0]['@_url'] : null);
  const thumb = (it['media:thumbnail'] && it['media:thumbnail']['@_url']) || (Array.isArray(it['media:thumbnail']) ? it['media:thumbnail'][0] && it['media:thumbnail'][0]['@_url'] : null);
  let img = enc || mediaC || thumb || null;
  if (!img) {
    const html = textOf(it['content:encoded']) + ' ' + textOf(it.description) + ' ' + textOf(it.content);
    const m = html.match(/<img[^>]+src=[\x22\x27]([^\x22\x27]+)[\x22\x27]/i);
    if (m) img = m[1];
  }
  return img;
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '\x22')
    .replace(/&#0?39;/gi, '\x27')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 260);
}

async function collectFeeds(feeds, perFeed) {
  const out = [];
  await Promise.all(
    (feeds || []).map(async ({ url, source }) => {
      try {
        const res = await fetch(url, {
          next: { revalidate: 900 },
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PnaSindhi/1.0)' },
        });
        if (!res.ok) return;
        const xml = await res.text();
        const json = parser.parse(xml);
        const raw = (json && json.rss && json.rss.channel && json.rss.channel.item) || (json && json.feed && json.feed.entry) || [];
        const arr = Array.isArray(raw) ? raw : [raw];
        for (const it of arr.slice(0, perFeed)) {
          const link = getLink(it);
          const title = textOf(it.title);
          if (!link || !title) continue;
          out.push({
            rawTitle: title,
            rawDescription: stripHtml(textOf(it.description) || textOf(it['content:encoded']) || textOf(it.summary)),
            link,
            pubDate: it.pubDate || it.published || it.updated || it['dc:date'] || '',
            image: getImage(it),
            sourceName: source,
          });
        }
      } catch (e) {}
    })
  );
  return out;
}

export async function fetchFeedNews(category, limit = 12) {
  const enFeeds = pickFeeds(category);
  const sdFeeds = pickSindhiFeeds(category);
  const perEn = Math.max(4, Math.ceil((limit * 1.4) / Math.max(1, enFeeds.length)));
  const perSd = Math.max(4, Math.ceil((limit * 1.0) / Math.max(1, sdFeeds.length || 1)));

  const [enItems, sdItems] = await Promise.all([
    collectFeeds(enFeeds, perEn),
    collectFeeds(sdFeeds, perSd),
  ]);
  enItems.forEach((it) => { it.native = false; });
  sdItems.forEach((it) => { it.native = true; });

  const all = [...sdItems, ...enItems];
  all.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));

  const seen = new Set();
  const unique = [];
  for (const it of all) {
    if (!it.link || seen.has(it.link)) continue;
    seen.add(it.link);
    unique.push(it);
    if (unique.length >= limit) break;
  }

  // RSS feeds often omit the thumbnail even when the article page has one.
  // Fill missing images from the article's og:image so cards only fall back
  // to the default placeholder when the source truly has no image.
  const missingImg = unique.filter((it) => !it.image);
  if (missingImg.length) {
    await Promise.all(
      missingImg.map(async (it) => {
        try {
          const data = await extractArticle(it.link);
          if (data && data.image) it.image = data.image;
        } catch (e) {}
      })
    );
  }

  // Translate only the non-native (English/Urdu) items.
  const toTranslate = unique.filter((it) => !it.native);
  const titles = await toSindhiMany(toTranslate.map((it) => it.rawTitle));
  const descs = await toSindhiMany(toTranslate.map((it) => it.rawDescription));

  let ti = 0;
  const result = unique.map((it) => {
    let title;
    let description;
    if (it.native) {
      title = it.rawTitle;
      description = it.rawDescription;
    } else {
      title = titles[ti];
      description = descs[ti];
      ti++;
    }
    return {
      id: encodeUrl(it.link),
      title,
      description,
      link: it.link,
      pubDate: it.pubDate,
      image: it.image || '/placeholder.svg',
      sourceName: it.sourceName,
      source: it.native ? 'sindhi' : 'auto',
      native: it.native,
    };
  });

  // Persist so news never disappears. Read back the accumulated set ONLY for the
  // homepage ('top'); category pages always return their own fresh, correctly
  // categorized news so categories never get mixed up.
  await saveArticles(result, category || 'top');
  if ((category || 'top') === 'top') {
    const stored = await getStoredNews('top', limit);
    if (stored && stored.length) return stored.slice(0, limit);
  }
  return result;
}
