export default function Loading() {
  const lines = Array.from({ length: 8 });
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
      <div className="h-8 w-full bg-gray-200 rounded mb-2" />
      <div className="h-8 w-3/4 bg-gray-200 rounded mb-6" />
      <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-6" />
      <div className="space-y-3">
        {lines.map((_, i) => <div key={i} className="h-4 w-full bg-gray-100 rounded" />)}
      </div>
    </div>
  );
}
