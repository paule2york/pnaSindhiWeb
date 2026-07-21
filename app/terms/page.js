export const metadata = {
  title: 'استعمال جون شرطون | پي اين اي سنڌي',
  description: 'پي اين اي سنڌي استعمال ڪرڻ جون شرطون.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="text-[2.5rem] font-bold text-brand-dark mb-2">استعمال جون شرطون</h1>
      <div className="h-1 w-20 bg-accent rounded mb-8" />
      <div className="space-y-5 text-[1.3rem] leading-relaxed text-gray-800">
        <p>پي اين اي سنڌي استعمال ڪرڻ سان توهان هيٺين شرطن سان متفق ٿيو ٿا.</p>
        <h2 className="text-2xl font-bold text-brand-dark pt-2">مواد جو استعمال</h2>
        <p>هن سائيٹ تي موجود خبرون ۽ مواد صرف ڏاڻ جي مقصد لاءِ آهن. اسان درستگيء لاءِ ڪوشش ڪندا آهيون پر ڪنهن به غلطيء يا گهٹتائيء جي ذميواري قبول نٹا ڪريون.</p>
        <h2 className="text-2xl font-bold text-brand-dark pt-2">ڪاپي رائيٹ</h2>
        <p>سائيٽ تي موجود اصل مواد ۽ لوگو پي اين اي سنڌي جي ملڪيت آهن. اجازت کان سواءِ ڪنهن به مواد کي نقل ڪرڻ کان پاسو ڪريو.</p>
        <h2 className="text-2xl font-bold text-brand-dark pt-2">ڀاهرين لنڪ</h2>
        <p>اسان جي سائيٹ تي ڀاهرين خبري ذريعن جا لنڪ موجود تي سگهن ٹا. انهن جي مواد لاءِ اسان ذميوار نه آهيون.</p>
        <h2 className="text-2xl font-bold text-brand-dark pt-2">شرطن ھ تبديلي</h2>
        <p>اسان وقت بوقت انهن شرطن ھ تبديلي ڪري سگهون ٹا. تازو ڪاري تيل شرطون هن صفحي تي شائع تينديون.</p>
      </div>
    </div>
  );
}
