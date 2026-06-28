import './globals.css';
import { Noto_Naskh_Arabic } from 'next/font/google';
import VerticalMenu from '../components/VerticalMenu';

const sindhi = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-sindhi',
});

export const metadata = {
  title: 'پنا سنڌي | Sindhi News',
  description: 'سنڌي خبرون — شهر وار ٔ اين زمري وار ٔ خبرون',
};

const themeScript =
  "(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');}}catch(e){}})();";
const themeProps = { __html: themeScript };

export default function RootLayout({ children }) {
  return (
    <html lang="sd" dir="rtl" className={sindhi.variable}>
      <head>
        <script dangerouslySetInnerHTML={themeProps} />
      </head>
      <body>
        <div className="flex min-h-screen">
          <VerticalMenu />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
