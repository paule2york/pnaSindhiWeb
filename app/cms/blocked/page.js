'use client';
import { useState, useEffect } from 'react';
import CmsLayout from '../../../components/CmsLayout';

export default function CmsBlocked() {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');

  async function loadBlocked() {
    setLoading(true);
    const res = await fetch('/api/cms/blocked');
    const d = await res.json();
    setBlocked(d.blocked || []);
    setLoading(false);
  }

  useEffect(() => { loadBlocked(); }, []);

  async function block(e) {
    e.preventDefault();
    setMsg('');
    if (!link.trim()) return;
    const res = await fetch('/api/cms/blocked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ link: link.trim(), title: title.trim() }),
    });
    const d = await res.json();
    if (d.ok) {
      setMsg('بلاڪ ڪيو ويو ✅');
      setLink('');
      setTitle('');
      loadBlocked();
    } else {
      setMsg(d.error || 'غلطي ٿي');
    }
  }

  async function unblock(id) {
    const res = await fetch(`/api/cms/blocked?id=${id}`, { method: 'DELETE' });
    if (res.ok) loadBlocked();
  }

  return (
    <CmsLayout>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">بلاڪ خبرون</h1>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="font-bold text-lg mb-3">نئين خبر بلاڪ ڪريو</h2>
        <form onSubmit={block} className="space-y-3">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="خبر جو لنڪ (URL)"
            className="w-full border rounded-xl px-4 py-2.5 text-right"
            dir="ltr"
            required
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان (اختياري)"
            className="w-full border rounded-xl px-4 py-2.5 text-right"
          />
          <button className="bg-red-600 text-white rounded-xl px-6 py-2 font-bold hover:bg-red-700">
            بلاڪ ڪريو
          </button>
          {msg ? <p className="text-sm mt-2">{msg}</p> : null}
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-bold text-lg mb-3">بلاڪ ڪيل خبرون</h2>
        {loading ? (
          <p className="text-gray-500">لوڊ ٿي رهيو آهي...</p>
        ) : blocked.length === 0 ? (
          <p className="text-gray-500">ڪا بلاڪ ڪيل خبر ناهي</p>
        ) : (
          <div className="space-y-3">
            {blocked.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b pb-2">
                <button
                  onClick={() => unblock(b.id)}
                  className="text-green-600 text-sm font-bold hover:underline"
                >
                  ان بلاڪ
                </button>
                <div className="text-right flex-1 ml-4">
                  <p className="text-sm font-bold">{b.title || '—'}</p>
                  <p className="text-xs text-gray-400 dir-ltr truncate">{b.link}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CmsLayout>
  );
}
