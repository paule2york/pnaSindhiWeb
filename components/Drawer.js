'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CATEGORIES } from '../lib/data';
import { SOURCES } from '../lib/rss';
import ThemeToggle from './ThemeToggle';

export default function Drawer({ open, onClose }) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Close on route change
  useEffect(() => { onClose(); }, [pathname]);

  function submitSearch(e) {
    e.preventDefault();
    const v = query.trim();
    if (!v) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(v)}`);
  }

  return (
    <>
      {/* Overlay */}
      {open ? (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50"
        />
      ) : null}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-white dark:bg-[#1c1c1c] border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 overflow-y-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="brand-gradient px-5 pt-6 pb-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="بند ڪريو">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <Link href="/" className="text-2xl font-bold">پي اين اي سنڌي</Link>
          </div>
          <form onSubmit={submitSearch} className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="خبر ڳوليو…"
              className="w-full rounded-xl border-0 bg-white/20 text-white placeholder-white/60 text-sm pr-10 pl-3 py-2 outline-none focus:bg-white/30 transition"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></svg>
            </button>
          </form>
        </div>

        {/* Home link */}
        <div className="px-3 mt-4">
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              pathname === '/'
                ? 'bg-accent/10 text-accent font-bold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span>تازي ترين خبرون</span>
          </Link>
        </div>

        {/* Categories */}
        <div className="px-3 mt-3">
          <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold px-3 mb-1 tracking-wide">زمريا</p>
          {CATEGORIES.map((c) => {
            const active = pathname?.endsWith(`/${c.slug}`) || pathname?.includes(`cat=${c.slug}`);
            return (
              <Link
                key={c.slug}
                href={c.slug === 'sindh' ? '/sindh' : `/?cat=${c.slug}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? 'bg-accent/10 text-accent font-bold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{c.icon}</span>
                <span>{c.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom links */}
        <div className="px-3 mt-6 pb-20">
          <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold px-3 mb-1 tracking-wide">رسائي</p>
          {[
            { href: '/bookmarks', label: '📑 محفوظ خبرون' },
            { href: '/videos', label: '🎥 وڊيوز' },
            { href: '/about', label: 'ℹ️ اسان بابت' },
            { href: '/contact', label: '📧 رابطو' },
            { href: '/cms/login', label: '✍️ صحافي لاگ ان' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >
              <span>{l.label}</span>
            </Link>
          ))}
          <div className="mt-5 px-3">
            <ThemeToggle />
          </div>

          <div className="mt-7 px-3">
            <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold mb-2 tracking-wide">ذريعا</p>
            <div className="flex flex-wrap gap-1.5">
              {SOURCES.map((s) => (
                <span key={s} className="text-[10px] bg-gray-100 dark:bg-white/10 rounded-full px-2 py-1 text-gray-500 dark:text-gray-400">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
