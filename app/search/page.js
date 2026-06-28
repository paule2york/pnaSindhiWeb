import { fetchFeedNews } from '../../lib/rss';
import NewsCard from '../../components/NewsCard';
import SearchBox from '../../components/SearchBox';

export const revalidate = 900;
export const maxDuration = 60;

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || '').trim();

  let results = [];
  if (q) {
    const pool = await fetchFeedNews('top', 40);
    const needle = q.toLowerCase();
    results = pool.filter((it) =>
      (it.title || '').toLowerCase().includes(needle) ||
      (it.description || '').toLowerCase().includes(needle) ||
      (it.sourceName || '').toLowerCase().includes(needle)
    );
  }

  return (
    <div className="pb-16">
      <header className="brand-gradient text-white px-6 pt-8 pb-7">
        <h1 className="text-2xl font-bold">خبرون ڳوليو</h1>
        <p className="text-white/85 mt-1 text-sm">سنڌي يا انگريزيءَ ۾ ڳولا ڪريو</p>
        <div className="mt-4 max-w-md">
          <SearchBox initial={q} />
        </div>
      </header>

      <section className="px-6 py-7">
        {!q ? (
          <p className="text-center text-gray-500 py-16">ڳولا لاءِ مٿي ڪجهه لکو…</p>
        ) : results.length === 0 ? (
          <p className="text-center text-gray-500 py-16">«{q}» لاءِ ڪا خبر نه ملي. مهرباني ڪري ٻيو لفظ آزمايو.</p>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4 text-brand-dark border-r-4 border-accent pr-3">«{q}» جا نتيجا ({results.length})</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((n) => <NewsCard key={n.id} item={n} />)}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
