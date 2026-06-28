import Link from 'next/link';
import { cityName, CATEGORIES } from '../../lib/data';
import { fetchFeedNews } from '../../lib/rss';
import NewsCard from '../../components/NewsCard';
import { supabase } from '../../lib/supabase';

export const revalidate = 600;
export const maxDuration = 60;

async function cityLocalNews(city) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('city', city)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(8);
  return (data || []).map((p) => ({
    title: p.title,
    description: p.body,
    pubDate: p.created_at,
    source: 'local',
  }));
}

export default async function CityHome({ params }) {
  const { city } = params;
  const [local, auto] = await Promise.all([
    cityLocalNews(city),
    fetchFeedNews('local', 9),
  ]);
  const news = [...local, ...auto];

  return (
    <div className="pb-16">
      <header className="brand-gradient text-white px-6 pt-8 pb-7">
        <p className="text-white/80 text-sm mb-1">سنڌ جو شهر</p>
        <h1 className="text-3xl font-bold">{cityName(city)} جون خبرون</h1>
        <div className="flex flex-wrap gap-2 mt-5">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/${city}/${c.slug}`} className="text-xs px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25">
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </header>

      <section className="px-6 py-7">
        {news.length === 0 ? (
          <p className="text-center text-gray-500 py-16">هن وقت ڪابه خبر ڪونه آهي.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {news.map((n, i) => <NewsCard key={i} item={n} />)}
          </div>
        )}
      </section>
    </div>
  );
}
