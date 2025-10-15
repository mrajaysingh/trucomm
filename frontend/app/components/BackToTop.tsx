'use client';

import { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useLenis } from '../hooks/useLenis';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollTo } = useLenis();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    scrollTo(0, { duration: 3 });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#3A29FF] via-[#FF94B4] to-[#FF3232] p-4 shadow-2xl shadow-[#3A29FF]/20 hover:shadow-[#FF3232]/30 transition-all duration-300 hover:scale-110 group"
          aria-label="Back to top"
        >
          <FaArrowUp className="w-6 h-6 text-white animate-bounce group-hover:animate-none" />
        </button>
      )}
    </>
  );
}
