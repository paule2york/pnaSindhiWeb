'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CATEGORIES, CITIES } from '../lib/data';

function navClass(active) {
  return `shrink-0 whitespace-nowrap text-sm px-3 py-1.5 rounded-full transition ${active ? 'bg-brand text-white font-bold' : 'text-ink hover:bg-brand-light hover:text-brand-dark'}`;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const seg = pathname?.split('/')[1] || '';
  const city = CITIES.some((c) => c.slug === seg) ? seg : '';
  const [date, setDate] = useState('');
  const [heads, setHeads] = useState([]);
  const [q, setQ] = useState('');
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    setDark(document.documentElement.classList.contains('dark'));
    fetch('/api/headlines')
      .then((r) => r.json())
      .then((d) => setHeads(d.items || []))
      .catch(() => {});
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    const v = q.trim();
    if (v) router.push(`/search?q=${encodeURIComponent(v)}`);
  }
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch (e) {}
  }

  const isCat = (slug) => pathname?.endsWith(`/${slug}`) || pathname?.includes(`cat=${slug}`);
  const tickerItems = heads.length ? heads.concat(heads) : [];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="w-24 shrink-0">
          <button onClick={toggleTheme} aria-label="theme" className="text-xl leading-none hover:opacity-70">{dark ? '☀️' : '🌙'}</button>
        </div>
        <Link href="/" className="flex flex-col items-center leading-none shrink-0">
          <span className="text-2xl font-extrabold tracking-tight text-ink">PNA</span>
          <span className="bg-accent text-white text-base font-bold px-2 rounded mt-1">سنڌي</span>
        </Link>
        <div className="w-24 shrink-0 text-left text-accent text-[11px] leading-4">
          <div>{date}</div>
          <Link href="/" className="font-bold hover:underline">لائيو خبرون</Link>
        </div>
      </div>

      <div className="bg-gray-50 border-y border-gray-200 flex items-stretch overflow-hidden">
        <span className="bg-accent text-white text-xs font-bold px-3 flex items-center shrink-0">هيڊ لائنز</span>
        <div className="ticker-wrap flex-1 overflow-hidden">
          {tickerItems.length ? (
            <div className="ticker-track">
              {tickerItems.map((h, i) => (
                <Link key={i} href={h.href || '/'} className="text-xs text-ink hover:text-brand">• {h.title}</Link>
              ))}
            </div>
          ) : (
            <div className="text-xs text-ink px-4 py-2">پنا سنڌي — سنڌ ڽ پاڪستان جون تازيون خبرون سنڌيءَ ۾</div>
          )}
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 justify-start lg:justify-center">
          <form onSubmit={submitSearch} className="relative shrink-0">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ڳوليو…" className="w-24 focus:w-40 transition-all rounded-full bg-gray-100 text-sm px-3 py-1.5 outline-none" />
          </form>
          <Link href="/" className={navClass(pathname === '/')}>پهريون صفحو</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={city ? `/${city}/${c.slug}` : `/?cat=${c.slug}`} className={navClass(isCat(c.slug))}>{c.name}</Link>
          ))}
          <Link href="/cms/login" className={navClass(false)}>✍️ صحافي</Link>
        </div>
      </nav>
    </header>
  );
}
