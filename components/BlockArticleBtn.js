'use client';
import { useState, useEffect } from 'react';

export default function BlockArticleBtn({ token, sourceUrl }) {
  const [user, setUser] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/cms/auth')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  if (!user) return null;

  async function handleBlock() {
    if (blocked) return;
    setLoading(true);
    const body = sourceUrl
      ? { link: sourceUrl }
      : { short_id: token };
    const res = await fetch('/api/cms/blocked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (d.ok) {
      setBlocked(true);
      setTimeout(() => { window.location.reload(); }, 600);
    }
    setLoading(false);
  }

  if (blocked) {
    return (
      <div className="text-center py-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 font-bold">
        🚫 هي خبر بلاڪ ٿي وئي
      </div>
    );
  }

  return (
    <div className="text-center py-3">
      <button
        onClick={handleBlock}
        disabled={loading}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50"
      >
        {loading ? 'بلاڪ ٿي رهيو آهي...' : '🚫 هي خبر بلاڪ ڪريو'}
      </button>
    </div>
  );
}
