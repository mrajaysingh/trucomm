'use client';

import { type ReactNode } from 'react';
import { useLenis } from '../hooks/useLenis';

type LenisProviderProps = {
  children: ReactNode;
};

export default function LenisProvider({ children }: LenisProviderProps) {
  // Initialize Lenis through the hook
  useLenis();

  return <>{children}</>; 
}


