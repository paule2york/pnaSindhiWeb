'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES } from '../lib/data';

export default function VerticalMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const city = pathname?.split('/')[1] || '';

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-3 right-3 z-50 bg-brand text-white rounded-lg px-3 py-2"
        aria-label="menu"
      >☰</button>

      <aside
        className={`brand-gradient text-white w-60 shrink-0 p-5 fixed md:static h-full z-40 transition-transform ${open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
      >
        <Link href="/" className="block text-2xl font-bold mb-1">پنا سنڌي</Link>
        <p className="text-white/70 text-xs mb-6">سنڌي خبرون جو چينل</p>

        <nav className="space-y-1">
          {CATEGORIES.map((c) => {
            const href = city ? `/${city}/${c.slug}` : `/?cat=${c.slug}`;
            const active = pathname?.endsWith(`/${c.slug}`);
            return (
              <Link
                key={c.slug}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? 'bg-white text-brand-dark font-bold' : 'hover:bg-white/15'}`}
              >
                <span className="text-lg">{c.icon}</span>
                <span>{c.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-5 border-t border-white/20">
          <Link href="/cms/login" className="text-sm text-white/80 hover:text-white">✍️ صحافي لاگ ان</Link>
        </div>
      </aside>
    </>
  );
}
