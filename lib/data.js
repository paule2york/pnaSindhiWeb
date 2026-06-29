// Cities of Sindh (Sindhi labels)
export const CITIES = [
  { slug: 'karachi', name: 'ڊراچي' },
  { slug: 'hyderabad', name: 'حيدرآباد' },
  { slug: 'sukkur', name: 'سکر' },
  { slug: 'larkana', name: 'لاڊكاڽو' },
  { slug: 'mirpurkhas', name: 'ميرپورخاص' },
  { slug: 'nawabshah', name: 'نوابشاھ' },
  { slug: 'thatta', name: 'تڌو' },
  { slug: 'badin', name: 'بدين' },
  { slug: 'shikarpur', name: 'شكارپور' },
  { slug: 'jacobabad', name: 'جيكبآباد' }
];

// News categories (Sindhi labels)
export const CATEGORIES = [
  { slug: 'sindh', name: 'سنڌ', icon: '🏙️' },
  { slug: 'pakistan', name: 'پاڪستان', icon: '🏛️' },
  { slug: 'world', name: 'بين الاقوامي', icon: '🌍' },
  { slug: 'business', name: 'ڪاروبار', icon: '💼' },
  { slug: 'sports', name: 'رانديون', icon: '⚽' },
  { slug: 'health', name: 'صحت', icon: '🩺' },
  { slug: 'tech', name: 'ٽيڪنالاجي', icon: '💻' },
  { slug: 'entertainment', name: 'شوبز', icon: '🎬' },
  { slug: 'offbeat', name: 'دلچسپ ڽ عجيب', icon: '✨' }
];

export function cityName(slug) {
  return CITIES.find((c) => c.slug === slug)?.name || slug;
}
export function categoryName(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.name || slug;
}
