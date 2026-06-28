'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBox({ initial = '' }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e) {
    e.preventDefault();
    const v = q.trim();
    if (v) router.push(`/search?q=${encodeURIComponent(v)}`);
  }

  return (
    <form onSubmit={submit} className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="خبر ڳوليو…"
        className="w-full rounded-xl bg-white/10 focus:bg-white/15 text-white placeholder-white/50 text-sm pr-9 pl-3 py-2.5 outline-none border border-white/15 focus:border-white/40 transition"
      />
      <button type="submit" aria-label="search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">🔍</button>
    </form>
  );
}
