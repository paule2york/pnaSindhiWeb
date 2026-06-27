// Free Google Translate endpoint (no API key). Translates text to Sindhi (sd).
// Unofficial endpoint, rate-limited. Good enough for a free MVP.
export async function toSindhi(text, from = 'auto') {
  if (!text) return '';
  try {
    const url =
      'https://translate.googleapis.com/translate_a/single?client=gtx' +
      `&sl=${from}&tl=sd&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return text;
    const data = await res.json();
    return (data[0] || []).map((chunk) => chunk[0]).join('');
  } catch (e) {
    return text;
  }
}
