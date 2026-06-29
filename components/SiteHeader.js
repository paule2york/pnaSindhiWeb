'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CATEGORIES, CITIES } from '../lib/data';

function navClass(active) {
  return `shrink-0 whitespace-nowrap text-[1.55rem] font-semibold py-3 border-b-2 transition-colors duration-200 ${active ? 'text-brand font-extrabold border-brand' : 'text-ink hover:text-brand border-transparent'}`;
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
  const tickerBase = heads.length ? heads : [];
  let tickerUnit = tickerBase;
  while (tickerUnit.length > 0 && tickerUnit.length < 20) {
    tickerUnit = tickerUnit.concat(tickerBase);
  }

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
          {tickerUnit.length ? (
            <div className="ticker-track">
              <div className="ticker-group">
                {tickerUnit.map((h, i) => (
                  <Link key={`a${i}`} href={h.href || '/'} className="text-[1.5rem] text-ink hover:text-brand">• {h.title}</Link>
                ))}
              </div>
              <div className="ticker-group" aria-hidden="true">
                {tickerUnit.map((h, i) => (
                  <Link key={`b${i}`} href={h.href || '/'} className="text-[1.5rem] text-ink hover:text-brand">• {h.title}</Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[1.5rem] text-ink px-4 py-2">پنا سنڌي — سنڌ ۽ پاڪستان جون تازيون خبرون سنڌيءَ ۾</div>
          )}
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-4 border-t border-gray-100">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-1">
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
