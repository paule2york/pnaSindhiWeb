'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CmsLayout from '../../../../../components/CmsLayout';

export default function CmsPostEdit() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', body: '', image: '', city: '', category: 'local' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cms/posts/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.post) {
          setForm({
            title: d.post.title || '',
            body: d.post.body || '',
            image: d.post.image || '',
            city: d.post.city || '',
            category: d.post.category || 'local',
          });
        } else { setErr('خبر نه ملي'); }
        setLoading(false);
      })
      .catch(() => { setLoading(false); setErr('خبر نه ملي'); });
  }, [params.id]);

  const CITIES = [
    { slug: 'karachi', name: 'ڪراچي' }, { slug: 'hyderabad', name: 'حيدرآباد' },
    { slug: 'sukkur', name: 'سکر' }, { slug: 'larkana', name: 'لاڙڪاڻو' },
    { slug: 'mirpurkhas', name: 'ميرپورخاص' }, { slug: 'nawabshah', name: 'نوابشاھ' },
    { slug: 'thatta', name: 'ٺٽو' }, { slug: 'badin', name: 'بدين' },
    { slug: 'shikarpur', name: 'شڪارپور' }, { slug: 'jacobabad', name: 'جيڪبآباد' },
  ];

  const CATS = [
    { slug: 'local', name: 'مقامي' }, { slug: 'sindh', name: 'سنڌ' },
    { slug: 'pakistan', name: 'پاڪستان' }, { slug: 'world', name: 'دنيا' },
    { slug: 'business', name: 'ڪاروبار' }, { slug: 'sports', name: 'رانديون' },
    { slug: 'tech', name: 'ٽيڪ' }, { slug: 'entertainment', name: 'شوبز' },
  ];

  function up(k, v) { setForm({ ...form, [k]: v }); }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg(''); setErr('');
    const res = await fetch(`/api/cms/posts/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) { setMsg('محفوظ ٿي ويو ✅'); }
    else { const d = await res.json().catch(() => ({})); setErr(d.error || 'خرابي آئي'); }
  }

  if (loading) return <CmsLayout><div className="text-center py-10 text-gray-500">لڊي رهيو آهي...</div></CmsLayout>;

  return (
    <CmsLayout>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">خبر سنڌاريو</h1>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 space-y-4 max-w-2xl">
        <input value={form.title} onChange={(e) => up('title', e.target.value)} placeholder="عنوان *" className="w-full border rounded-xl px-4 py-2.5 text-right" required />
        <textarea value={form.body} onChange={(e) => up('body', e.target.value)} placeholder="خبر جو متن *" rows={10} className="w-full border rounded-xl px-4 py-2.5 text-right" required />
        <input value={form.image} onChange={(e) => up('image', e.target.value)} placeholder="تصوير جو لنڪ" className="w-full border rounded-xl px-4 py-2.5" dir="ltr" />

        <div className="grid grid-cols-2 gap-4">
          <select value={form.city} onChange={(e) => up('city', e.target.value)} className="border rounded-xl px-4 py-2.5">
            <option value="">شهر چونڊيو</option>
            {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={form.category} onChange={(e) => up('category', e.target.value)} className="border rounded-xl px-4 py-2.5">
            {CATS.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        {msg ? <p className="text-sm text-green-700 font-bold">{msg}</p> : null}
        {err ? <p className="text-sm text-red-600">{err}</p> : null}

        <div className="flex gap-3">
          <button disabled={busy} className="bg-brand text-white rounded-xl py-2.5 px-6 font-bold disabled:opacity-50">
            {busy ? 'رهيو...' : 'محفوظ ڪريو'}
          </button>
          <button type="button" onClick={() => router.back()} className="text-sm text-gray-600 hover:underline">
            منسوخ
          </button>
        </div>
      </form>
    </CmsLayout>
  );
}
