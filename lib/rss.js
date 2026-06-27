import { XMLParser } from 'fast-xml-parser';
import { toSindhi } from './translate';

const FEEDS = {
  world: ['http://feeds.bbci.co.uk/news/world/rss.xml'],
  politics: ['http://feeds.bbci.co.uk/news/politics/rss.xml'],
  sports: ['http://feeds.bbci.co.uk/sport/rss.xml'],
  business: ['http://feeds.bbci.co.uk/news/business/rss.xml'],
  tech: ['http://feeds.bbci.co.uk/news/technology/rss.xml'],
  entertainment: ['http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml'],
};

const parser = new XMLParser({ ignoreAttributes: false });

function pickFeeds(category) {
  if (category && FEEDS[category]) return FEEDS[category];
  return FEEDS.world;
}

export async function fetchFeedNews(category, limit = 8) {
  const feeds = pickFeeds(category);
  const items = [];
  for (const feedUrl of feeds) {
    try {
      const res = await fetch(feedUrl, { next: { revalidate: 900 } });
      if (!res.ok) continue;
      const xml = await res.text();
      const json = parser.parse(xml);
      const raw = json?.rss?.channel?.item || [];
      for (const it of raw.slice(0, limit)) {
        items.push({
          title: it.title,
          description: typeof it.description === 'string' ? it.description : '',
          link: it.link,
          pubDate: it.pubDate || '',
        });
      }
    } catch (e) {}
  }
  const translated = await Promise.all(
    items.slice(0, limit).map(async (it) => ({
      ...it,
      title: await toSindhi(it.title),
      description: await toSindhi(stripHtml(it.description)),
      source: 'auto',
    }))
  );
  return translated;
}

function stripHtml(s = '') {
  return s.replace(/<[^>]*>/g, '').slice(0, 240);
}
