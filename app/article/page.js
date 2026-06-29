import Link from 'next/link';
import { decodeUrl } from '../../lib/url';
import { extractArticle } from '../../lib/extract';
import { toSindhi, toSindhiMany } from '../../lib/translate';
import { fetchFeedNews } from '../../lib/rss';
import NewsCard from '../../components/NewsCard';

export const revalidate = 3600;
export const maxDuration = 60;

export const metadata = { title: 'خبر | پنا سنڌي' };

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://pna-sindhi-web.vercel.app';

function articleHref(item) {
  if (item.source === 'local' || !item.link) return '/';
  return `/article?u=${item.id}&s=${encodeURIComponent(item.sourceName || '')}${item.native ? '&n=1' : ''}`;
}

function timeAgoSindhi(dateStr) {
  if (!dateStr) return '';
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return '';
  const sec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);
  const ago = 'اڳ';
  if (sec < 60) return 'هاڻي';
  if (min < 60) return min + ' منٽ ' + ago;
  if (hr < 24) return hr + ' ڪلاڪ ' + ago;
  if (day < 30) return day + ' ڏينهن ' + ago;
  if (month < 12) return month + ' ' + (month === 1 ? 'مهينو' : 'مهينا') + ' ' + ago;
  return year + ' سال ' + ago;
}

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

function SidebarItem({ n }) {
  return (
    <Link href={articleHref(n)} className="flex items-center gap-3 py-3 group">
      {n.image ? (
        <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={n.image} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      ) : null}
      <h3 className="flex-1 text-[1.15rem] font-bold leading-snug text-ink line-clamp-2 group-hover:text-brand">{n.title}</h3>
    </Link>
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
        <div className="mt-2"><Link href="/" className="text-sm text-brand font-bold">→ واپس مُك صفحي تي</Link></div>
      </div>
    );
  }

  const [titleSd, paras, feedRaw] = await Promise.all([
    native ? Promise.resolve(data.title) : toSindhi(data.title),
    native ? Promise.resolve(data.paragraphs.slice(0, 20)) : toSindhiMany(data.paragraphs.slice(0, 20)),
    fetchFeedNews('top', 14),
  ]);
  const feed = (feedRaw || []).filter((n) => n.link && n.link !== url);
  const popular = feed.slice(0, 6);
  const related = feed.slice(6, 12);
  const relTime = timeAgoSindhi(data.publishedDate);
  const pageUrl = `${SITE}/article?u=${token}&s=${encodeURIComponent(sourceName)}${native ? '&n=1' : ''}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <article className="lg:col-span-3">
          <div className="mb-5">
            <Link href="/" className="text-sm text-brand font-bold">→ واپس</Link>
          </div>

          <h1 className="text-[2.5rem] font-medium leading-relaxed text-ink text-right">{titleSd}</h1>

          <div className="flex items-center justify-between border-y border-gray-200 py-3 mt-5 mb-7">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-2xl">پ</div>
              <div className="leading-tight">
                <div className="text-xl font-bold text-ink">ويب ڊيسڪ</div>
                {relTime ? <div className="text-base text-gray-500">{relTime}</div> : null}
              </div>
            </div>
            <ShareRow url={pageUrl} title={titleSd} />
          </div>

          {data.image ? (
            <figure className="mb-7">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.image} alt="" className="w-full rounded-2xl" />
            </figure>
          ) : null}

          <div className="space-y-4 text-[2rem] leading-none text-gray-800">
            {paras.map((p, i) => <p key={i}>{p}</p>)}
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

        <aside className="lg:col-span-1">
          <h2 className="text-base font-bold text-accent border-b-2 border-accent pb-1 mb-3">مقبول ترين</h2>
          <div className="divide-y divide-gray-200">
            {popular.map((n) => <SidebarItem key={n.id} n={n} />)}
          </div>
        </aside>
      </div>
    </div>
  );
}
