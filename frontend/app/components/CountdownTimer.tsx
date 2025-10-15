'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  lockoutTime: number;
  onUnlock: () => void;
  className?: string;
}

export default function CountdownTimer({ lockoutTime, onUnlock, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, lockoutTime - now);
      
      if (remaining <= 0) {
        setTimeLeft(0);
        onUnlock();
        return;
      }
      
      setTimeLeft(remaining);
    };

    // Update immediately
    updateTimer();
    
    // Update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [lockoutTime, onUnlock]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  if (timeLeft <= 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm font-mono">
        Unlocks in {formatTime(timeLeft)}
      </span>
    </div>
  );
}
