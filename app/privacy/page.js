export const metadata = {
  title: 'رازداري پاليسي | پي اين اي سنڌي',
  description: 'پي اين اي سنڌي توهان جي ذاتي رازداريء جو احترام ڪري ٿو.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="text-[2.5rem] font-bold text-brand-dark mb-2">رازداري پاليسي</h1>
      <div className="h-1 w-20 bg-accent rounded mb-8" />
      <div className="space-y-5 text-[1.3rem] leading-relaxed text-gray-800">
        <p>پي اين اي سنڌي توهان جي ذاتي رازداريء جو احترام ڪري ٿو. هيءَ پاليسي ٻڌائي ٿي ته اسان ڪهڙي معلومات گڏ ڪريون ٿا ۽ ان کي ڪيئن استعمال ڪريون ٿا.</p>
        <h2 className="text-2xl font-bold text-brand-dark pt-2">معلومات گڏ ڪرٱ</h2>
        <p>اسان عام طور تي توهان ڪان ڪا ذاتي معلومات نٹو گهرون. ويب سائيٹ جي ڪارڪردگيء ڪو بهتر بنائڑ لاءِ اسان بنيادي شماريات ۽ ڪوڪيز استعمال ڪري سگهون ٹا.</p>
        <h2 className="text-2xl font-bold text-brand-dark pt-2">معلومات جو استعمال</h2>
        <p>گڏ ڪيل معلومات صرف ويب سائيٹ جي تجربي ڪو بهتر بنائڑ ۽ مواد ڪو سڌارٱ لاءِ استعمال تيندي آهي. اسان توهان جي معلومات ڪنهن ڪي وڪرو نٹو ڪريون.</p>
        <h2 className="text-2xl font-bold text-brand-dark pt-2">ٹئين ڌر جون خدمتون</h2>
        <p>اسان جي ويب سائيٹ تي ّين ويب سائيٹن جا لنڪ يا اشتهار تي سگهن ٹا. انهن جي رازداري پاليسيء لاءِ اسان ذميوار نه آهيون.</p>
        <h2 className="text-2xl font-bold text-brand-dark pt-2">رابطو</h2>
        <p>رازداري بابت ڪنهن به سوال لاءِ اسان سان رابطو ڪريو.</p>
      </div>
    </div>
  );
}
