'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  {
    label: 'پهريون',
    href: '/',
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'زمريا',
    href: '/categories',
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'وڊيوز',
    href: '/videos',
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    label: 'محفوظ',
    href: '/bookmarks',
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'رابطو',
    href: '/contact',
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      dir="ltr"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1c1c1c] border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 pb-1">
        {ITEMS.map((it) => {
          const active = pathname === it.href || pathname?.startsWith(it.href + '/');
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1 rounded-lg transition ${
                active ? 'text-accent' : 'text-gray-500 dark:text-gray-400 hover:text-brand'
              }`}
            >
              {it.icon(active)}
              <span className={`text-[10px] leading-tight font-bold ${active ? 'text-accent' : ''}`}>
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
