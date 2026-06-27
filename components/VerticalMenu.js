'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES } from '../lib/data';
import { SOURCES } from '../lib/rss';

export default function VerticalMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const city = pathname?.split('/')[1] || '';

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-3 right-3 z-50 bg-brand text-white rounded-lg px-3 py-2 shadow-lg"
        aria-label="menu"
      >☰</button>

      {open ? (
        <div onClick={() => setOpen(false)} className="md:hidden fixed inset-0 bg-black/40 z-30" />
      ) : null}

      <aside
        className={`bg-brand-dark text-white w-64 shrink-0 fixed md:sticky md:top-0 md:h-screen h-full z-40 overflow-y-auto transition-transform ${open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
      >
        <div className="p-5">
          <Link href="/" onClick={() => setOpen(false)} className="block">
            <span className="text-2xl font-bold">پنا سنڌي</span>
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <span className="live-dot" />
            <span className="text-white/70 text-xs">سنڌي خبرون جو لائيو چينل</span>
          </div>
        </div>

        <nav className="px-3 space-y-1">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${pathname === '/' ? 'bg-white text-brand-dark font-bold' : 'hover:bg-white/10'}`}
          >
            <span className="text-lg">⭐</span>
            <span>تازي ترين</span>
          </Link>
          {CATEGORIES.map((c) => {
            const href = city ? `/${city}/${c.slug}` : `/?cat=${c.slug}`;
            const active = pathname?.endsWith(`/${c.slug}`) || pathname?.includes(`cat=${c.slug}`);
            return (
              <Link
                key={c.slug}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? 'bg-white text-brand-dark font-bold' : 'hover:bg-white/10'}`}
              >
                <span className="text-lg">{c.icon}</span>
                <span>{c.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-5 mt-7">
          <p className="text-white/50 text-[11px] font-bold mb-3 tracking-wide">خبرن جا ذريعا</p>
          <div className="flex flex-wrap gap-1.5">
            {SOURCES.map((s) => (
              <span key={s} className="text-[10px] bg-white/10 rounded-full px-2 py-1 text-white/80">{s}</span>
            ))}
          </div>
        </div>

        <div className="px-5 mt-7 pb-8 pt-5 border-t border-white/15">
          <Link href="/cms/login" onClick={() => setOpen(false)} className="text-sm text-white/80 hover:text-white">✍️ صحافي لاگ ان</Link>
        </div>
      </aside>
    </>
  );
}
