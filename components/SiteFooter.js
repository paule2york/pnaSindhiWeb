import Link from 'next/link';
import { CATEGORIES } from '../lib/data';

const SOCIAL = [
  { name: 'Facebook', href: '#', path: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 16.99 22 12z' },
  { name: 'X', href: '#', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { name: 'YouTube', href: '#', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  { name: 'Instagram', href: '#', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
  { name: 'WhatsApp', href: '#', path: 'M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.515 5.26l-.999 3.648 3.973-1.039zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z' },
];

function Social({ name, href, path }) {
  return (
    <a href={href} aria-label={name} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition">
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true"><path d={path} /></svg>
    </a>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="sm:col-span-2 lg:col-span-1">
          <span className="flex items-end gap-2 leading-none mb-4">
            <span className="text-3xl font-extrabold tracking-tight">PNA</span>
            <span className="bg-accent text-white text-base font-bold px-2 py-0.5 rounded">سنڌي</span>
          </span>
          <p className="text-white/60 text-sm leading-loose">سنڌ ڽ پاڪستان جون تازيون خبرون، سنڌيءَ ۾ — هڪ ئي جاءِ تي، تيز ڽ صاف.</p>
          <div className="flex gap-2.5 mt-5">
            {SOCIAL.map((s) => <Social key={s.name} {...s} />)}
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-accent">زمرا</h3>
          <ul className="space-y-2.5 text-sm text-white/70">
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link href={`/?cat=${c.slug}`} className="hover:text-white transition">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-accent">لنڪس</h3>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><Link href="/" className="hover:text-white transition">پهريون صفحو</Link></li>
            <li><Link href="/search" className="hover:text-white transition">ڳولا</Link></li>
            <li><Link href="/cms/login" className="hover:text-white transition">صحافي لاگ ان</Link></li>
            <li><a href="#" className="hover:text-white transition">اسان جي باري ھ</a></li>
            <li><a href="#" className="hover:text-white transition">رابطو</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-accent">پنا سنڌي بابت</h3>
          <p className="text-white/60 text-sm leading-loose">پنا سنڌي هڪ آزاد ڊجيٿل نيوز پليٿ فارم آهي، جيڪو پاڪستان جون خبرون سنڌيءَ ۾ آێي ٿو.</p>
          <p className="text-white/40 text-xs mt-4">راز داري پاليسي · استعمال جون شرطون</p>
        </div>
      </div>

      <div className="bg-accent text-white text-center text-xs py-3.5 px-4">
        © {year} پنا سنڌي — سڀ حق محفوظ آهن
      </div>
    </footer>
  );
}
