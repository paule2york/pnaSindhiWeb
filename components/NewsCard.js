import Link from 'next/link';
import { encodeUrl } from '../lib/url';

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
  const href = !isLocal && item.link
    ? `/article?u=${item.id || encodeUrl(item.link)}&s=${encodeURIComponent(item.sourceName || '')}${isNative ? '&n=1' : ''}`
    : null;

  const badgeClass = isLocal
    ? 'bg-amber-100 text-amber-700'
    : isNative
      ? 'bg-ink text-white'
      : 'bg-brand-light text-brand-dark';

  const inner = (
    <article className="card-hover bg-white rounded-2xl overflow-hidden border border-gray-100 h-full flex flex-col">
      {item.image ? (
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt="" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        </div>
      ) : null}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${badgeClass}`}>
            {isLocal ? 'مقامي صحافي' : (item.sourceName || 'خبر')}
          </span>
          {item.pubDate ? <span className="text-[11px] text-gray-400">{fmt(item.pubDate)}</span> : null}
        </div>
        <h3 className="font-bold text-lg leading-relaxed text-ink mb-1 transition-colors group-hover:text-brand">{item.title}</h3>
        {item.description ? (
          <p className="text-sm text-gray-600 leading-loose line-clamp-3">{item.description}</p>
        ) : null}
        {href ? (
          <span className="inline-block mt-3 text-sm text-brand font-bold">
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
