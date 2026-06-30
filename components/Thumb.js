'use client';
import { useState } from 'react';

// Values that mean "no real image" -> show the branded logo placeholder.
const NO_IMAGE = ['', '/placeholder.svg', null, undefined];

// Renders an image and falls back to the brand logo on a soft background when
// the image is missing, broken, or blocked (so the homepage never shows a
// torn-image icon and the placeholder always uses the REAL logo).
export default function Thumb({ src, alt = '', className = '' }) {
  const [failed, setFailed] = useState(false);
  const useFallback = failed || NO_IMAGE.includes(src);

  if (useFallback) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" aria-hidden="true" className="w-1/3 max-w-[110px] opacity-90 select-none" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
