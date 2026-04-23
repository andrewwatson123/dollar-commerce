import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import BookmarkSync from '@/components/BookmarkSync';
import { GoogleAnalytics } from '@next/third-parties/google';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F4F1EA',
};

export const metadata = {
  metadataBase: new URL('https://dollarcommerce.co'),
  title: {
    default: 'Dollar Commerce — E-Commerce Intelligence, Market Data & Industry News',
    template: '%s | Dollar Commerce',
  },
  description:
    'Dollar Commerce is the intelligence platform for the e-commerce industry. Track 116 public e-commerce stocks via the DC Index, follow live fundraising deals, monitor Amazon, Shopify, Meta and Google updates, and read daily editorial analysis.',
  keywords: [
    'e-commerce',
    'ecommerce news',
    'DC Index',
    'e-commerce stocks',
    'Shopify news',
    'Amazon seller news',
    'e-commerce fundraising',
    'DTC brands',
    'marketplace news',
    'e-commerce platform updates',
    'e-commerce analytics',
    'e-commerce industry intelligence',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Dollar Commerce — E-Commerce Intelligence',
    description:
      'Track the e-commerce industry: DC Index of 116 public stocks, live fundraising, platform updates, and daily news.',
    url: 'https://dollarcommerce.co',
    siteName: 'Dollar Commerce',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dollar Commerce — E-Commerce Intelligence',
    description:
      'Track the e-commerce industry: DC Index, live fundraising, platform updates, and daily news.',
    site: '@dollarcommerce',
    creator: '@dollarcommerce',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <BookmarkSync />
          {children}
        </AuthProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
