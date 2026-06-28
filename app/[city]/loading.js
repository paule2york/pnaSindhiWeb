import { NewsGridSkeleton } from '../../components/Skeletons';

export default function Loading() {
  return (
    <div className="pb-16">
      <div className="brand-gradient px-6 pt-8 pb-7">
        <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
        <div className="h-7 w-full max-w-lg bg-white/15 rounded-full mt-5 animate-pulse" />
      </div>
      <NewsGridSkeleton count={9} />
    </div>
  );
}
