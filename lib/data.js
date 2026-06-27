// Cities of Sindh (Sindhi labels)
export const CITIES = [
  { slug: 'karachi', name: 'ڪراچي' },
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
  { slug: 'local', name: 'مقامي', icon: '🏙️' },
  { slug: 'politics', name: 'سياست', icon: '🏛️' },
  { slug: 'sports', name: 'راندت', icon: '⚽' },
  { slug: 'entertainment', name: 'تفريح', icon: '🎬' },
  { slug: 'business', name: 'ڪاروبار', icon: '💼' },
  { slug: 'tech', name: 'ٽيڪنالاجي', icon: '💻' },
  { slug: 'world', name: 'دنيا', icon: '🌍' }
];

export function cityName(slug) {
  return CITIES.find((c) => c.slug === slug)?.name || slug;
}
export function categoryName(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.name || slug;
}
