import { supabaseAdmin } from './supabase';

const TABLE = 'articles';

// Save fetched + translated items so news never disappears from the site.
export async function saveArticles(items, category = 'top') {
  const db = supabaseAdmin();
  if (!db || !items || !items.length) return;
  const rows = items.map((it) => {
    const t = new Date(it.pubDate || 0).getTime();
    const pub = !t || isNaN(t) ? new Date().toISOString() : new Date(t).toISOString();
    return {
      id: it.id,
      title: it.title || '',
      description: it.description || '',
      link: it.link || '',
      image: it.image || null,
      source_name: it.sourceName || '',
      source: it.source || 'auto',
      native: !!it.native,
      category: category || 'top',
      pub_date: pub,
    };
  });
  try {
    await db.from(TABLE).upsert(rows, { onConflict: 'id' });
  } catch (e) {}
}

// Read the accumulated news set, newest first.
export async function getStoredNews(category = 'top', limit = 20) {
  const db = supabaseAdmin();
  if (!db) return null;
  try {
    let q = db.from(TABLE).select('*').order('pub_date', { ascending: false }).limit(limit);
    if (category && category !== 'top') q = q.eq('category', category);
    const { data, error } = await q;
    if (error || !data) return null;
    return data.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      link: r.link,
      pubDate: r.pub_date,
      image: r.image,
      sourceName: r.source_name,
      source: r.source,
      native: r.native,
    }));
  } catch (e) {
    return null;
  }
}
