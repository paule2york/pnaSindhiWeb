'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CATEGORIES, CITIES } from '../lib/data';

const DEFAULT_HEADS = [
  { title: 'پنا سنڌي — سنڌ ۽ پاڪستان جون تازيون خبرون', href: '/' },
  { title: 'تازيون خبرون لاء وزيٹ ڪريو', href: '/' },
];

function navClass(active) {
  return `shrink-0 whitespace-nowrap text-[0.95rem] sm:text-base md:text-xl lg:text-[1.5rem] font-semibold py-3 border-b-2 transition-colors duration-200 ${active ? 'text-brand font-extrabold border-brand' : 'text-ink hover:text-brand border-transparent'}`;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const seg = pathname?.split('/')[1] || '';
  const city = CITIES.some((c) => c.slug === seg) ? seg : '';
  const [date, setDate] = useState('');
  const [heads, setHeads] = useState([]);
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
    let locked = false;
    let lockTimer;
    let collapsed = false;
    const onScroll = () => {
      if (locked) return;
      const y = window.scrollY;
      const next = collapsed ? y > 40 : y > 120;
      if (next !== collapsed) {
        collapsed = next;
        setScrolled(next);
        locked = true;
        clearTimeout(lockTimer);
        lockTimer = setTimeout(() => { locked = false; }, 450);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(lockTimer); };
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch (e) {}
  }

  const isCat = (slug) => pathname?.endsWith(`/${slug}`) || pathname?.includes(`cat=${slug}`);
  const tickerBase = heads.length ? heads : DEFAULT_HEADS;
  let tickerUnit = tickerBase;
  while (tickerUnit.length > 0 && tickerUnit.length < 24) {
    tickerUnit = tickerUnit.concat(tickerBase);
  }

  const renderItems = (prefix) =>
    tickerUnit.map((h, i) => (
      <span key={`${prefix}${i}`} className="inline-flex items-center">
        <Link href={h.href || '/'} className="text-[1.5rem] text-white hover:text-white/75 font-semibold">{h.title}</Link>
        {logoOk ? (
          <span className="mx-4 inline-flex items-center bg-white rounded px-1.5 py-0.5 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" aria-hidden="true" className="h-5 w-auto" />
          </span>
        ) : (
          <span aria-hidden="true" className="text-white text-lg mx-4">◆</span>
        )}
      </span>
    ));

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

      <div style= backgroundColor: '#c8102e'  className={`flex items-stretch overflow-hidden transition-all duration-300 ${scrolled ? 'max-h-0 opacity-0' : 'max-h-16 opacity-100'}`}>
        <span style= backgroundColor: '#8f0a20'  className="text-white text-base font-bold px-4 flex items-center gap-2 shrink-0"><span className="live-dot-white" /><span>هيڊ لائنز</span></span>
        <div className="ticker-wrap flex-1 overflow-hidden">
          <div className="ticker-track">
            <div className="ticker-group">{renderItems('a')}</div>
            <div className="ticker-group" aria-hidden="true">{renderItems('b')}</div>
          </div>
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-4 border-t border-gray-100">
        <div className="flex flex-nowrap items-center justify-center gap-x-2 sm:gap-x-3 md:gap-x-5 py-1 overflow-x-auto no-scrollbar">
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
          <Link href="/" className={navClass(pathname === '/')}>پهريون صفحو</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={city ? `/${city}/${c.slug}` : `/?cat=${c.slug}`} className={navClass(isCat(c.slug))}>{c.name}</Link>
          ))}
          <Link href="/cms/login" className={navClass(false)}>صحافي پورٽل</Link>
        </div>
      </nav>
    </header>
  );
}
