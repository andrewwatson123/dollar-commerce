import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import BookmarkSync from '@/components/BookmarkSync';

export const metadata = {
  title: {
    default: 'Dollar Commerce',
    template: '%s — Dollar Commerce',
  },
  description: 'E-commerce industry intelligence — articles, fundraising tracker, DC Index, and platform updates.',
  openGraph: {
    title: 'Dollar Commerce',
    description: 'E-commerce industry intelligence — articles, fundraising tracker, DC Index, and platform updates.',
    siteName: 'Dollar Commerce',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dollar Commerce',
    description: 'E-commerce industry intelligence',
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
      </body>
    </html>
  );
}
