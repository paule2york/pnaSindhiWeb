'use client';
import { useEffect, useState } from 'react';

// Sindh cities with coordinates for the free Open-Meteo API (no key needed).
const CITIES = [
  { slug: 'karachi', name: 'ڪراچي', lat: 24.86, lon: 67.01 },
  { slug: 'hyderabad', name: 'حيدرآباد', lat: 25.39, lon: 68.37 },
  { slug: 'dadu', name: 'دادو', lat: 26.73, lon: 67.78 },
  { slug: 'mehar', name: 'ميهڑ', lat: 27.18, lon: 67.82 },
  { slug: 'sukkur', name: 'سکر', lat: 27.70, lon: 68.86 },
  { slug: 'larkana', name: 'لاڑڪاڻو', lat: 27.56, lon: 68.21 },
  { slug: 'nawabshah', name: 'نوابشاهه', lat: 26.25, lon: 68.41 },
  { slug: 'mirpurkhas', name: 'ميرپورخاص', lat: 25.53, lon: 69.01 },
  { slug: 'khairpur', name: 'خيرپور', lat: 27.53, lon: 68.76 },
  { slug: 'thatta', name: 'ٺٽو', lat: 24.75, lon: 67.92 },
  { slug: 'badin', name: 'بدين', lat: 24.66, lon: 68.84 },
  { slug: 'shikarpur', name: 'شڪارپور', lat: 27.96, lon: 68.64 },
  { slug: 'jacobabad', name: 'جيڪب آباد', lat: 28.28, lon: 68.44 },
  { slug: 'sanghar', name: 'سانگهڑ', lat: 26.05, lon: 68.95 },
];

function icon(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}

export default function WeatherWidget() {
  const [slug, setSlug] = useState('karachi');
  const [temp, setTemp] = useState(null);
  const [code, setCode] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pna_city');
      if (saved && CITIES.some((c) => c.slug === saved)) setSlug(saved);
    } catch (e) {}
  }, []);

  useEffect(() => {
    const c = CITIES.find((x) => x.slug === slug) || CITIES[0];
    let active = true;
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lon + '&current=temperature_2m,weather_code&timezone=Asia%2FKarachi';
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!active || !d || !d.current) return;
        setTemp(Math.round(d.current.temperature_2m));
        setCode(d.current.weather_code);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [slug]);

  function onChange(e) {
    const v = e.target.value;
    setSlug(v);
    try { localStorage.setItem('pna_city', v); } catch (e2) {}
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/20 bg-white dark:bg-white/10 shadow-sm px-3 py-1.5 shrink-0">
      <span className="text-xl leading-none" aria-hidden="true">{icon(code)}</span>
      <span className="text-ink dark:text-white font-extrabold text-base leading-none tabular-nums">{temp == null ? '—' : `${temp}°`}</span>
      <span aria-hidden="true" className="w-px h-4 bg-gray-200 dark:bg-white/25" />
      <div className="relative flex items-center">
        <select value={slug} onChange={onChange} aria-label="city" className="appearance-none bg-transparent text-brand dark:text-white text-sm font-bold outline-none cursor-pointer pl-4 pr-0 max-w-[7rem] hover:text-brand-dark transition-colors">
          {CITIES.map((c) => <option key={c.slug} value={c.slug} className="text-ink">{c.name}</option>)}
        </select>
        <span aria-hidden="true" className="pointer-events-none absolute left-0 text-brand dark:text-white text-[0.55rem]">▼</span>
      </div>
    </div>
  );
}
