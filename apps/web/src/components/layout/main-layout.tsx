'use client';

import { Header } from './header';
import { Footer } from './footer';
import { SkipToContent } from '@/components/accessibility/skip-to-content';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <SkipToContent />
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
