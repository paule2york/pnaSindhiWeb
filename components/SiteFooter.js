import Link from 'next/link';
import { CATEGORIES } from '../lib/data';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-dark text-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <span className="flex flex-col items-start leading-none mb-3">
            <span className="text-2xl font-extrabold">PNA</span>
            <span className="bg-accent text-white text-lg font-bold px-2 rounded mt-1">سنڌي</span>
          </span>
          <p className="text-white/70 text-sm leading-relaxed">سنڌ ڽ پاڪستان جون تازيون خبرون، سنڌيءَ ۾ — هڪ ئي جاءِ تي.</p>
        </div>
        <div>
          <h3 className="font-bold mb-3">زمرا</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link href={`/?cat=${c.slug}`} className="hover:text-white">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">لنڪس</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/" className="hover:text-white">پهريون صفحو</Link></li>
            <li><Link href="/search" className="hover:text-white">ڳولا</Link></li>
            <li><Link href="/cms/login" className="hover:text-white">صحافي لاگ ان</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">سوشل ميڊيا</h3>
          <div className="flex gap-2 flex-wrap">
            {['Facebook', 'YouTube', 'Instagram', 'X'].map((s) => (
              <a key={s} href="#" className="text-xs bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5">{s}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-white/60 text-xs">
        © {year} پنا سنڌي — سڀ حق محفوظ آهن
      </div>
    </footer>
  );
}
