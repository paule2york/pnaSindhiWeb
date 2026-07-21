import Link from 'next/link';
import { CATEGORIES } from '../../lib/data';
import { fetchFeedNews } from '../../lib/rss';
import NewsCard from '../../components/NewsCard';
import Thumb from '../../components/Thumb';
import { articlePath } from '../../lib/url';

export const revalidate = 300;

export default async function CategoriesPage() {
  const sections = await Promise.all(
    CATEGORIES.slice(0, 6).map(async (c) => {
      const items = await fetchFeedNews(c.slug, 8);
      return { ...c, items };
    })
  );

  return (
    <div className="pb-32 px-4 pt-5">
      <h1 className="text-[2rem] font-bold mb-5 text-brand-dark border-r-4 border-accent pr-3">زمريا</h1>

      <div className="grid sm:grid-cols-2 gap-6">
        {sections.map((s) => (
          <div key={s.slug} className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="brand-gradient px-5 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{s.icon} {s.name}</h2>
              <Link href={`/?cat=${s.slug}`} className="text-sm text-white/80 hover:text-white font-bold">سڀ ڏسو →</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {s.items.slice(0, 4).map((n) => (
                <Link key={n.id} href={articlePath(n)} className="flex items-center gap-3 px-4 py-3 group">
                  <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Thumb src={n.image} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="flex-1 text-[1.1rem] font-bold leading-snug text-ink dark:text-gray-100 line-clamp-2 group-hover:text-brand">{n.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
