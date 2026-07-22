'use client';
import { useState, useEffect } from 'react';
import CmsLayout from '../../../../components/CmsLayout';

export default function CmsPostNew() {
  const [form, setForm] = useState({ title: '', body: '', image: '', city: '', category: 'local' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/cms/auth').then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  const CITIES = [
    { slug: 'karachi', name: 'ڪراچي' },
    { slug: 'hyderabad', name: 'حيدرآباد' },
    { slug: 'sukkur', name: 'سکر' },
    { slug: 'larkana', name: 'لاڙڪاڻو' },
    { slug: 'mirpurkhas', name: 'ميرپورخاص' },
    { slug: 'nawabshah', name: 'نوابشاھ' },
    { slug: 'thatta', name: 'ٺٽو' },
    { slug: 'badin', name: 'بدين' },
    { slug: 'shikarpur', name: 'شڪارپور' },
    { slug: 'jacobabad', name: 'جيڪبآباد' },
  ];

  const CATS = [
    { slug: 'local', name: 'مقامي' },
    { slug: 'sindh', name: 'سنڌ' },
    { slug: 'pakistan', name: 'پاڪستان' },
    { slug: 'world', name: 'دنيا' },
    { slug: 'business', name: 'ڪاروبار' },
    { slug: 'sports', name: 'رانديون' },
    { slug: 'tech', name: 'ٽيڪ' },
    { slug: 'entertainment', name: 'شوبز' },
  ];

  function up(k, v) { setForm({ ...form, [k]: v }); }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg(''); setErr('');
    const res = await fetch('/api/cms/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setMsg('خبر شائع ٿي وئي ✅');
      setForm({ title: '', body: '', image: '', city: '', category: 'local' });
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || 'خرابي آئي');
    }
  }

  const allowedCities = user?.allowed_cities || [];
  const cities = user?.role === 'journalist' && allowedCities.length
    ? CITIES.filter((c) => allowedCities.includes(c.slug))
    : CITIES;

  return (
    <CmsLayout>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">نئی خبر</h1>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 space-y-4 max-w-2xl">
        <input
          value={form.title}
          onChange={(e) => up('title', e.target.value)}
          placeholder="عنوان *"
          className="w-full border rounded-xl px-4 py-2.5 text-right"
          required
        />

        <textarea
          value={form.body}
          onChange={(e) => up('body', e.target.value)}
          placeholder="خبر جو متن *"
          rows={10}
          className="w-full border rounded-xl px-4 py-2.5 text-right"
          required
        />

        <input
          value={form.image}
          onChange={(e) => up('image', e.target.value)}
          placeholder="تصوير جو لنڪ (اختياري)"
          className="w-full border rounded-xl px-4 py-2.5"
          dir="ltr"
        />

        <div className="grid grid-cols-2 gap-4">
          <select value={form.city} onChange={(e) => up('city', e.target.value)} className="border rounded-xl px-4 py-2.5">
            <option value="">شهر چونڊيو *</option>
            {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>

          <select value={form.category} onChange={(e) => up('category', e.target.value)} className="border rounded-xl px-4 py-2.5">
            {CATS.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        {msg ? <p className="text-sm text-green-700 font-bold">{msg}</p> : null}
        {err ? <p className="text-sm text-red-600">{err}</p> : null}

        <button
          disabled={busy}
          className="bg-brand text-white rounded-xl py-2.5 px-6 font-bold disabled:opacity-50"
        >
          {busy ? 'رهيو...' : 'شائع ڪريو'}
        </button>
      </form>
    </CmsLayout>
  );
}
