export const metadata = {
  title: 'رابطو | پي اين اي سنڌي',
  description: 'پي اين اي سنڌي سان رابطو ڪريو.',
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="text-[2.5rem] font-bold text-brand-dark mb-2">رابطو</h1>
      <div className="h-1 w-20 bg-accent rounded mb-8" />
      <div className="space-y-5 text-[1.4rem] leading-relaxed text-gray-800">
        <p>اسان سان رابطو ڪرٱ لاءِ توهان جو آڌرڀاءُ آهي. خبر، تجويز، شڪايت يا اشتهار بابت اسان ڪي لڪو.</p>
        <div className="bg-gray-50 rounded-xl p-6 space-y-3">
          <p><span className="font-bold text-brand-dark">اي ميل:</span> info@pnasindhi.com</p>
          <p><span className="font-bold text-brand-dark">سوشل ميڊيا:</span> فيس بڪ، انسٽاگرام، يوٽيوب ۽ X تي پي اين اي سنڌي کي فالو ڪريو.</p>
        </div>
        <p>اسان توهان جي راي ۽ تجويزن جو هميشه خيرمقدم ڪريون ٹا.</p>
      </div>
    </div>
  );
}
