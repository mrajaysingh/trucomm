"use client";

import { useState, useEffect } from 'react';
import Noise from '../components/Noise';
import Aurora from '../components/Aurora';
import BackToTop from '../components/BackToTop';
import TargetCursor from '../components/TargetCursor';
import ClickSpark from '../components/ClickSpark';
import TextType from '../components/TextType';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { useLenis } from '../hooks/useLenis';

export default function Blogs() {
  const { isMobile, isLoading } = useMobileDetection();
  const { scrollTo } = useLenis();

  return (
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Hero Section */}
        <section className="hero-section relative z-10 w-full min-h-screen flex items-center justify-center pt-20">
          <TargetCursor 
            spinDuration={2}
            hideDefaultCursor={true}
            scopeSelector=".hero-section"
          />
          
          <div className="absolute inset-0 z-10">
            <Aurora
              colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
          </div>
          
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 font-heading cursor-target leading-tight">
                <div className="mb-2 sm:mb-0">Blogs</div>
                <div className="text-blue-400 font-hero-logo group inline-block">
                  <TextType 
                    text="Insights"
                    typingSpeed={75}
                    pauseDuration={1500}
                    showCursor={true}
                    cursorCharacter="|"
                    className="text-blue-400"
                  />
                </div>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 cursor-target leading-relaxed">
                Stay informed with the latest insights on cybersecurity and secure communication.
              </p>
            </div>
          </div>
        </section>

        <div className="relative z-0">
          <Noise
            patternSize={250}
            patternScaleX={1}
            patternScaleY={1}
            patternRefreshInterval={2}
            patternAlpha={15}
          />
        </div>
        
        <BackToTop />
      </div>
    </ClickSpark>
  );
}
