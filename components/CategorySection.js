import Link from 'next/link';
import { fetchFeedNews } from '../lib/rss';
import { categoryName } from '../lib/data';

function linkFor(item) {
  if (item.source === 'local' || !item.link) return '/';
  return `/article?u=${item.id}&s=${encodeURIComponent(item.sourceName || '')}${item.native ? '&n=1' : ''}`;
}

export default async function CategorySection({ slug }) {
  const news = await fetchFeedNews(slug, 4);
  if (!news.length) return null;

  const lead = news[0];
  const rest = news.slice(1, 4);

  return (
    <div>
      <div className="flex items-center justify-between border-b-2 border-accent mb-3 pb-1">
        <h2 className="text-[2rem] font-bold text-brand-dark">{categoryName(slug)}</h2>
        <Link href={`/?cat=${slug}`} className="text-sm text-gray-500 hover:text-brand">وڊيڈ ←</Link>
      </div>

      <Link href={linkFor(lead)} className="group block">
        {lead.image ? (
          <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lead.image} alt="" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
          </div>
        ) : null}
        <h3 className="font-bold text-[1.6rem] leading-none text-ink group-hover:text-brand line-clamp-3">{lead.title}</h3>
      </Link>

      <div className="divide-y divide-gray-200 mt-2">
        {rest.map((n) => (
          <Link key={n.id} href={linkFor(n)} className="flex gap-3 py-2 group">
            {n.image ? (
              <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={n.image} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ) : null}
            <h4 className="flex-1 text-[1.15rem] font-bold text-ink leading-none line-clamp-3 group-hover:text-brand">{n.title}</h4>
          </Link>
        ))}
      </div>
    </div>
  );
}
