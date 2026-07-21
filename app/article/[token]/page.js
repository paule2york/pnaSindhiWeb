import ArticleView from '../../../components/ArticleView';
import { decodeUrl, shortId } from '../../../lib/url';
import { extractArticle } from '../../../lib/extract';
import { toSindhi } from '../../../lib/translate';
import { getArticleById } from '../../../lib/store';
import { fetchFeedNews } from '../../../lib/rss';

export const revalidate = 3600;
export const maxDuration = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://pna-sindhi-web.vercel.app';

export async function generateMetadata({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  // Prefer explicit ?u= base64-encoded URL over numeric id lookup
  let url = searchParams?.u ? decodeUrl(searchParams.u) : '';
  let stored = null;
  const native = searchParams?.n === '1';

  if (!url) {
    const isNumericId = /^\d+$/.test(String(params.token || ''));
    if (isNumericId) {
      stored = await getArticleById(params.token).catch(() => null);
      url = (stored && stored.link) || '';
      if (!url) {
        const allNews = await fetchFeedNews('top', 60).catch(() => []);
        const found = allNews.find(n => n.link && shortId(n.link) === params.token);
        if (found) {
          url = found.link;
          stored = found;
        }
      }
    } else {
      try { url = decodeUrl(params.token); } catch (e) { url = ''; }
    }
  }

  if (!url) return { title: 'خبر | پي اين اي سنڌي' };
  try {
    const data = await extractArticle(url);
    if (!data || !data.title) return { title: 'خبر | پي اين اي سنڌي' };
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
    return { title: 'خبر | پي اين اي سنڌي' };
  }
}

export default async function Page({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const native = searchParams?.n === '1';
  return <ArticleView token={params.token} url={searchParams?.u || ''} native={native} />;
}
