import { XMLParser } from 'fast-xml-parser';
import { toSindhiMany, toSindhiRewrite } from './translate';
import { encodeUrl, shortId } from './url';
import { saveArticles, getStoredNews } from './store';
import { extractArticle } from './extract';
import { supabaseAdmin } from './supabase';

// Cache blocked short IDs (refreshed every 60s)
let _blockedCache = [];
let _blockedCacheTime = 0;

async function getBlockedIds() {
  if (Date.now() - _blockedCacheTime < 60000) return _blockedCache;
  try {
    const admin = supabaseAdmin();
    if (!admin) return _blockedCache;
    const { data } = await admin.from('cms_blocked').select('short_id').limit(1000);
    _blockedCache = (data || []).map((b) => b.short_id).filter(Boolean);
    _blockedCacheTime = Date.now();
  } catch (e) {}
  return _blockedCache;
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

// English / Urdu Pakistani sources (these get machine-translated to Sindhi).
const FEEDS = {
  top: [
    { url: 'https://www.dawn.com/feeds/home', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/home', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/1', source: 'Geo News' },
    { url: 'https://www.pakistantoday.com.pk/feed/', source: 'Pakistan Today' },
    { url: 'https://arynews.tv/feed/', source: 'ARY News' },
    { url: 'https://propakistani.pk/feed/', source: 'ProPakistani' },
    { url: 'https://www.urdupoint.com/en/sitemap/news.rss', source: 'UrduPoint' },
  ],
  sindh: [
    { url: 'https://www.dawn.com/feeds/pakistan', source: 'Dawn' },
    { url: 'https://www.geo.tv/rss/1/2', source: 'Geo News' },
    { url: 'https://arynews.tv/category/pakistan/sindh/feed/', source: 'ARY News' },
  ],
  pakistan: [
    { url: 'https://www.dawn.com/feeds/pakistan', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/pakistan', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/2', source: 'Geo News' },
    { url: 'https://arynews.tv/category/pakistan/feed/', source: 'ARY News' },
    { url: 'https://www.urdupoint.com/en/sitemap/news.rss', source: 'UrduPoint' },
  ],
  world: [
    { url: 'https://www.dawn.com/feeds/world', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/world', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/3', source: 'Geo News' },
  ],
  business: [
    { url: 'https://www.dawn.com/feeds/business', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/business', source: 'Express Tribune' },
    { url: 'https://www.brecorder.com/feeds/latest-news', source: 'Business Recorder' },
  ],
  sports: [
    { url: 'https://www.dawn.com/feeds/sport', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/sports', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/5', source: 'Geo News' },
  ],
  health: [
    { url: 'https://tribune.com.pk/feed/health', source: 'Express Tribune' },
    { url: 'https://arynews.tv/category/health/feed/', source: 'ARY News' },
    { url: 'https://www.dawn.com/feeds/sci-tech', source: 'Dawn' },
  ],
  tech: [
    { url: 'https://propakistani.pk/feed/', source: 'ProPakistani' },
    { url: 'https://tribune.com.pk/feed/technology', source: 'Express Tribune' },
    { url: 'https://www.techjuice.pk/feed/', source: 'TechJuice' },
  ],
  entertainment: [
    { url: 'https://tribune.com.pk/feed/life-style', source: 'Express Tribune' },
    { url: 'https://arynews.tv/category/showbiz/feed/', source: 'ARY News' },
    { url: 'https://www.geo.tv/rss/1/8', source: 'Geo News' },
  ],
  offbeat: [
    { url: 'https://tribune.com.pk/feed/life-style', source: 'Express Tribune' },
    { url: 'https://propakistani.pk/feed/', source: 'ProPakistani' },
    { url: 'https://arynews.tv/category/showbiz/feed/', source: 'ARY News' },
  ],
  local: [
    { url: 'https://www.dawn.com/feeds/pakistan', source: 'Dawn' },
    { url: 'https://www.geo.tv/rss/1/2', source: 'Geo News' },
  ],
  politics: [
    { url: 'https://www.dawn.com/feeds/pakistan', source: 'Dawn' },
    { url: 'https://tribune.com.pk/feed/pakistan', source: 'Express Tribune' },
    { url: 'https://www.geo.tv/rss/1/2', source: 'Geo News' },
  ],
};

// Native Sindhi-language sources (already in Sindhi -> NO translation needed).
const NATIVE_SINDHI_NEWS = [
  // Verified active RSS feeds (20 Jul 2026).
  // dailyibrat.com excluded: publishes Urdu alongside Sindhi and translation
  // was not reliably handling the Urdu-only items.
  { url: 'https://sindhexpress.com.pk/feed/', source: 'سنڌ ايڪسپريس' },
  { url: 'https://sindhtvnews.tv/feed/', source: 'سنڌ ٽي وي نيوز' },
  { url: 'https://ktnnews.tv/feed/', source: 'ڪي ٽي اين نيوز' },
  { url: 'https://sindhmatters.com/feed/', source: 'سنڌ ميٽرز' },
];

const SINDHI_FEEDS = {
  top: NATIVE_SINDHI_NEWS,
  sindh: NATIVE_SINDHI_NEWS,
  pakistan: NATIVE_SINDHI_NEWS,
  world: [],
  sports: [],
  entertainment: [],
  business: [],
  health: [],
  tech: [],
  offbeat: [],
  local: NATIVE_SINDHI_NEWS,
  politics: NATIVE_SINDHI_NEWS,
};

export const SOURCES = [
  'Dawn', 'Geo News', 'Express Tribune', 'ARY News',
  'Pakistan Today', 'Business Recorder', 'ProPakistani', 'UrduPoint',
  'سنڌ ايڪسپريس', 'سنڌ ٽي وي نيوز', 'ڪي ٽي اين نيوز', 'سنڌ ميٽرز',
];

function pickFeeds(category) {
  if (category && FEEDS[category]) return FEEDS[category];
  return FEEDS.top;
}
function pickSindhiFeeds(category) {
  if (category && SINDHI_FEEDS[category]) return SINDHI_FEEDS[category];
  return SINDHI_FEEDS.top || [];
}

function textOf(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object' && '#text' in v) return String(v['#text']);
  return '';
}

function getLink(it) {
  if (typeof it.link === 'string') return it.link;
  if (Array.isArray(it.link)) {
    const alt = it.link.find((l) => l && l['@_rel'] === 'alternate') || it.link[0];
    return (alt && (alt['@_href'] || textOf(alt))) || '';
  }
  if (it.link && typeof it.link === 'object') return it.link['@_href'] || textOf(it.link) || '';
  return textOf(it.guid) || '';
}

function getImage(it) {
  const enc = (it.enclosure && it.enclosure['@_url']) || (Array.isArray(it.enclosure) ? it.enclosure[0] && it.enclosure[0]['@_url'] : null);
  const mediaC = (it['media:content'] && it['media:content']['@_url']) || (Array.isArray(it['media:content']) ? it['media:content'][0] && it['media:content'][0]['@_url'] : null);
  const thumb = (it['media:thumbnail'] && it['media:thumbnail']['@_url']) || (Array.isArray(it['media:thumbnail']) ? it['media:thumbnail'][0] && it['media:thumbnail'][0]['@_url'] : null);
  let img = enc || mediaC || thumb || null;
  if (!img) {
    const html = textOf(it['content:encoded']) + ' ' + textOf(it.description) + ' ' + textOf(it.content);
    const m = html.match(/<img[^>]+src=[\x22\x27]([^\x22\x27]+)[\x22\x27]/i);
    if (m) img = m[1];
  }
  return img;
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '\x22')
    .replace(/&#0?39;/gi, '\x27')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 260);
}

async function collectFeeds(feeds, perFeed) {
  const out = [];
  await Promise.all(
    (feeds || []).map(async ({ url, source }) => {
      try {
        const res = await fetch(url, {
          next: { revalidate: 900 },
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PnaSindhi/1.0)' },
        });
        if (!res.ok) return;
        const xml = await res.text();
        const json = parser.parse(xml);
        const raw = (json && json.rss && json.rss.channel && json.rss.channel.item) || (json && json.feed && json.feed.entry) || [];
        const arr = Array.isArray(raw) ? raw : [raw];
        for (const it of arr.slice(0, perFeed)) {
          const link = getLink(it);
          const title = textOf(it.title);
          if (!link || !title) continue;
          // Strip source-brand prefix from description (e.g. UrduPoint puts
          // "UrduPoint/UrduPoint / Pakistan Point News-July 21st, 2026" as a
          // prefix in the article page description).
          let desc = stripHtml(textOf(it.description) || textOf(it['content:encoded']) || textOf(it.summary));
          // Remove leading source-name prefix patterns like "UrduPoint:", "UrduPoint/UrduPoint /", etc.
          desc = desc.replace(/^[A-Za-z\s]+[:–-]\s*/, "").trim();
          out.push({
            rawTitle: title,
            rawDescription: desc,
            link,
            pubDate: it.pubDate || it.published || it.updated || it['dc:date'] || '',
            image: getImage(it),
            sourceName: source,
          });
        }
      } catch (e) {}
    })
  );
  return out;
}

// Sindh province filter: city/district/province names in English, Urdu and Sindhi.
// Used for the 'sindh' category so only Sindh-related news appears there.
const SINDH_KEYWORDS = [
  // English city/province names
  'sindh', 'karachi', 'hyderabad', 'sukkur', 'larkana', 'nawabshah', 'mirpurkhas',
  'mirpur khas', 'khairpur', 'thatta', 'badin', 'shikarpur', 'jacobabad', 'sanghar',
  'dadu', 'ghotki', 'umerkot', 'tharparkar', 'thar ', 'mithi', 'kashmore', 'matiari',
  'jamshoro', 'sehwan', 'qambar', 'shahdadkot', 'kotri', 'tando allahyar', 'tando adam',
  'tando muhammad khan', 'naushahro', 'mehar', 'sujawal', 'keamari', 'malir', 'lyari',
  'indus', 'mohenjo', 'kotdiji', 'gorakh', 'keenjhar', 'manchar', 'raneela', 'sajawal',
  'sukkar', 'lashari', 'gambat', 'jati', 'sakrand', 'shahdadpur', 'sita', 'khipro',
  'nawabshah', 'shahpur', 'chak', 'pesi',
  // Urdu city/province names (for UrduPoint and other Urdu-medium feeds)
  'سندھ', 'کراچی', 'حیدرآباد', 'سکھر', 'لاڑکانہ', 'نوابشاہ', 'میرپور',
  'خیرپور', 'ٹھٹہ', 'بدین', 'شکارپور', 'جیکب آباد', 'سانگھڑ', 'دادو',
  'گھوٹکی', 'عمرکوٹ', 'تھرپارکر', 'تھر', 'مٹھی', 'کشمور', 'مٹیاری',
  'جامشورو', 'سیہون', 'قمبر', 'شہدادکوٹ', 'کوٹری', 'ٹنڈو',
  // Sindhi city/province names
  'سنڌ', 'ڪراچي', 'حيدرآباد', 'سڪر', 'لاڑڪاڻو', 'لاڑڪانو', 'نوابشاهه', 'نوابشاه',
  'ميرپورخاص', 'ميرپور خاص', 'خيرپور', 'ٺٺو', 'بدين', 'شڪارپور', 'جيڪب آباد',
  'جيڪبآباد', 'سانگهڑ', 'ساڱر', 'دادو', 'گهوٽڪي', 'عمرڪوٽ', 'ٿرپارڪر', 'مٺي',
  'ڪشمور', 'مٽياري', 'ڄامشورو', 'جامشورو', 'سيوهن', 'قمبر', 'شهدادڪوٽ', 'ڪوٽري',
  'ٽنڊو', 'لياري', 'ملير', 'سنڌودير', 'مهراڻ', 'موئن جو دڙو', 'منڇر', 'ڪينجهر',
  // Provincial government / institutions only possible in Sindh context
  'cm sindh', 'sindh government', 'sindh assembly', 'sindh police', 'sindh high court',
  'shc ', 'karachi port', 'kpt ', 'kda ', 'dha karachi', 'clifton', 'gulshan', 'gulistan',
  'korangi', 'landhi', 'nazimabad', 'north nazimabad', 'saddar', 'tariq road', 'shahrah',
  'mauripur', 'hawksbay', 'sea view', 'defence karachi', 'bahadurabad', 'pechs', 'f b area',
  'orangi', 'sachal', 'malir cantt', 'steel mill', 'situated in sindh', 'sindh ', 'university of karachi',
  // Negative keywords — items matching these are excluded even if a sindh keyword matches.
  // Helps discard punjab / KP / balochistan items where the sindh keyword is coincidental.
];

// Items matching any of these exclusion keywords are NOT Sindh-related.
const SINDH_EXCLUDE = [
  'punjab', 'punjabi', 'lahore', 'islamabad', 'rawalpindi', 'peshawar', 'kpk', 'khyber',
  'khyber pakhtunkhwa', 'balochistan', 'quetta', 'faisalabad', 'multan', 'gujranwala',
  'gujrat', 'sialkot', 'murree', 'gilgit',
  'پنجاب', 'لاہور', 'اسلام آباد', 'پشاور', 'خیبر', 'بلوچستان', 'کوئٹہ',
  'پنجاب', 'لاهور', 'اسلاماباد', 'پشاور', 'خيبر', 'بلوچستان', 'ڪوئٽه',
];

function isSindhRelated(it) {
  // Check editorial text only. Never inspect the URL/domain: native source
  // domains such as sindhtvnews.tv and sindhmatters.com contain "sindh", which
  // would otherwise make every world/Pakistan story look Sindh-related.
  const hay = (
    String(it.rawTitle || '') + ' ' + String(it.rawDescription || '')
  ).toLowerCase();
  // Must match at least one positive Sindh keyword.
  if (!SINDH_KEYWORDS.some((k) => hay.includes(k.toLowerCase()))) return false;
  // Must NOT match any exclusion keyword (prevents cross-province spillage).
  if (SINDH_EXCLUDE.some((k) => hay.includes(k.toLowerCase()))) return false;
  return true;
}

export async function fetchFeedNews(category, limit = 12) {
  const enFeeds = pickFeeds(category);
  const sdFeeds = pickSindhiFeeds(category);
  // For 'sindh' most general-feed items get filtered out, so fetch extra per feed.
  const enMult = category === 'sindh' ? 4 : 1.4;
  const perEn = Math.max(4, Math.ceil((limit * enMult) / Math.max(1, enFeeds.length)));
  const perSd = Math.max(4, Math.ceil((limit * 1.0) / Math.max(1, sdFeeds.length || 1)));

  const [enItems, sdItems] = await Promise.all([
    collectFeeds(enFeeds, perEn),
    collectFeeds(sdFeeds, perSd),
  ]);
  enItems.forEach((it) => { it.native = false; });
  sdItems.forEach((it) => { it.native = true; });

  let all = [...sdItems, ...enItems];
  // Strict Sindh category: EVERY item must explicitly mention Sindh, a Sindh
  // city/district, or a Sindh-only institution. A Sindhi-language publication
  // can also carry world/Pakistan news, so native feeds do not bypass this check.
  if (category === 'sindh') {
    all = all.filter(isSindhRelated);
  }
  all.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));

  // Filter out blocked articles
  const blockedIds = await getBlockedIds();
  const blockedSet = new Set(blockedIds);

  const seen = new Set();
  const unique = [];
  for (const it of all) {
    if (!it.link || seen.has(it.link)) continue;
    // Skip blocked articles
    const id = shortId(it.link);
    if (blockedSet.has(id)) continue;
    seen.add(it.link);
    unique.push(it);
    if (unique.length >= limit) break;
  }

  // RSS feeds often omit the thumbnail even when the article page has one.
  // Fill missing images from the article's og:image so cards only fall back
  // to the default placeholder when the source truly has no image.
  // Some sources (e.g. UrduPoint) serve their own logo as og:image instead
  // of a real news photo — skip extraction for those.
  const LOGO_OG_SOURCES = ['UrduPoint'];
  const missingImg = unique.filter((it) => !it.image && !LOGO_OG_SOURCES.includes(it.sourceName));
  if (missingImg.length) {
    await Promise.all(
      missingImg.map(async (it) => {
        try {
          const data = await extractArticle(it.link);
          if (data && data.image) it.image = data.image;
        } catch (e) {}
      })
    );
  }

  // Native publications sometimes return Urdu text in their RSS feed. Detect
  // real Sindhi script: rewrite Sindhi, but translate Urdu to Sindhi. This also
  // prevents Urdu leaking onto cards when a source is marked native.
  const hasSindhiLetters = (text) => /[ٻڀٿٺٽپڄڃڇڌڏڊڍڙڦڪڳڱڻ]/.test(String(text || ''));
  const nativeSindhi = unique.filter((it) => it.native && hasSindhiLetters(it.rawTitle + ' ' + it.rawDescription));
  const nativeUrdu = unique.filter((it) => it.native && !hasSindhiLetters(it.rawTitle + ' ' + it.rawDescription));

  if (nativeSindhi.length) {
    const rewritesT = await Promise.all(nativeSindhi.map((it) => toSindhiRewrite(it.rawTitle)));
    const rewritesD = await Promise.all(nativeSindhi.map((it) => toSindhiRewrite(it.rawDescription)));
    nativeSindhi.forEach((it, i) => {
      it.rawTitle = rewritesT[i] || it.rawTitle;
      it.rawDescription = rewritesD[i] || it.rawDescription;
    });
  }

  // Translate English/Urdu items, including Urdu text from native publications.
  const toTranslate = unique.filter((it) => !it.native || nativeUrdu.includes(it));
  const titles = await toSindhiMany(toTranslate.map((it) => it.rawTitle));
  const descs = await toSindhiMany(toTranslate.map((it) => it.rawDescription));

  let ti = 0;
  const result = unique.map((it) => {
    let title;
    let description;
    const needsTranslation = !it.native || nativeUrdu.includes(it);
    if (!needsTranslation) {
      title = it.rawTitle;
      description = it.rawDescription;
    } else {
      title = titles[ti] || it.rawTitle;
      description = descs[ti] || it.rawDescription;
      ti++;
    }
    return {
      id: shortId(it.link),
      title,
      description,
      link: it.link,
      pubDate: it.pubDate,
      image: it.image || '/placeholder.svg',
      sourceName: it.sourceName,
      source: it.native ? 'sindhi' : 'auto',
      native: it.native,
    };
  });

  // Persist so news never disappears. Read back the accumulated set ONLY for the
  // homepage ('top'); category pages always return their own fresh, correctly
  // categorized news so categories never get mixed up.
  await saveArticles(result, category || 'top');
  if ((category || 'top') === 'top') {
    const stored = await getStoredNews('top', limit);
    if (stored && stored.length) {
      // Also filter stored results against the blocked list
      return stored.filter((n) => !blockedSet.has(n.id)).slice(0, limit);
    }
  }
  return result;
}
