'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    setReady(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch (e) {}
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-sm bg-white/10 hover:bg-white/20 transition"
      aria-label="theme toggle"
    >
      <span className="text-lg">{ready && dark ? '☀️' : '🌙'}</span>
      <span>{ready && dark ? 'روشن موڊ' : 'اونداهو موڊ'}</span>
    </button>
  );
}
