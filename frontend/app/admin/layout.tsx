'use client';

import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <AuthProvider>
        {children}
      </AuthProvider>
    </div>
  );
}
