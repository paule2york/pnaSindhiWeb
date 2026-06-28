'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CATEGORIES, CITIES } from '../lib/data';

function navClass(active) {
  return `shrink-0 whitespace-nowrap text-[2rem] px-3.5 py-2 rounded-full transition ${active ? 'bg-brand text-white font-bold' : 'text-ink hover:bg-brand-light hover:text-brand-dark'}`;
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
  const [logoOk, setLogoOk] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    setDark(document.documentElement.classList.contains('dark'));
    fetch('/api/headlines')
      .then((r) => r.json())
      .then((d) => setHeads(d.items || []))
      .catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
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
    <header className={`bg-white sticky top-0 z-40 border-b border-gray-200 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      <div className={`overflow-hidden transition-all duration-300 ${scrolled ? 'max-h-0 opacity-0' : 'max-h-48 opacity-100'}`}>
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-3">
          <div className="w-28 shrink-0">
            <button onClick={toggleTheme} aria-label="theme" className="text-2xl leading-none hover:opacity-70">{dark ? '☀️' : '🌙'}</button>
          </div>
          <Link href="/" className="shrink-0 flex items-center justify-center">
            {logoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/logo.png" alt="پنا سنڌي" onError={() => setLogoOk(false)} className="h-24 w-auto" />
            ) : (
              <span className="flex flex-col items-center leading-none">
                <span className="text-4xl font-extrabold tracking-tight text-ink">PNA</span>
                <span className="bg-accent text-white text-2xl font-bold px-3 rounded mt-1">سنڌي</span>
              </span>
            )}
          </Link>
          <div className="w-28 shrink-0 text-left text-accent text-xs leading-5">
            <div>{date}</div>
            <Link href="/" className="font-bold hover:underline">لايي خبرون</Link>
          </div>
        </div>
      </div>

      <div className={`bg-gray-50 border-gray-200 flex items-stretch overflow-hidden transition-all duration-300 ${scrolled ? 'max-h-0 opacity-0 border-0' : 'max-h-16 opacity-100 border-y'}`}>
        <span className="bg-accent text-white text-base font-bold px-4 flex items-center shrink-0">هيڊ لائنز</span>
        <div className="ticker-wrap flex-1 overflow-hidden">
          {tickerItems.length ? (
            <div className="ticker-track">
              {tickerItems.map((h, i) => (
                <Link key={i} href={h.href || '/'} className="text-[1.5rem] text-ink hover:text-brand">• {h.title}</Link>
              ))}
            </div>
          ) : (
            <div className="text-[1.5rem] text-ink px-4 py-2">پنا سنڌي — سنڌ ڍ پاڈستان جون تازيون خبرون سنڌيءَ ۚ</div>
          )}
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-2">
        <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar transition-all duration-300 ${scrolled ? 'py-2 justify-start' : 'py-3 justify-start lg:justify-center'}`}>
          <Link href="/" aria-label="home" className={`shrink-0 flex items-center overflow-hidden transition-all duration-300 ${scrolled ? 'w-auto opacity-100 ml-1' : 'w-0 opacity-0'}`}>
            {logoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/logo.png" alt="پنا سنڌي" onError={() => setLogoOk(false)} className="h-9 w-auto" />
            ) : (
              <span className="flex items-end gap-1 leading-none">
                <span className="text-lg font-extrabold text-ink">PNA</span>
                <span className="bg-accent text-white text-xs font-bold px-1.5 rounded">سنڌي</span>
              </span>
            )}
          </Link>
          <form onSubmit={submitSearch} className="relative shrink-0">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ڋوليو…" className="w-28 focus:w-44 transition-all rounded-full bg-gray-100 text-base px-4 py-2 outline-none" />
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
