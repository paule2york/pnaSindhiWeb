import { cityName, categoryName } from '../../../lib/data';
import { fetchFeedNews } from '../../../lib/rss';
import NewsCard from '../../../components/NewsCard';
import { supabase } from '../../../lib/supabase';

export const revalidate = 600;

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

export default async function CityCategory({ params }) {
  const { city, category } = params;
  const local = await localNews(city, category);
  const auto = category === 'local' ? [] : await fetchFeedNews(category, 6);
  const news = [...local, ...auto];

  return (
    <div>
      <header className="brand-gradient text-white px-6 py-8">
        <p className="text-white/80 text-sm mb-1">{cityName(city)}</p>
        <h1 className="text-2xl font-bold">{categoryName(category)} خبرون</h1>
      </header>

      <section className="px-6 py-8">
        {news.length === 0 ? (
          <p className="text-gray-500">هن وقت ڪوبهو خبر ڪونه آهي.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((n, i) => <NewsCard key={i} item={n} />)}
          </div>
        )}
      </section>
    </div>
  );
}
