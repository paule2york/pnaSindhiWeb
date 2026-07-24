'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CmsLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/cms/auth')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.replace('/cms/login'); return; }
        setUser(d.user);
        setLoading(false);
      })
      .catch(() => { router.replace('/cms/login'); });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  async function logout() {
    await fetch('/api/cms/auth', { method: 'DELETE' });
    router.replace('/cms/login');
  }

  const navItems = [
    { href: '/cms/dashboard', label: 'ڊيش بورڊ' },
    { href: '/cms/posts', label: 'خبرون' },
    { href: '/cms/posts/new', label: 'نئی خبر', mobileLabel: '+' },
  ];

  navItems.push({ href: '/cms/blocked', label: 'بلاڪ', mobileLabel: '🚫' });

  if (user.role === 'admin') {
    navItems.push({ href: '/cms/users', label: 'صحافي' });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-lg font-bold text-brand-dark">پي اين اي</a>
          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">{user.role}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:inline">{user.name}</span>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">لاگ آئوٽ</button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-48 bg-white border-r hidden sm:block">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 hover:text-brand-dark border-b"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile nav */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex z-50">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex-1 py-3 text-center text-xs font-bold text-gray-600 hover:text-brand-dark"
            >
              {item.mobileLabel || item.label}
            </a>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 pb-20 sm:pb-6">{children}</main>
      </div>
    </div>
  );
}
