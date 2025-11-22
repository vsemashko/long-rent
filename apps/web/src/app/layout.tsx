import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'HomeMore - Long-term Rental Platform for Poland',
  description:
    'Modern digital ecosystem for long-term rentals in Poland. Find or list properties with complete rental lifecycle management.',
  keywords: [
    'rental',
    'mieszkania',
    'wynajem',
    'Poland',
    'Warsaw',
    'apartments',
    'long-term rental',
  ],
  authors: [{ name: 'HomeMore' }],
  openGraph: {
    title: 'HomeMore - More than renting',
    description: 'Long-term rental platform for Poland',
    type: 'website',
    locale: 'pl_PL',
    alternateLocale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="relative min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
