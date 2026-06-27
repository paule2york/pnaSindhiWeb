'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CmsLogin() {
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    const res = await fetch('/api/cms/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push('/cms/dashboard');
    else setErr('غلط پاسورڊ');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-brand-dark mb-1">صحافي لاگ ان</h1>
        <p className="text-sm text-gray-500 mb-5">مقامي خبرون شائع ڪريو</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="پاسورڊ"
          className="w-full border rounded-xl px-4 py-2.5 mb-3 text-right"
        />
        {err ? <p className="text-red-600 text-sm mb-3">{err}</p> : null}
        <button className="w-full bg-brand text-white rounded-xl py-2.5 font-bold">لاگ ان</button>
      </form>
    </div>
  );
}
