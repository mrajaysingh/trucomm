"use client";

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

let globalLenis: Lenis | null = null;

/**
 * Hook to get the global Lenis instance for smooth scrolling
 * Provides scrollTo function for navigation
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);
    
    // Initialize Lenis only once globally and only on client
    if (!globalLenis && typeof window !== 'undefined') {
      try {
        globalLenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        });

        // Start the animation loop
        function raf(time: number) {
          if (globalLenis) {
            globalLenis.raf(time);
            requestAnimationFrame(raf);
          }
        }
        requestAnimationFrame(raf);
      } catch (error) {
        console.warn('Failed to initialize Lenis:', error);
      }
    }

    lenisRef.current = globalLenis;

    return () => {
      // Don't destroy global instance, just clean up reference
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = (target: string | number, options?: { offset?: number; duration?: number }) => {
    if (!isClient || !globalLenis || typeof window === 'undefined') return;

    try {
      if (typeof target === 'string') {
        // Handle anchor links
        const element = document.querySelector(target);
        if (element instanceof HTMLElement) {
          globalLenis.scrollTo(element, {
            offset: options?.offset || 0,
            duration: options?.duration || 1.2,
          });
        }
      } else {
        // Handle numeric positions
        globalLenis.scrollTo(target, {
          duration: options?.duration || 1.2,
        });
      }
    } catch (error) {
      console.warn('ScrollTo failed:', error);
    }
  };

  return {
    lenis: isClient ? lenisRef.current : null,
    scrollTo,
  };
}

/**
 * Get the global Lenis instance directly (for use in components)
 */
export function getLenis(): Lenis | null {
  return globalLenis;
}
