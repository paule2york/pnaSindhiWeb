import Link from 'next/link';
import { cityName, categoryName, CATEGORIES } from '../../../lib/data';
import { fetchFeedNews } from '../../../lib/rss';
import NewsCard from '../../../components/NewsCard';
import { supabase } from '../../../lib/supabase';

export const revalidate = 600;
export const maxDuration = 60;

async function localNews(city, category) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('city', city)
    .eq('category', category)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(20);
  return (data || []).map((p) => ({
    title: p.title,
    description: p.body,
    pubDate: p.created_at,
    source: 'local',
  }));
}

export default async function CityCategory({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { city, category } = params;
  const [local, auto] = await Promise.all([
    localNews(city, category),
    category === 'local' ? Promise.resolve([]) : fetchFeedNews(category, 9),
  ]);
  const news = [...local, ...auto];

  return (
    <div className="pb-16">
      <header className="brand-gradient text-white px-6 pt-8 pb-7">
        <Link href={`/${city}`} className="text-white/80 text-sm mb-1 inline-block hover:text-white">{cityName(city)}</Link>
        <h1 className="text-2xl font-bold">{categoryName(category)} خبرون</h1>
        <div className="flex flex-wrap gap-2 mt-5">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/${city}/${c.slug}`} className={`text-xs px-3 py-1.5 rounded-full ${c.slug === category ? 'bg-white text-brand-dark font-bold' : 'bg-white/15 hover:bg-white/25'}`}>
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </header>

      <section className="px-6 py-7">
        {news.length === 0 ? (
          <p className="text-center text-gray-500 py-16">هن وقت ڪوبه خبر ڪونه آهي.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {news.map((n, i) => <NewsCard key={i} item={n} />)}
          </div>
        )}
      </section>
    </div>
  );
}
