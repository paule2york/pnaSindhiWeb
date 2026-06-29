import { fetchFeedNews } from '../../../lib/rss';

export const revalidate = 900;
export const maxDuration = 60;

export async function GET() {
  try {
    const news = await fetchFeedNews('top', 15);
    const items = news.map((n) => ({
      title: n.title,
      href:
        n.source === 'local' || !n.link
          ? '/'
          : `/article?u=${n.id}&s=${encodeURIComponent(n.sourceName || '')}${n.native ? '&n=1' : ''}`,
    }));
    return Response.json({ items });
  } catch (e) {
    return Response.json({ items: [] });
  }
}
