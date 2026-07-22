'use client';
import { useState, useEffect } from 'react';
import CmsLayout from '../../../components/CmsLayout';

export default function CmsDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ posts: 0, myPosts: 0 });

  useEffect(() => {
    fetch('/api/cms/auth')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          // Load stats
          fetch('/api/cms/posts').then((r) => r.json()).then((d2) => {
            setStats((s) => ({ ...s, posts: (d2.posts || []).length }));
          });
          fetch('/api/cms/posts?mine=1').then((r) => r.json()).then((d2) => {
            setStats((s) => ({ ...s, myPosts: (d2.posts || []).length }));
          });
        }
      });
  }, []);

  return (
    <CmsLayout>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">ڊيش بورڊ</h1>

      {user && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <p className="text-lg font-bold">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-500 mt-1">ڪردار: <span className="font-bold text-brand-dark">{user.role}</span></p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-3xl font-bold text-brand-dark">{stats.posts}</p>
          <p className="text-sm text-gray-500">ڪل خبرون</p>
        </div>
        
        {user?.role !== 'admin' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-3xl font-bold text-brand-dark">{stats.myPosts}</p>
            <p className="text-sm text-gray-500">منهنجون خبرون</p>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <a href="/cms/posts/new" className="block bg-white rounded-2xl shadow p-6 hover:shadow-lg transition text-center">
          <p className="text-4xl mb-2">➕</p>
          <p className="font-bold text-brand-dark">نئی خبر لکو</p>
        </a>
        <a href="/cms/posts" className="block bg-white rounded-2xl shadow p-6 hover:shadow-lg transition text-center">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-bold text-brand-dark">خبرون منظم ڪريو</p>
        </a>
      </div>
    </CmsLayout>
  );
}
