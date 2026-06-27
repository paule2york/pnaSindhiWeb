import Link from 'next/link';
import { decodeUrl } from '../../lib/url';
import { extractArticle } from '../../lib/extract';
import { toSindhi } from '../../lib/translate';

export const revalidate = 3600;

export const metadata = { title: 'خبر | پنا سنڌي' };

export default async function ArticlePage({ searchParams }) {
  const token = searchParams?.u || '';
  const sourceName = searchParams?.s || '';
  let url = '';
  try { url = decodeUrl(token); } catch (e) { url = ''; }

  if (!url) {
    return <div className="px-6 py-20 text-center text-gray-500">خبر نه ملي.</div>;
  }

  const data = await extractArticle(url);

  if (!data || !data.paragraphs || data.paragraphs.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">هيءَ خبر هتي ترجمو نه ٿي سگهي.</p>
        <a href={url} target="_blank" rel="noreferrer" className="text-brand font-bold">اصل خبر پڙهو ↗</a>
        <div className="mt-6"><Link href="/" className="text-sm text-gray-500">→ واپس مُک صفحي تي</Link></div>
      </div>
    );
  }

  const titleSd = await toSindhi(data.title);
  const paras = await Promise.all(data.paragraphs.slice(0, 22).map((p) => toSindhi(p)));

  return (
    <article className="max-w-3xl mx-auto px-5 py-8">
      <Link href="/" className="text-sm text-brand font-bold">→ واپس</Link>

      <div className="flex items-center gap-2 mt-4 mb-3">
        <span className="bg-brand-light text-brand-dark text-[11px] px-2 py-0.5 rounded-full font-bold">{sourceName || data.siteName || 'خبر'}</span>
        <span className="text-[11px] text-gray-400">سنڌيءَ ۾ ترجمو ٿيل</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold leading-relaxed text-ink mb-5">{titleSd}</h1>

      {data.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.image} alt="" className="w-full rounded-2xl mb-6" />
      ) : null}

      <div className="space-y-4 text-lg leading-loose text-gray-800">
        {paras.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div className="mt-8 pt-5 border-t border-gray-200 text-sm text-gray-500">
        اصل خبر:{' '}
        <a href={url} target="_blank" rel="noreferrer" className="text-brand font-bold">{sourceName || 'ماخذ'} ↗</a>
        <p className="text-[11px] text-gray-400 mt-2">نوٽ: ترجمو خودڪار (مشيني) آهي.</p>
      </div>
    </article>
  );
}
