import Link from 'next/link';
import { Suspense } from 'react';
import { fetchFeedNews } from '../lib/rss';
import NewsCard from '../components/NewsCard';
import CitySelector from '../components/CitySelector';
import CategorySection from '../components/CategorySection';
import { SectionSkeleton } from '../components/Skeletons';
import { categoryName } from '../lib/data';

export const revalidate = 900;
export const maxDuration = 60;

const SECTION_SLUGS = ['politics', 'world', 'business', 'sports', 'tech', 'entertainment'];

function articleHref(item) {
  if (item.source === 'local' || !item.link) return '/';
  return `/article?u=${item.id}&s=${encodeURIComponent(item.sourceName || '')}${item.native ? '&n=1' : ''}`;
}

export default async function Home({ searchParams }) {
  const cat = searchParams?.cat || 'top';
  const news = await fetchFeedNews(cat, 40);

  if (!news.length) {
    return (
      <p className="px-6 py-20 text-center text-gray-500">هن وقت خبرون لوڈ نه ٹي سگهيون، مهرباني ڈري ٹوري دير ڈان پوءِ ڈوشش ڈريو.</p>
    );
  }

  const lead = news[0];
  const rightList = news.slice(1, 6);
  const leftList = news.slice(6, 11);
  const grid = news.slice(0, 30);
  const showSections = cat === 'top';

  return (
    <div className="pb-4 px-4 pt-5">
      <section className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1 order-2 lg:order-none">
          <h2 className="text-base font-bold text-accent border-b-2 border-accent pb-1 mb-3">فيچر</h2>
          <div className="divide-y divide-gray-200">
            {rightList.map((n) => (
              <Link key={n.id} href={articleHref(n)} className="flex items-center gap-3 py-3 group">
                {n.image ? (
                  <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={n.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ) : null}
                <h3 className="flex-1 text-[1.2rem] font-bold leading-snug text-ink line-clamp-2 group-hover:text-brand">{n.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-none">
          {lead ? (
            <Link href={articleHref(lead)} className="group block relative rounded-2xl overflow-hidden min-h-[340px]">
              {lead.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lead.image} alt="" className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 brand-gradient" />
              )}
              <div className="absolute inset-0 hero-overlay" />
              <div className="relative p-6 pt-56 text-white">
                <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full font-bold">ويب ڊيسڪ</span>
                <h2 className="text-2xl md:text-3xl font-bold mt-3 leading-relaxed line-clamp-3">{lead.title}</h2>
                {lead.description ? <p className="text-white/85 text-base mt-2 line-clamp-2">{lead.description}</p> : null}
              </div>
            </Link>
          ) : null}
        </div>

        <div className="lg:col-span-1 order-3 lg:order-none">
          <h2 className="text-base font-bold text-white bg-accent inline-flex items-center gap-1.5 px-2 py-1 rounded mb-3">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />لايي
          </h2>
          <div className="divide-y divide-gray-200">
            {leftList.map((n) => (
              <Link key={n.id} href={articleHref(n)} className="flex items-center gap-3 py-3 group">
                {n.image ? (
                  <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={n.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ) : null}
                <h3 className="flex-1 text-[1.2rem] font-bold leading-snug text-ink line-clamp-2 group-hover:text-brand">{n.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[2rem] font-bold mb-4 text-brand-dark border-r-4 border-accent pr-3">
          {cat === 'top' ? 'تازيون خبرون' : `${categoryName(cat)} خبرون`}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {grid.map((n) => <NewsCard key={n.id} item={n} />)}
        </div>
      </section>

      {showSections ? (
        <section className="mt-12">
          <h2 className="text-[2rem] font-bold mb-5 text-brand-dark border-r-4 border-accent pr-3">زمروار خبرون</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {SECTION_SLUGS.map((s) => (
              <Suspense key={s} fallback={<SectionSkeleton />}>
                {/* @ts-expect-error Async Server Component */}
                <CategorySection slug={s} />
              </Suspense>
            ))}
          </div>
        </section>
      ) : null}

      <section className="py-12 mt-6">
        <CitySelector />
      </section>
    </div>
  );
}
