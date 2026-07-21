import Link from 'next/link';
import { articlePath } from '../lib/url';
import Thumb from './Thumb';
import BookmarkBtn from './BookmarkBtn';

function fmt(d) {
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch (e) {
    return '';
  }
}

export default function NewsCard({ item }) {
  const isLocal = item.source === 'local';
  const isNative = item.native || item.source === 'sindhi';
  const path = articlePath(item);
  const href = path !== '/' ? path : null;

  const badgeClass = isLocal
    ? 'bg-amber-100 text-amber-700'
    : 'bg-brand-light text-brand-dark';

  const inner = (
    <article className="card-hover bg-white rounded-2xl overflow-hidden border border-gray-100 h-full flex flex-col relative">
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <BookmarkBtn item={item} />
        <Thumb src={item.image} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${badgeClass}`}>
            {isLocal ? 'مقامي صحافي' : 'ويب ڊيسڪ'}
          </span>
          {item.pubDate ? <span className="text-xs text-gray-400">{fmt(item.pubDate)}</span> : null}
        </div>
        <h3 className="font-bold text-[1.5rem] leading-snug text-ink mb-1 line-clamp-3 transition-colors group-hover:text-brand">{item.title}</h3>
        {item.description ? (
          <p className="text-[1.15rem] text-gray-600 leading-snug line-clamp-2 mt-2">{item.description}</p>
        ) : null}
        {href ? (
          <span className="inline-block mt-3 text-base text-brand font-bold">
            {isNative ? 'مڊمل پڑهو ←' : 'مڊمل پڑهو (ترجمو) ←'}
          </span>
        ) : null}
      </div>
    </article>
  );

  return href ? (
    <Link href={href} className="group block h-full">{inner}</Link>
  ) : inner;
}
