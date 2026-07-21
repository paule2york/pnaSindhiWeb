'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBookmarks } from '../../lib/bookmarks';
import { articlePath } from '../../lib/url';

export default function BookmarksPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getBookmarks());
  }, []);

  function remove(id) {
    if (typeof window === 'undefined') return;
    const list = JSON.parse(localStorage.getItem('pna_bookmarks') || '[]').filter((b) => b.id !== id);
    localStorage.setItem('pna_bookmarks', JSON.stringify(list));
    setItems(list);
  }

  return (
    <div className="pb-32 px-4 pt-5">
      <h1 className="text-[2rem] font-bold mb-5 text-brand-dark border-r-4 border-accent pr-3">محفوظ خبرون</h1>

      {items.length === 0 ? (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center mt-8">
          <p className="text-xl font-bold text-amber-800 dark:text-amber-200">🌟 ڪا خبر محفوظ ناهي</p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">خبر تي بک مارڪ آئڪن دٻايو ۽ اها هتي محفوظ ٿي ويندي</p>
          <Link href="/" className="inline-block mt-5 bg-accent text-white font-bold px-6 py-2 rounded-full text-sm">خبرون ڏسو</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex">
              {item.image ? (
                <div className="w-28 h-28 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                </div>
              ) : null}
              <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                <Link href={articlePath({ link: item.link })} className="font-bold text-[1.2rem] leading-snug text-ink dark:text-gray-100 line-clamp-2 hover:text-brand">
                  {item.title}
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{item.source}</span>
                  <button onClick={() => remove(item.id)} className="text-xs text-red-500 font-bold hover:text-red-600">❌ هٽايو</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
