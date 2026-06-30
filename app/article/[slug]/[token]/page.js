import ArticleView from '../../../../components/ArticleView';
import { decodeUrl, slugify } from '../../../../lib/url';
import { extractArticle } from '../../../../lib/extract';
import { toSindhi } from '../../../../lib/translate';

export const revalidate = 3600;
export const maxDuration = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://pna-sindhi-web.vercel.app';

export async function generateMetadata({ params, searchParams }) {
  const native = searchParams?.n === '1';
  let url = '';
  try { url = decodeUrl(params.token); } catch (e) { url = ''; }
  if (!url) return { title: 'خبر | پنا سنڌي' };
  try {
    const data = await extractArticle(url);
    if (!data || !data.title) return { title: 'خبر | پنا سنڌي' };
    const title = native ? data.title : await toSindhi(data.title);
    const desc = (data.paragraphs && data.paragraphs[0]) ? String(data.paragraphs[0]).slice(0, 160) : 'پنا سنڌي تي تازيون خبرون';
    const canonical = `${SITE}/article/${slugify(title)}/${params.token}${native ? '?n=1' : ''}`;
    const images = data.image ? [data.image] : [];
    return {
      title: `${title} | پنا سنڌي`,
      description: desc,
      alternates: { canonical },
      openGraph: { title, description: desc, url: canonical, images, type: 'article' },
      twitter: { card: 'summary_large_image', title, description: desc, images },
    };
  } catch (e) {
    return { title: 'خبر | پنا سنڌي' };
  }
}

export default function Page({ params, searchParams }) {
  const native = searchParams?.n === '1';
  return <ArticleView token={params.token} native={native} />;
}
