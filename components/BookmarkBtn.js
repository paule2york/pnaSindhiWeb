'use client';
import { useState, useEffect } from 'react';
import { isBookmarked, addBookmark, removeBookmark } from '../lib/bookmarks';

export default function BookmarkBtn({ item }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(item.id));
  }, [item.id]);

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeBookmark(item.id);
      setSaved(false);
    } else {
      addBookmark(item);
      setSaved(true);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'هٽايو' : 'محفوظ ڪريو'}
      className={`absolute top-2 left-2 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition ${
        saved ? 'bg-accent text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
