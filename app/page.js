import Link from 'next/link';
import { Suspense } from 'react';
import { fetchFeedNews } from '../lib/rss';
import NewsCard from '../components/NewsCard';
import CitySelector from '../components/CitySelector';
import CategorySection from '../components/CategorySection';
import Thumb from '../components/Thumb';
import { SectionSkeleton } from '../components/Skeletons';
import { categoryName } from '../lib/data';
import { articlePath } from '../lib/url';

export const revalidate = 900;
export const maxDuration = 60;

const SECTION_SLUGS = ['sindh', 'pakistan', 'world', 'business', 'sports', 'health', 'entertainment'];

export default async function Home({ searchParams }) {
  const cat = searchParams?.cat || 'top';

  // For top page: load sindh + pakistan featured sections, plus lead hero
  if (cat === 'top') {
    const [leadNews, topNews, sindhNews, pakistanNews] = await Promise.all([
      fetchFeedNews('top', 1),
      fetchFeedNews('top', 10),
      fetchFeedNews('sindh', 10),
      fetchFeedNews('pakistan', 10),
    ]);

    // Deduplicate across sections so the same article never appears twice
    const seenIds = new Set();
    const dedup = (items) => (items || []).filter((n) => {
      if (!n || seenIds.has(n.id)) return false;
      seenIds.add(n.id);
      return true;
    });

    const lead = leadNews?.[0];
    if (lead && lead.id) seenIds.add(lead.id);
    // Latest news: exclude hero, show remaining top items
    const latestItems = dedup(topNews);
    const sindhItems = dedup(sindhNews);
    const pakistanItems = dedup(pakistanNews);

    return (
      <div className="pb-4 px-4 pt-5">
        {/* HERO SECTION */}
        {lead ? (
          <section className="mb-8">
            <Link href={articlePath(lead)} className="group block relative rounded-2xl overflow-hidden min-h-[340px]">
              <Thumb src={lead.image} className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 hero-overlay" />
              <div className="relative p-6 pt-56 text-white">
                <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full font-bold">فيچر خبر</span>
                <h2 className="text-2xl md:text-3xl font-bold mt-3 leading-relaxed line-clamp-3">{lead.title}</h2>
                {lead.description ? <p className="text-white/85 text-base mt-2 line-clamp-2">{lead.description}</p> : null}
              </div>
            </Link>
          </section>
        ) : null}

        {/* LATEST NEWS SECTION */}
        <section className="mb-8">
          <h2 className="text-[2rem] font-bold text-accent border-b-2 border-accent pb-1 mb-3">تازيون خبرون</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {latestItems.slice(0, 8).map((n) => (
              <Link key={n.id} href={articlePath(n)} className="group block w-64 shrink-0">
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 mb-2">
                  <Thumb src={n.image} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <h3 className="font-bold text-[1.2rem] leading-snug text-ink group-hover:text-brand line-clamp-2">{n.title}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured sidebar: right side on desktop, scrollable on mobile */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-accent border-b-2 border-accent pb-1 mb-3">فيچر خبرون</h2>
          <Suspense fallback={<div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
            <CategorySection slug="top" limit={5} layout="horizontal" excludeIds={seenIds} />
          </Suspense>
        </section>

        {/* CITY SECTION — user picks their city */}
        <section className="mb-10 bg-gradient-to-r from-brand/5 to-accent/5 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-brand-dark">پنهنجي شهر جي خبرون</h2>
          <CitySelector />
        </section>

        {/* SINDH SECTION */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[2rem] font-bold text-brand-dark border-r-4 border-accent pr-3">سنڌ خبرون</h2>
            <Link href="/?cat=sindh" className="text-sm text-accent font-bold hover:text-brand-dark">سڀ ڏسو →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sindhItems.slice(0, 6).map((n) => <NewsCard key={n.id} item={n} />)}
          </div>
        </section>

        {/* PAKISTAN SECTION */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[2rem] font-bold text-brand-dark border-r-4 border-accent pr-3">پاڪستان خبرون</h2>
            <Link href="/?cat=pakistan" className="text-sm text-accent font-bold hover:text-brand-dark">سڀ ڏسو →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pakistanItems.slice(0, 6).map((n) => <NewsCard key={n.id} item={n} />)}
          </div>
        </section>

        {/* OTHER CATEGORIES */}
        <section className="mt-8">
          <h2 className="text-[2rem] font-bold mb-5 text-brand-dark border-r-4 border-accent pr-3">ٻيا زمريا</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {SECTION_SLUGS.slice(2).map((s) => (
              <Suspense key={s} fallback={<SectionSkeleton />}>
                <CategorySection slug={s} />
              </Suspense>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // For non-top category pages (/?cat=sindh, etc.)
  const news = await fetchFeedNews(cat, 40);

  if (!news.length) {
    return (
      <p className="px-6 py-20 text-center text-gray-500 dark:text-gray-400">
        هن وقت خبرون لوڊ نه ٿي سگهيون، مهرباني ڪري ٿوري دير کان پوءِ ڪوشش ڪريو.
      </p>
    );
  }

  return (
    <div className="pb-4 px-4 pt-5">
      <h1 className="text-[2rem] font-bold mb-5 text-brand-dark border-r-4 border-accent pr-3">
        {categoryName(cat)} خبرون
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {news.map((n) => <NewsCard key={n.id} item={n} />)}
      </div>
    </div>
  );
}
