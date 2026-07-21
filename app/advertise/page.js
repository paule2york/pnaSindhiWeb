export const metadata = {
  title: 'اشتهار | پي اين اي سنڌي',
  description: 'پي اين اي سنڌي تي اشتهار ڏيو، پنهنجي ڪاروبار کي سنڌي پڙهندڙن تائين پهچايو.',
};

export default function AdvertisePage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="text-[2.5rem] font-bold text-brand-dark mb-2">اشتهار</h1>
      <div className="h-1 w-20 bg-accent rounded mb-8" />
      <div className="space-y-5 text-[1.4rem] leading-relaxed text-gray-800">
        <p>پي اين اي سنڌي تي اشتهار ڏيو پنهنجي ڪاروبار، پيداوار يا خدمت کي لکين سنڌي پڙهندڙن تائين پهچايو.</p>
        <p>اسان وٹ هيٹيان اشتهاري موقعا موجود آهن:</p>
        <ul className="list-disc pr-6 space-y-2">
          <li>ڊجيٹل بينر اشتهار</li>
          <li>اسپانسرڊ خبرون ۽ مضمون</li>
          <li>سوشل ميڊيا تي خاص مهم</li>
          <li>ادارن لاءِ خاص پيڪيج</li>
        </ul>
        <p>اشتهارن جي قيمتن ۽ وڊيڪ تفصيل لاءِ مهرباني ڪري اسان جي رابطو واري صفحي ذريعي اسان سان رابطو ڪريو.</p>
      </div>
    </div>
  );
}
