import Link from 'next/link';
import { decodeUrl } from '../../lib/url';
import { extractArticle } from '../../lib/extract';
import { toSindhi, toSindhiMany } from '../../lib/translate';
import { fetchFeedNews } from '../../lib/rss';
import NewsCard from '../../components/NewsCard';

export const revalidate = 3600;
export const maxDuration = 60;

export const metadata = { title: 'خبر | پنا سنڌي' };

function ShareRow({ url, title }) {
  const u = encodeURIComponent(url || '');
  const t = encodeURIComponent(title || '');
  const wa = 'https://wa.me/?text=' + t + '%20' + u;
  const fb = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
  const tw = 'https://twitter.com/intent/tweet?text=' + t + '&url=' + u;
  const base = 'w-9 h-9 rounded-full text-white flex items-center justify-center hover:opacity-90 transition';
  return (
    <div className="flex items-center gap-3">
      <a href={wa} target="_blank" rel="noreferrer" aria-label="WhatsApp" className={`${base} bg-[#25D366]`}>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M19.1 4.9A10 10 0 0 0 3.6 17.5L2 22l4.6-1.5A10 10 0 1 0 19.1 4.9zM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.7.9.9-2.6-.2-.3A8 8 0 1 1 12 20zm4.6-6c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.1-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.1-.3 0-.4.1-.5l.4-.5c.1-.2.1-.3.2-.5 0-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3a2.8 2.8 0 0 0-.9 2.1c0 1.2.9 2.4 1 2.6.1.2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3z"/></svg>
      </a>
      <a href={fb} target="_blank" rel="noreferrer" aria-label="Facebook" className={`${base} bg-[#1877F2]`}>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M14 9h3l.4-3H14V4.5c0-.9.3-1.5 1.6-1.5H17V.4C16.7.3 15.7.2 14.6.2 12.2.2 10.6 1.7 10.6 4.3V6H8v3h2.6v9H14V9z"/></svg>
      </a>
      <a href={tw} target="_blank" rel="noreferrer" aria-label="X" className={`${base} bg-black`}>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M17.5 3h3l-6.6 7.5L21.7 21h-5.6l-4.4-5.7L6.7 21H3.7l7-8L2.6 3h5.7l4 5.3L17.5 3zm-1 16h1.6L7.6 4.7H5.9L16.5 19z"/></svg>
      </a>
    </div>
  );
}

export default async function ArticlePage({ searchParams }) {
  const token = searchParams?.u || '';
  const sourceName = searchParams?.s || '';
  const native = searchParams?.n === '1';
  let url = '';
  try { url = decodeUrl(token); } catch (e) { url = ''; }

  if (!url) {
    return <div className="px-6 py-20 text-center text-gray-500">خبر نه ملي.</div>;
  }

  const data = await extractArticle(url);

  if (!data || !data.paragraphs || data.paragraphs.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">هيءَ خبر هتي دڈائي نه ٹي سگهي.</p>
        <a href={url} target="_blank" rel="noreferrer" className="text-brand font-bold">اصل خبر پڊرهو ↗</a>
        <div className="mt-6"><Link href="/" className="text-sm text-gray-500">→ واپس مُك صفحي تي</Link></div>
      </div>
    );
  }

  const [titleSd, paras, relatedRaw] = await Promise.all([
    native ? Promise.resolve(data.title) : toSindhi(data.title),
    native ? Promise.resolve(data.paragraphs.slice(0, 20)) : toSindhiMany(data.paragraphs.slice(0, 20)),
    fetchFeedNews('top', 9),
  ]);
  const related = (relatedRaw || []).filter((n) => n.link && n.link !== url).slice(0, 6);

  return (
    <article className="max-w-3xl mx-auto px-5 py-8">
      <div className="mb-5">
        <Link href="/" className="text-sm text-brand font-bold">→ واپس</Link>
      </div>

      <h1 className="text-[2.5rem] font-bold leading-snug text-ink text-center">{titleSd}</h1>

      <div className="mt-5 mb-6 flex flex-col items-center gap-4">
        <div className="text-sm text-gray-500">
          <span className="text-accent font-bold">{sourceName || data.siteName || 'خبر'}</span>
          <span className="mx-2">•</span>
          <span>{native ? 'سنڌي ذريعو' : 'سنڌيءَ ۚ ترجمو ٹيل'}</span>
        </div>
        <ShareRow url={url} title={data.title} />
      </div>

      {data.image ? (
        <figure className="mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.image} alt="" className="w-full rounded-2xl" />
        </figure>
      ) : null}
      {sourceName || data.siteName ? (
        <div className="text-center text-sm text-gray-400 mb-7">{sourceName || data.siteName}</div>
      ) : null}

      <div className="space-y-5 text-[2rem] leading-relaxed text-gray-800">
        {paras.map((p, i) => (
          <p key={i} className={i === 0 ? 'font-bold text-ink' : ''}>{p}</p>
        ))}
      </div>

      <div className="mt-8 pt-5 border-t border-gray-200 text-sm text-gray-500">
        اصل خبر:{' '}
        <a href={url} target="_blank" rel="noreferrer" className="text-brand font-bold">{sourceName || 'ماخذ'} ↗</a>
        {native ? null : <p className="text-[11px] text-gray-400 mt-2">نوٹ: ترجمو خودڈار (مشيني) آهي.</p>}
      </div>

      {related.length ? (
        <section className="mt-12">
          <h2 className="text-[2rem] font-bold mb-5 text-brand-dark border-r-4 border-accent pr-3">متعلقه خبرون</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((n) => <NewsCard key={n.id} item={n} />)}
          </div>
        </section>
      ) : null}
    </article>
  );
}
