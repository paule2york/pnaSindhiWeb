'use client';
import { useEffect, useState } from 'react';

// Sindh cities with coordinates for the free Open-Meteo API (no key needed).
const CITIES = [
  { slug: 'karachi', name: 'ڊراچي', lat: 24.86, lon: 67.01 },
  { slug: 'hyderabad', name: 'حيدرآباد', lat: 25.39, lon: 68.37 },
  { slug: 'sukkur', name: 'سڪر', lat: 27.70, lon: 68.86 },
  { slug: 'larkana', name: 'لاڑڪاڻو', lat: 27.56, lon: 68.21 },
  { slug: 'mirpurkhas', name: 'ميرپورخاص', lat: 25.53, lon: 69.01 },
  { slug: 'nawabshah', name: 'نوابشاھ', lat: 26.25, lon: 68.41 },
  { slug: 'thatta', name: 'ٺٽو', lat: 24.75, lon: 67.92 },
  { slug: 'badin', name: 'بدين', lat: 24.66, lon: 68.84 },
  { slug: 'shikarpur', name: 'شڪارپور', lat: 27.96, lon: 68.64 },
  { slug: 'jacobabad', name: 'جيڪب آباد', lat: 28.28, lon: 68.44 },
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
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code&timezone=Asia%2FKarachi`)
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
    <div className="flex items-center gap-1.5 bg-gray-100 rounded-full pl-2 pr-3 py-1.5 shrink-0">
      <span className="text-xl leading-none" aria-hidden="true">{icon(code)}</span>
      <span className="text-ink font-extrabold text-base leading-none">{temp == null ? '—' : `${temp}°`}</span>
      <select value={slug} onChange={onChange} aria-label="city" className="bg-transparent text-ink text-sm font-bold outline-none cursor-pointer max-w-[6.5rem]">
        {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
    </div>
  );
}
