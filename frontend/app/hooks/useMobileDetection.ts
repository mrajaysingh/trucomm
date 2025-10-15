"use client";

import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      // Check user agent for mobile devices
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());

      // Check screen size (mobile typically < 768px)
      const isMobileScreen = window.innerWidth < 768;

      // Check for touch capability (most mobile devices are touch-enabled)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Consider it mobile if any of these conditions are true
      const mobileDetected = isMobileUserAgent || (isMobileScreen && isTouchDevice);

      setIsMobile(mobileDetected);
      setIsLoading(false);
    };

    // Check immediately
    checkMobile();

    // Check on resize
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Return default values during SSR to prevent hydration mismatch
  if (typeof window === 'undefined') {
    return { isMobile: false, isLoading: true };
  }

  return { isMobile, isLoading };
};
