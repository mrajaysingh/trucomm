"use client";

import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect when user is actively scrolling
 * Detects user scrolling for sync with scroll-based animations
 */
export function useIsUserScrolling(delay: number = 100) {
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleUserScroll = () => {
      setIsUserScrolling(true);
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set timeout to reset scroll state after delay
      timeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, delay);
    };

    const handleWheel = (e: WheelEvent) => {
      // Only trigger on actual wheel events (not programmatic)
      if (e.isTrusted) {
        handleUserScroll();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.isTrusted) {
        handleUserScroll();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Page navigation keys
      const scrollKeys = [
        'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 
        'Home', 'End', 'Space'
      ];
      
      if (e.isTrusted && scrollKeys.includes(e.code)) {
        handleUserScroll();
      }
    };

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });

    return () => {
      // Cleanup
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);

  return isUserScrolling;
}
