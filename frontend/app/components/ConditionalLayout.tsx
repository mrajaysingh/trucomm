'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import LenisProvider from './LenisProvider';
import Footer from './Footer';
import GlobalPreloader from './GlobalPreloader';
import FloatingAIChat from './FloatingAIChat';
import { AuthProvider } from '../contexts/AuthContext';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // For admin routes, render without header and footer
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-black">
        {children}
      </div>
    );
  }

  // For all other routes, render with full layout
  return (
    <AuthProvider>
      <GlobalPreloader duration={2000}>
        <LenisProvider>
          <Navigation />
          <main>
            {children}
          </main>
          <Footer />
          <FloatingAIChat />
        </LenisProvider>
      </GlobalPreloader>
    </AuthProvider>
  );
}
