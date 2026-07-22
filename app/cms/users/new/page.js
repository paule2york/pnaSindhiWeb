'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CmsLayout from '../../../../components/CmsLayout';

const CITIES = [
  { slug: 'karachi', name: 'ڪراچي' }, { slug: 'hyderabad', name: 'حيدرآباد' },
  { slug: 'sukkur', name: 'سکر' }, { slug: 'larkana', name: 'لاڙڪاڻو' },
  { slug: 'mirpurkhas', name: 'ميرپورخاص' }, { slug: 'nawabshah', name: 'نوابشاھ' },
  { slug: 'thatta', name: 'ٺٽو' }, { slug: 'badin', name: 'بدين' },
  { slug: 'shikarpur', name: 'شڪارپور' }, { slug: 'jacobabad', name: 'جيڪبآباد' },
];

export default function CmsUserNew() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'journalist', allowed_cities: [] });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  function up(k, v) { setForm({ ...form, [k]: v }); }

  function toggleCity(slug) {
    const current = form.allowed_cities;
    up('allowed_cities', current.includes(slug) ? current.filter((c) => c !== slug) : [...current, slug]);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg(''); setErr('');
    const res = await fetch('/api/cms/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setMsg('صحافي شامل ٿي ويو ✅');
      setTimeout(() => router.push('/cms/users'), 1000);
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || 'خرابي آئي');
    }
  }

  return (
    <CmsLayout>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">نئون صحافي</h1>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 space-y-4 max-w-lg">
        <input value={form.name} onChange={(e) => up('name', e.target.value)} placeholder="نالو *" className="w-full border rounded-xl px-4 py-2.5 text-right" required />
        <input type="email" value={form.email} onChange={(e) => up('email', e.target.value)} placeholder="اي ميل *" className="w-full border rounded-xl px-4 py-2.5" dir="ltr" required />
        <input type="password" value={form.password} onChange={(e) => up('password', e.target.value)} placeholder="پاسورڊ *" className="w-full border rounded-xl px-4 py-2.5" required minLength={6} />

        <select value={form.role} onChange={(e) => up('role', e.target.value)} className="border rounded-xl px-4 py-2.5 w-full">
          <option value="journalist">صحافي (مقامي خبرون)</option>
          <option value="editor">ايڊيٽر (سڀ خبرون)</option>
          <option value="admin">ايڊمن (مڪمل رسائي)</option>
        </select>

        {form.role === 'journalist' && (
          <div>
            <p className="text-sm text-gray-500 mb-2">شهر چونڊيو (گھڻا چونڊي سگهو ٿا):</p>
            <div className="grid grid-cols-2 gap-2">
              {CITIES.map((c) => (
                <label key={c.slug} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.allowed_cities.includes(c.slug)}
                    onChange={() => toggleCity(c.slug)}
                    className="w-4 h-4 text-brand"
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {msg ? <p className="text-sm text-green-700 font-bold">{msg}</p> : null}
        {err ? <p className="text-sm text-red-600">{err}</p> : null}

        <button disabled={busy} className="bg-brand text-white rounded-xl py-2.5 px-6 font-bold disabled:opacity-50">
          {busy ? 'رهيو...' : 'شامل ڪريو'}
        </button>
      </form>
    </CmsLayout>
  );
}
