'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const YT_CHANNELS = [
  { name: 'DW Urdu', id: 'UCXazgXDIYyWHvEC9VcGt-Og' },
  { name: 'BBC Urdu', id: 'UCs7f3tN3W5-2PvM0wI_PzJw' },
  { name: 'Voice of America Urdu', id: 'UC1l1V1G6FPJ5E8V0h3z6ZyA' },
  { name: 'GEO News', id: 'UCKzJg3t0c1eG1n0Y6i1i6eQ' },
  { name: 'ARY News', id: 'UC1l1V1G6FPJ5E8V0h3z6ZyA' },
  { name: 'Samaa TV', id: 'UCk0gEKLFmR9nS9wV0c7bXpA' },
  { name: 'Express News', id: 'UC1sL0M0hqS5F7s0s1s7s0sA' },
  { name: 'Dunya News', id: 'UCHsY0y7v2sF7s0s1s7s0sA' },
];

export default function VideosPage() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Try fetching from RSS feeds via api
    fetch('/api/videos')
      .then(r => r.json())
      .then(d => { if(d?.items) setFeed(d.items); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-32 px-4 pt-5">
      <h1 className="text-[2rem] font-bold mb-5 text-brand-dark border-r-4 border-accent pr-3">وڊيوز</h1>

      <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
        سنڌي ۽ اردو ۾ وڊيو خبرون جلد اچي رهيون آهن.
      </p>

      {/* YouTube channels grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {YT_CHANNELS.map((ch) => (
          <a
            key={ch.id}
            href={`https://www.youtube.com/channel/${ch.id}`}
            target="_blank"
            rel="noreferrer"
            className="bg-white dark:bg-[#1c1c1c] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 text-center hover:shadow-md transition card-hover"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-red-600 flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </div>
            <h3 className="font-bold text-sm text-ink dark:text-gray-100">{ch.name}</h3>
            <span className="text-xs text-gray-400 mt-1 inline-block">YouTube</span>
          </a>
        ))}
      </div>
    </div>
  );
}
