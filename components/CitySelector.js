'use client';
import { useRouter } from 'next/navigation';
import { CITIES } from '../lib/data';

export default function CitySelector() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-xl font-bold mb-4 text-brand-dark">پنهنجو شهر چونڊيو</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CITIES.map((c) => (
          <button
            key={c.slug}
            onClick={() => router.push(`/${c.slug}/local`)}
            className="card-hover bg-white border border-brand-light rounded-2xl py-4 font-bold text-ink hover:text-brand"
          >{c.name}</button>
        ))}
      </div>
    </div>
  );
}
