import ArticleView from '../../../components/ArticleView';
import { decodeUrl, shortId } from '../../../lib/url';
import { extractArticle } from '../../../lib/extract';
import { toSindhi } from '../../../lib/translate';
import { getArticleById } from '../../../lib/store';
import { fetchFeedNews } from '../../../lib/rss';

export const revalidate = 3600;
export const maxDuration = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://pna-sindhi-web.vercel.app';

// Search ALL categories with big limits so past articles are findable.
const SEARCH_CATEGORIES = ['top', 'sindh', 'pakistan', 'world', 'business', 'sports', 'technology'];

async function findItem(token) {
  const isNumeric = /^\d+$/.test(String(token || ''));
  if (!isNumeric) {
    try { const url = decodeUrl(token); return { url, item: null }; }
    catch (e) { return { url: '', item: null }; }
  }

  // Try Supabase first
  const stored = await getArticleById(token).catch(() => null);
  if (stored && stored.link) return { url: stored.link, item: stored };

  // Search all categories for matching shortId
  const results = await Promise.all(
    SEARCH_CATEGORIES.map((cat) =>
      fetchFeedNews(cat, 200).catch(() => [])
    )
  );
  for (const items of results) {
    if (!Array.isArray(items)) continue;
    const found = items.find((n) => n && n.link && shortId(n.link) === token);
    if (found) return { url: found.link, item: found };
  }
  return { url: '', item: null };
}

export async function generateMetadata({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const native = searchParams?.n === '1';
  const { url, item } = await findItem(params.token);
  if (!url) return { title: 'خبر | پي اين اي سنڌي' };
  try {
    const data = await extractArticle(url);
    if (!data || !data.title) {
      // Use RSS fallback data for metadata
      if (item && item.title) {
        return {
          title: `${item.title} | پي اين اي سنڌي`,
          description: (item.description || '').slice(0, 160),
          alternates: { canonical: `${SITE}/article/${params.token}${native ? '?n=1' : ''}` },
          openGraph: {
            title: item.title,
            description: (item.description || '').slice(0, 160),
            url: `${SITE}/article/${params.token}${native ? '?n=1' : ''}`,
            images: item.image ? [item.image] : [],
            type: 'article',
          },
          twitter: { card: 'summary_large_image', title: item.title, description: (item.description || '').slice(0, 160), images: item.image ? [item.image] : [] },
        };
      }
      return { title: 'خبر | پي اين اي سنڌي' };
    }
    const title = native ? data.title : await toSindhi(data.title);
    const desc = (data.paragraphs && data.paragraphs[0]) ? String(data.paragraphs[0]).slice(0, 160) : 'پي اين اي سنڌي تي تازيون خبرون';
    const canonical = `${SITE}/article/${params.token}${native ? '?n=1' : ''}`;
    const images = data.image ? [data.image] : [];
    return {
      title: `${title} | پي اين اي سنڌي`,
      description: desc,
      alternates: { canonical },
      openGraph: { title, description: desc, url: canonical, images, type: 'article' },
      twitter: { card: 'summary_large_image', title, description: desc, images },
    };
  } catch (e) {
    if (item && item.title) {
      return {
        title: `${item.title} | پي اين اي سنڌي`,
        description: (item.description || '').slice(0, 160),
      };
    }
    return { title: 'خبر | پي اين اي سنڌي' };
  }
}

export default async function Page({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const native = searchParams?.n === '1';
  const { url, item } = await findItem(params.token);

  return (
    <ArticleView
      token={params.token}
      url={url}
      native={native}
      rssTitle={item?.title || ''}
      rssDesc={item?.description || ''}
      rssImage={item?.image || ''}
    />
  );
}
