import './globals.css';
import { Lateef } from 'next/font/google';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import BottomNav from '../components/BottomNav';
import DrawerOpener from '../components/DrawerOpener';

const lateef = Lateef({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-lateef',
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://pna-sindhi-web.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE),
  title: 'پي اين اي سنڌي | Sindhi News',
  description: 'سنڌي خبرون — سنڌ، پاڪستان ۽ دنيا جون تازيون خبرون سنڌي بولي ۾.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport = {
  themeColor: '#c8102e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const themeScript =
  "(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');}}catch(e){}})();";
const themeProps = { __html: themeScript };

export default function RootLayout({ children }) {
  return (
    <html lang="sd" dir="rtl" className={lateef.variable}>
      <head>
        <script dangerouslySetInnerHTML={themeProps} />
      </head>
      <body>
        <SiteHeader />
        <DrawerOpener />
        <main className="max-w-6xl mx-auto min-h-screen pb-20 md:pb-0">{children}</main>
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  );
}
