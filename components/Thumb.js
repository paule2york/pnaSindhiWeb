'use client';
import { useState } from 'react';

const FALLBACK = '/placeholder.svg';

// Renders an image and automatically swaps to the branded placeholder if the
// real image is missing, broken, or blocked (so the homepage never shows a
// torn-image icon).
export default function Thumb({ src, alt = '', className = '' }) {
  const [url, setUrl] = useState(src || FALLBACK);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => { if (url !== FALLBACK) setUrl(FALLBACK); }}
    />
  );
}
