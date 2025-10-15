"use client";

import React, { useState, useEffect } from 'react';
import { FaTimes, FaMobile } from 'react-icons/fa';

interface MobilePopupProps {
  onClose: () => void;
}

const MobilePopup: React.FC<MobilePopupProps> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsVisible(false);
          setTimeout(() => onClose(), 300); // Wait for fade out animation
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const canCloseNow = timeLeft <= 5;

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mx-4 max-w-sm w-full text-center relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaMobile className="text-2xl text-red-400" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3 font-heading">
          Mobile Not Supported
        </h3>

        {/* Message */}
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          We are not available for mobile devices. Please access TruComm on a desktop or laptop for the full experience.
        </p>

        {/* Timer */}
        <div className="bg-white/10 rounded-lg p-3 mb-4">
          <div className="text-2xl font-bold text-white font-turcomm">
            {timeLeft}s
          </div>
          <div className="text-xs text-gray-400">
            Auto-closing in
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-1 mb-4">
          <div 
            className="bg-red-500 h-1 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((15 - timeLeft) / 15) * 100}%` }}
          ></div>
        </div>

        {/* Manual close button */}
        <button
          onClick={handleClose}
          disabled={!canCloseNow}
          className={`w-full py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
            canCloseNow 
              ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer' 
              : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canCloseNow ? 'Close Now' : `Close in ${timeLeft - 5}s`}
        </button>
      </div>
    </div>
  );
};

export default MobilePopup;
