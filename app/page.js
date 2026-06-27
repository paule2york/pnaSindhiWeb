import Link from 'next/link';
import { fetchFeedNews } from '../lib/rss';
import NewsCard from '../components/NewsCard';
import CitySelector from '../components/CitySelector';
import { CATEGORIES, categoryName } from '../lib/data';

export const revalidate = 900;
export const maxDuration = 60;

function articleHref(item) {
  return `/article?u=${item.id}&s=${encodeURIComponent(item.sourceName || '')}${item.native ? '&n=1' : ''}`;
}

export default async function Home({ searchParams }) {
  const cat = searchParams?.cat || 'top';
  const news = await fetchFeedNews(cat, 15);
  const lead = news[0];
  const secondary = news.slice(1, 5);
  const grid = news.slice(5);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="pb-16">
      <header className="brand-gradient text-white px-6 pt-8 pb-7">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">پنا سنڌي</h1>
            <p className="text-white/85 mt-1">سڊي پاڪستان جون تازيون خبرون — سنڌيءَ ۾</p>
          </div>
          <span className="text-white/80 text-sm">{today}</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <Link href="/" className={`text-xs px-3 py-1.5 rounded-full ${cat === 'top' ? 'bg-white text-brand-dark font-bold' : 'bg-white/15 hover:bg-white/25'}`}>تازي ترين</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/?cat=${c.slug}`} className={`text-xs px-3 py-1.5 rounded-full ${cat === c.slug ? 'bg-white text-brand-dark font-bold' : 'bg-white/15 hover:bg-white/25'}`}>
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </header>

      {news.length === 0 ? (
        <p className="px-6 py-16 text-center text-gray-500">هن وقت خبرون لوڊ نه ٿي سگهيون، مهرباني ڪري ٿوري دير ڪان پوءي ڪوشش ڪريو.</p>
      ) : (
        <>
          <section className="px-6 py-7 grid lg:grid-cols-3 gap-5">
            {lead ? (
              <Link href={articleHref(lead)} className="lg:col-span-2 relative block rounded-3xl overflow-hidden group min-h-[320px]">
                {lead.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lead.image} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="absolute inset-0 brand-gradient" />
                )}
                <div className="absolute inset-0 hero-overlay" />
                <div className="relative p-6 pt-48 text-white">
                  <span className="bg-accent text-white text-[11px] px-2 py-0.5 rounded-full font-bold">{lead.sourceName}</span>
                  <h2 className="text-2xl md:text-3xl font-bold mt-3 leading-relaxed">{lead.title}</h2>
                  {lead.description ? <p className="text-white/85 text-sm mt-2 line-clamp-2">{lead.description}</p> : null}
                </div>
              </Link>
            ) : null}

            <div className="space-y-4">
              {secondary.map((n) => (
                <Link key={n.id} href={articleHref(n)} className="card-hover flex gap-3 bg-white rounded-2xl overflow-hidden border border-gray-100">
                  {n.image ? (
                    <div className="w-28 shrink-0 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={n.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ) : null}
                  <div className="p-3 flex-1">
                    <span className="text-[10px] text-brand-dark font-bold">{n.sourceName}</span>
                    <h3 className="font-bold text-sm leading-relaxed text-ink line-clamp-3 mt-1">{n.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="px-6">
            <h2 className="text-xl font-bold mb-4 text-brand-dark border-r-4 border-accent pr-3">
              {cat === 'top' ? 'تازيون خبرون' : `${categoryName(cat)} خبرون`}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {grid.map((n) => <NewsCard key={n.id} item={n} />)}
            </div>
          </section>
        </>
      )}

      <section className="px-6 py-12 mt-6">
        <CitySelector />
      </section>
    </div>
  );
}
