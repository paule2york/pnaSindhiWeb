export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[16/9] bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-gray-200 rounded-full" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export function NewsGridSkeleton({ count = 6 }) {
  const items = Array.from({ length: count });
  return (
    <section className="px-6 py-7">
      <div className="h-6 w-40 bg-gray-200 rounded mb-5 animate-pulse" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </section>
  );
}

export function SectionSkeleton() {
  const lines = Array.from({ length: 3 });
  return (
    <div className="animate-pulse">
      <div className="h-6 w-28 bg-gray-200 rounded mb-3" />
      <div className="aspect-[16/9] bg-gray-200 rounded-xl mb-3" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="space-y-2 mt-3">
        {lines.map((_, i) => <div key={i} className="h-3 w-5/6 bg-gray-100 rounded" />)}
      </div>
    </div>
  );
}
