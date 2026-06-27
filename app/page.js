import CitySelector from '../components/CitySelector';
import { fetchFeedNews } from '../lib/rss';
import NewsCard from '../components/NewsCard';

export const revalidate = 900;

export default async function Home({ searchParams }) {
  const cat = searchParams?.cat || 'world';
  const news = await fetchFeedNews(cat, 6);

  return (
    <div>
      <header className="brand-gradient text-white px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">پنا سنڌي</h1>
        <p className="text-white/85">تازيون خبرون — شهر وار ٔ اين زمري وار ٔ</p>
      </header>

      <section className="px-6 py-8">
        <CitySelector />
      </section>

      <section className="px-6 pb-12">
        <h2 className="text-xl font-bold mb-4 text-brand-dark">تازيون خبرون</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((n, i) => <NewsCard key={i} item={n} />)}
        </div>
      </section>
    </div>
  );
}
