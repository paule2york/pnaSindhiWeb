'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CmsLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const res = await fetch('/api/cms/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (res.ok) router.push('/cms/dashboard');
    else { const d = await res.json().catch(() => ({})); setErr(d.error || 'غلط اي ميل يا پاسورڊ'); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-dark">سي ايم ايس</h1>
          <p className="text-sm text-gray-500 mt-1">پي اين اي سنڌي</p>
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="اي ميل"
          className="w-full border rounded-xl px-4 py-2.5 mb-3 text-right"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="پاسورڊ"
          className="w-full border rounded-xl px-4 py-2.5 mb-3 text-right"
          required
        />

        {err ? <p className="text-red-600 text-sm mb-3">{err}</p> : null}

        <button
          disabled={busy}
          className="w-full bg-brand text-white rounded-xl py-2.5 font-bold disabled:opacity-50"
        >
          {busy ? '...' : 'لاگ ان'}
        </button>
      </form>
    </div>
  );
}
