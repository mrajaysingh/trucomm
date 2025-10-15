'use client';

import React, { useState, useEffect, useRef } from 'react';

type ChromaHoverProps = {
  children: React.ReactNode;
  className?: string;
  radiusPx?: number;
  spotlightColor?: string; // rgba color
  fadeDurationMs?: number;
};

export default function ChromaHover({
  children,
  className = '',
  radiusPx = 220,
  spotlightColor = 'rgba(255,255,255,0.25)',
  fadeDurationMs = 250,
}: ChromaHoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      className={`relative group ${className}`}
      onMouseMove={handleMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle ${radiusPx}px at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor} 0%, transparent 65%)`,
        }}
      />
    </div>
  );
}

// New unified ChromaGrid component for seamless effect across all cards
export function ChromaGrid({
  children,
  className = '',
  radiusPx = 300,
  spotlightColor = 'rgba(255,255,255,0.25)',
  fadeDurationMs = 250,
}: ChromaHoverProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    // Fade in when mouse moves
    setOpacity(1);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to fade out when mouse stops moving
    timeoutRef.current = setTimeout(() => {
      setOpacity(0);
    }, 150); // Small delay before fading out
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative ${className}`}
      onMouseMove={handleMove}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
        style={{
          opacity: opacity,
          background: `radial-gradient(circle ${radiusPx}px at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor} 0%, transparent 65%)`,
        }}
      />
    </div>
  );
}


