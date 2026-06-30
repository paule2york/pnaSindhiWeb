export const revalidate = 3600;

const HIJRI_MONTHS = ['محرم', 'صفر', 'ربيع الاول', 'ربيع الثاني', 'جمادى الاول', 'جمادى الثاني', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];

function monthIndex(name) {
  const n = String(name || '').toLowerCase().replace(/[^a-z]/g, '');
  if (n.includes('muharram') || n.includes('moharram')) return 1;
  if (n.includes('safar')) return 2;
  if (n.includes('rabi')) return (n.includes('thani') || n.includes('akhir') || n.includes('sani') || n.includes('second')) ? 4 : 3;
  if (n.includes('jumad') || n.includes('jamad')) return (n.includes('thani') || n.includes('akhir') || n.includes('sani') || n.includes('second')) ? 6 : 5;
  if (n.includes('rajab')) return 7;
  if (n.includes('shaban') || n.includes('shabaan') || n.includes('shaaban')) return 8;
  if (n.includes('ramadan') || n.includes('ramzan') || n.includes('ramadhan')) return 9;
  if (n.includes('shawwal') || n.includes('shawal')) return 10;
  if (n.includes('qad') || n.includes('qid') || n.includes('qaada')) return 11;
  if (n.includes('hij') || n.includes('hajj')) return 12;
  return 0;
}

export async function GET() {
  try {
    const res = await fetch('https://www.urdupoint.com/islam/today-islamic-date-in-pakistan.html', {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PnaSindhi/1.0)' },
    });
    if (res.ok) {
      const html = await res.text();
      const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ');
      const m = text.match(/(\d{1,2})\s+([A-Za-z'\u2019\-\s]{3,30}?)\s+(14\d\d|15\d\d)/);
      if (m) {
        const idx = monthIndex(m[2]);
        if (idx) {
          return Response.json({ hijri: `${m[1]} ${HIJRI_MONTHS[idx - 1]} ${m[3]}\u0647\u0640`, raw: `${m[1]} ${m[2].trim()} ${m[3]}`, source: 'urdupoint' });
        }
      }
    }
  } catch (e) {}
  return Response.json({ hijri: '', source: 'none' });
}
