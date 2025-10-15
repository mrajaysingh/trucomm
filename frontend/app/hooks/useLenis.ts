"use client";

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

let globalLenis: Lenis | null = null;

/**
 * Hook to get the global Lenis instance for smooth scrolling
 * Provides scrollTo function for navigation
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis only once globally
    if (!globalLenis && typeof window !== 'undefined') {
      globalLenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      // Start the animation loop
      function raf(time: number) {
        globalLenis?.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    lenisRef.current = globalLenis;

    return () => {
      // Don't destroy global instance, just clean up reference
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = (target: string | number, options?: { offset?: number; duration?: number }) => {
    if (!globalLenis) return;

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
  };

  return {
    lenis: lenisRef.current,
    scrollTo,
  };
}

/**
 * Get the global Lenis instance directly (for use in components)
 */
export function getLenis(): Lenis | null {
  return globalLenis;
}
