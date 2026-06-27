import { XMLParser } from 'fast-xml-parser';
import { toSindhi } from './translate';
import { encodeUrl } from './url';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

// Pakistani news sources grouped by category. Multiple sources per category so
// the site is no longer dependent on a single API and is full of local news.
const FEEDS = {
  top: [
    { url: 'https://www.dawn.com/feeds/home', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/home', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/1', source: 'Geo News' },
    { url: 'https://www.pakistantoday.com.pk/feed/', source: 'Pakistan Today' },
    { url: 'https://arynews.tv/feed/', source: 'ARY News' },
    { url: 'https://www.bolnews.com/feed/', source: 'BOL News' },
    { url: 'https://propakistani.pk/feed/', source: 'ProPakistani' },
  ],
  politics: [
    { url: 'https://www.dawn.com/feeds/pakistan', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/pakistan', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/2', source: 'Geo News' },
    { url: 'https://www.pakistantoday.com.pk/category/national/feed/', source: 'Pakistan Today' },
    { url: 'https://arynews.tv/category/pakistan/feed/', source: 'ARY News' },
  ],
  world: [
    { url: 'https://www.dawn.com/feeds/world', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/world', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/3', source: 'Geo News' },
    { url: 'https://arynews.tv/category/world/feed/', source: 'ARY News' },
  ],
  business: [
    { url: 'https://www.dawn.com/feeds/business', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/business', source: 'Express Tribune' },
    { url: 'https://www.brecorder.com/feeds/latest-news', source: 'Business Recorder' },
    { url: 'https://arynews.tv/category/business/feed/', source: 'ARY News' },
  ],
  sports: [
    { url: 'https://www.dawn.com/feeds/sport', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/sports', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/5', source: 'Geo News' },
    { url: 'https://arynews.tv/category/sports/feed/', source: 'ARY News' },
  ],
  entertainment: [
    { url: 'https://tribune.com.pk/feed/life-style', source: 'Express Tribune' },
    { url: 'https://arynews.tv/category/showbiz/feed/', source: 'ARY News' },
    { url: 'https://www.geo.tv/rss/1/8', source: 'Geo News' },
    { url: 'https://www.bolnews.com/entertainment/feed/', source: 'BOL News' },
  ],
  tech: [
    { url: 'https://propakistani.pk/feed/', source: 'ProPakistani' },
    { url: 'https://tribune.com.pk/feed/technology', source: 'Express Tribune' },
    { url: 'https://www.techjuice.pk/feed/', source: 'TechJuice' },
  ],
  local: [
    { url: 'https://www.dawn.com/feeds/pakistan', source: 'Dawn' },
    { url: 'https://www.geo.tv/rss/1/2', source: 'Geo News' },
    { url: 'https://arynews.tv/category/pakistan/feed/', source: 'ARY News' },
  ],
};

export const SOURCES = [
  'Dawn', 'Geo News', 'Express Tribune', 'ARY News',
  'BOL News', 'Pakistan Today', 'Business Recorder', 'ProPakistani',
];

function pickFeeds(category) {
  if (category && FEEDS[category]) return FEEDS[category];
  return FEEDS.top;
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
    const alt = it.link.find((l) => l?.['@_rel'] === 'alternate') || it.link[0];
    return alt?.['@_href'] || textOf(alt) || '';
  }
  if (it.link && typeof it.link === 'object') return it.link['@_href'] || textOf(it.link) || '';
  return textOf(it.guid) || '';
}

function getImage(it) {
  const enc = it.enclosure?.['@_url'] || (Array.isArray(it.enclosure) ? it.enclosure[0]?.['@_url'] : null);
  const mediaC = it['media:content']?.['@_url'] || (Array.isArray(it['media:content']) ? it['media:content'][0]?.['@_url'] : null);
  const thumb = it['media:thumbnail']?.['@_url'] || (Array.isArray(it['media:thumbnail']) ? it['media:thumbnail'][0]?.['@_url'] : null);
  let img = enc || mediaC || thumb || null;
  if (!img) {
    const html = textOf(it['content:encoded']) + ' ' + textOf(it.description) + ' ' + textOf(it.content);
    const m = html.match(/<img[^>]+src=[\"']([^\"']+)[\"']/i);
    if (m) img = m[1];
  }
  return img;
}

function stripHtml(s = '') {
  return String(s)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '\"')
    .replace(/&#39;/gi, "'")
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 260);
}

export async function fetchFeedNews(category, limit = 12) {
  const feeds = pickFeeds(category);
  const perFeed = Math.max(4, Math.ceil((limit * 1.6) / feeds.length));
  const collected = [];

  await Promise.all(
    feeds.map(async ({ url, source }) => {
      try {
        const res = await fetch(url, {
          next: { revalidate: 900 },
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PnaSindhi/1.0)' },
        });
        if (!res.ok) return;
        const xml = await res.text();
        const json = parser.parse(xml);
        const raw = json?.rss?.channel?.item || json?.feed?.entry || [];
        const arr = Array.isArray(raw) ? raw : [raw];
        for (const it of arr.slice(0, perFeed)) {
          const link = getLink(it);
          const title = textOf(it.title);
          if (!link || !title) continue;
          collected.push({
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

  collected.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));

  const seen = new Set();
  const unique = [];
  for (const it of collected) {
    if (seen.has(it.link)) continue;
    seen.add(it.link);
    unique.push(it);
    if (unique.length >= limit) break;
  }

  const translated = await Promise.all(
    unique.map(async (it) => ({
      id: encodeUrl(it.link),
      title: await toSindhi(it.rawTitle),
      description: await toSindhi(it.rawDescription),
      link: it.link,
      pubDate: it.pubDate,
      image: it.image,
      sourceName: it.sourceName,
      source: 'auto',
    }))
  );
  return translated;
}
