import Link from 'next/link';
import { fetchFeedNews } from '../lib/rss';
import { categoryName } from '../lib/data';
import { articlePath } from '../lib/url';
import Thumb from './Thumb';

export default async function CategorySection({ slug }) {
  const news = await fetchFeedNews(slug, 4);
  if (!news.length) return null;

  const lead = news[0];
  const rest = news.slice(1, 4);

  return (
    <div>
      <div className="flex items-center justify-between border-b-2 border-accent mb-3 pb-1">
        <h2 className="text-[2rem] font-bold text-brand-dark">{categoryName(slug)}</h2>
        <Link href={`/?cat=${slug}`} className="text-sm text-gray-500 hover:text-brand">وڊيڊ ←</Link>
      </div>

      <Link href={articlePath(lead)} className="group block">
        <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 mb-2">
          <Thumb src={lead.image} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
        </div>
        <h3 className="font-bold text-[1.5rem] leading-snug text-ink group-hover:text-brand line-clamp-2">{lead.title}</h3>
      </Link>

      <div className="divide-y divide-gray-200 mt-2">
        {rest.map((n) => (
          <Link key={n.id} href={articlePath(n)} className="flex items-center gap-3 py-2.5 group">
            <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <Thumb src={n.image} className="w-full h-full object-cover" />
            </div>
            <h4 className="flex-1 text-[1.1rem] font-bold text-ink leading-snug line-clamp-2 group-hover:text-brand">{n.title}</h4>
          </Link>
        ))}
      </div>
    </div>
  );
}
