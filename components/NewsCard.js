export default function NewsCard({ item }) {
  return (
    <article className="card-hover bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${item.source === 'auto' ? 'bg-brand-light text-brand-dark' : 'bg-amber-100 text-amber-700'}`}>
          {item.source === 'auto' ? 'آٽو خبر' : 'مقامي صحافي'}
        </span>
        {item.pubDate ? <span className="text-[11px] text-gray-400">{new Date(item.pubDate).toLocaleDateString('en-GB')}</span> : null}
      </div>
      <h3 className="font-bold text-lg leading-relaxed text-ink mb-1">{item.title}</h3>
      {item.description ? <p className="text-sm text-gray-600 leading-loose">{item.description}</p> : null}
      {item.link ? (
        <a href={item.link} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm text-brand font-bold">مڪمل پڑهو ←</a>
      ) : null}
    </article>
  );
}
