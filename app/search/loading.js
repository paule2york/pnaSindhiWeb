import { NewsGridSkeleton } from '../../components/Skeletons';

export default function Loading() {
  return (
    <div className="pb-16">
      <div className="brand-gradient px-6 pt-8 pb-7">
        <div className="h-7 w-32 bg-white/20 rounded animate-pulse" />
        <div className="h-10 w-full max-w-md bg-white/15 rounded-xl mt-4 animate-pulse" />
      </div>
      <NewsGridSkeleton count={6} />
    </div>
  );
}
