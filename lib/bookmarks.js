'use client';

const STORAGE_KEY = 'pna_bookmarks';

export function getBookmarks() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addBookmark(item) {
  if (typeof window === 'undefined') return;
  const list = getBookmarks();
  if (list.some((b) => b.id === item.id)) return; // already saved
  list.unshift({
    id: item.id,
    title: item.title,
    image: item.image || null,
    link: item.link,
    source: item.source || '',
    pubDate: item.pubDate || null,
    savedAt: Date.now(),
  });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

export function removeBookmark(id) {
  if (typeof window === 'undefined') return;
  const list = getBookmarks().filter((b) => b.id !== id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

export function isBookmarked(id) {
  return getBookmarks().some((b) => b.id === id);
}
