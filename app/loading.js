import { NewsGridSkeleton } from '../components/Skeletons';

export default function Loading() {
  return (
    <div className="pb-16">
      <div className="brand-gradient px-6 pt-8 pb-7">
        <div className="h-8 w-40 bg-white/20 rounded animate-pulse" />
        <div className="h-4 w-64 bg-white/15 rounded mt-3 animate-pulse" />
      </div>
      <NewsGridSkeleton count={9} />
    </div>
  );
}
