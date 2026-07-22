'use client';
import { useState, useEffect } from 'react';
import CmsLayout from '../../../components/CmsLayout';

const CITIES = [
  { slug: 'karachi', name: 'ڪراچي' }, { slug: 'hyderabad', name: 'حيدرآباد' },
  { slug: 'sukkur', name: 'سکر' }, { slug: 'larkana', name: 'لاڙڪاڻو' },
  { slug: 'mirpurkhas', name: 'ميرپورخاص' }, { slug: 'nawabshah', name: 'نوابشاھ' },
  { slug: 'thatta', name: 'ٺٽو' }, { slug: 'badin', name: 'بدين' },
  { slug: 'shikarpur', name: 'شڪارپور' }, { slug: 'jacobabad', name: 'جيڪبآباد' },
];

export default function CmsUsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch('/api/cms/users')
      .then((r) => r.json())
      .then((d) => { setUsers(d.users || []); setLoading(false); });
  }

  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm('هن صحافي کي ختم ڪريو؟')) return;
    await fetch(`/api/cms/users/${id}`, { method: 'DELETE' });
    load();
  }

  const roleColor = (r) => {
    if (r === 'admin') return 'bg-red-100 text-red-700';
    if (r === 'editor') return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  const roleLabel = (r) => {
    if (r === 'admin') return 'ايڊمن';
    if (r === 'editor') return 'ايڊيٽر';
    return 'صحافي';
  };

  return (
    <CmsLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">صحافي</h1>
        <a href="/cms/users/new" className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-bold">+ نئون</a>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">لڊي رهيو آهي...</div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">{u.name}</h3>
                <p className="text-sm text-gray-500">{u.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${roleColor(u.role)}`}>
                    {roleLabel(u.role)}
                  </span>
                  {!u.is_active && <span className="text-xs text-red-600 font-bold">غير فعال</span>}
                  {u.allowed_cities?.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {u.allowed_cities.join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={`/cms/users/${u.id}/edit`} className="text-sm text-brand hover:underline">سنڌاريو</a>
                <button onClick={() => remove(u.id)} className="text-sm text-red-600 hover:underline">ختم</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CmsLayout>
  );
}
