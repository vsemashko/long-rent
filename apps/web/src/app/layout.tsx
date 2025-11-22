import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/components/providers/query-provider';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { Mixpanel } from '@/components/analytics/mixpanel';
import { FocusVisibleIndicator } from '@/components/accessibility/focus-visible-indicator';

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
      <body className="font-sans antialiased">
        <GoogleAnalytics />
        <Mixpanel />
        <FocusVisibleIndicator />
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
