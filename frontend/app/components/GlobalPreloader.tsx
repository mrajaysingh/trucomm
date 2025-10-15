"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import Preloader to ensure it only loads on client
const Preloader = dynamic(() => import("./Preloader"), {
  ssr: false,
  loading: () => null,
});

interface GlobalPreloaderProps {
  children: React.ReactNode;
  duration?: number;
}

export default function GlobalPreloader({ children, duration = 2000 }: GlobalPreloaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(false);

  useEffect(() => {
    // Check if this is the initial page load or a page refresh
    const isInitialLoad = !sessionStorage.getItem('hasLoaded');
    const isPageRefresh = performance.navigation.type === 1;
    
    if (isInitialLoad || isPageRefresh) {
      setShowPreloader(true);
      sessionStorage.setItem('hasLoaded', 'true');
      
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // If it's a navigation, don't show preloader
      setIsLoading(false);
      setShowPreloader(false);
    }
  }, [duration]);

  // Listen for logo click events to show preloader
  useEffect(() => {
    const handleLogoClick = () => {
      setShowPreloader(true);
      setIsLoading(true);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, duration);

      return () => clearTimeout(timer);
    };

    // Listen for custom event from Navigation component
    window.addEventListener('logo-click', handleLogoClick);
    
    return () => {
      window.removeEventListener('logo-click', handleLogoClick);
    };
  }, [duration]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  if (showPreloader && isLoading) {
    return (
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.9)'
        }}
      >
        <Preloader 
          onComplete={handlePreloaderComplete}
          duration={duration}
        />
      </div>
    );
  }

  return <>{children}</>;
}
