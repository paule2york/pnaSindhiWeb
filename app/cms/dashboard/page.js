'use client';
import { useState } from 'react';
import { CITIES, CATEGORIES } from '../../../lib/data';

export default function Dashboard() {
  const [form, setForm] = useState({ title: '', body: '', city: 'karachi', category: 'local' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  function up(k, v) { setForm({ ...form, [k]: v }); }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) { setMsg('خبر ڪاميابي سان شائع تي وئي ✅'); setForm({ ...form, title: '', body: '' }); }
    else { const d = await res.json().catch(() => ({})); setMsg(d.error || 'خرابي آئي'); }
  }

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-brand-dark mb-6">خبر شائع ڪريو</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 space-y-4">
        <input value={form.title} onChange={(e) => up('title', e.target.value)} placeholder="عنوان" className="w-full border rounded-xl px-4 py-2.5" required />
        <textarea value={form.body} onChange={(e) => up('body', e.target.value)} placeholder="خبر جو متن" rows={7} className="w-full border rounded-xl px-4 py-2.5" required />
        <div className="grid grid-cols-2 gap-4">
          <select value={form.city} onChange={(e) => up('city', e.target.value)} className="border rounded-xl px-4 py-2.5">
            {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={form.category} onChange={(e) => up('category', e.target.value)} className="border rounded-xl px-4 py-2.5">
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        {msg ? <p className="text-sm text-brand-dark">{msg}</p> : null}
        <button disabled={busy} className="bg-brand text-white rounded-xl py-2.5 px-6 font-bold disabled:opacity-50">{busy ? '...' : 'شائع ڪريو'}</button>
      </form>
    </div>
  );
}
