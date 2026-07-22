'use client';
import { useState, useEffect } from 'react';
import CmsLayout from '../../../components/CmsLayout';

export default function CmsPostsList() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  function load() {
    setLoading(true);
    fetch('/api/cms/posts')
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts || []); setLoading(false); });
  }

  useEffect(() => {
    fetch('/api/cms/auth').then((r) => r.json()).then((d) => setUser(d.user));
    load();
  }, []);

  async function remove(id) {
    if (!confirm('خبر ختم ڪريو؟')) return;
    setDeleting(id);
    await fetch(`/api/cms/posts/${id}`, { method: 'DELETE' });
    setDeleting(null);
    load();
  }

  function fmt(d) {
    try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch (e) { return ''; }
  }

  const canEdit = (post) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'editor') return true;
    return post.author_id === user.id;
  };

  return (
    <CmsLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">خبرون</h1>
        <a href="/cms/posts/new" className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-bold">+ نئی</a>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">لڊي رهيو آهي...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">ڪا خبر ناهي</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 ml-4">
                <h3 className="font-bold text-gray-800 truncate">{post.title}</h3>
                <p className="text-xs text-gray-500">
                  {fmt(post.created_at)} — {post.city || 'سڀ'} / {post.category}
                  {post.author_id === user?.id ? <span className="text-brand ml-2">توهان جو</span> : null}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canEdit(post) && (
                  <>
                    <a
                      href={`/cms/posts/${post.id}/edit`}
                      className="text-sm text-brand hover:underline"
                    >
                      سنڌاريو
                    </a>
                    <button
                      onClick={() => remove(post.id)}
                      disabled={deleting === post.id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deleting === post.id ? '...' : 'ختم'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </CmsLayout>
  );
}
