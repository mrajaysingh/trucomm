'use client';

import { useState, useEffect } from 'react';
import { FaWindows, FaApple, FaLinux } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import MobileAlert from './MobileAlert';
import { useLenis } from '../hooks/useLenis';

export default function Navigation() {
  const [os, setOs] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileAlert, setShowMobileAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });
  const [isMobile, setIsMobile] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [downloadCountdown, setDownloadCountdown] = useState(5);
  const [isDownloading, setIsDownloading] = useState(false);
  const { scrollTo } = useLenis();

  useEffect(() => {
    // Auto-detect OS
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setOs('mac');
    } else if (userAgent.includes('linux')) {
      setOs('linux');
    } else {
      setOs('windows');
    }

    // Check if mobile
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent);
    const isMobileScreen = window.innerWidth < 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(isMobileUserAgent || (isMobileScreen && isTouchDevice));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getOsIcon = () => {
    switch (os) {
      case 'mac':
        return <FaApple className="w-5 h-5" />;
      case 'linux':
        return <FaLinux className="w-5 h-5" />;
      default:
        return <FaWindows className="w-5 h-5" />;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // No anchor-based navigation; mobile uses alerts

  // Handle download click
  const handleDownloadClick = () => {
    if (isMobile) {
      setAlertConfig({
        title: 'Download Not Available',
        message: 'Download functionality is only available on desktop devices. Please use a desktop or laptop to download TruComm.'
      });
      setShowMobileAlert(true);
      setIsMobileMenuOpen(false);
    } else {
      setIsDownloading(true);
      setShowDownloadPopup(true);
      setDownloadCountdown(5);
      
      // Start countdown
      const countdownInterval = setInterval(() => {
        setDownloadCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Simulate download start
            setTimeout(() => {
              setShowDownloadPopup(false);
              setIsDownloading(false);
            }, 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <>
      {/* Mobile Alert */}
      <MobileAlert
        isVisible={showMobileAlert}
        onClose={() => setShowMobileAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
      />

      {/* Download Popup */}
      {showDownloadPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#FF4655] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Thank you for downloading TruComm!</h3>
              <p className="text-gray-300 text-sm">Your download will start automatically in</p>
            </div>
            
            <div className="mb-6">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-700"
                    strokeDasharray="100, 100"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    className="text-[#FF4655] transition-all duration-1000 ease-linear"
                    strokeDasharray={`${(downloadCountdown / 5) * 100}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{downloadCountdown}</span>
                </div>
              </div>
            </div>
            
            <div className="text-gray-400 text-sm">
              <p>Download will start automatically...</p>
            </div>
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        <div className="w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="relative mt-3 mb-3">
            {/* Glass morphism container */}
            <div className={`relative backdrop-blur-xl border rounded-2xl transition-all duration-300 ${
              isScrolled 
                ? 'bg-black/80 border-white/10 shadow-2xl shadow-white/5' 
                : 'bg-transparent border-transparent'
            }`}>
              {/* 3D effect overlay - only show when scrolled */}
              {isScrolled && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 rounded-2xl pointer-events-none"></div>
              )}
              
              {/* Content */}
              <div className="relative flex items-center justify-between px-4 py-3">
                {/* Left - Logo */}
                <Link 
                  href="/" 
                  className="flex items-center gap-3"
                  onClick={() => {
                    // Dispatch custom event to trigger preloader
                    window.dispatchEvent(new CustomEvent('logo-click'));
                  }}
                >
                  <Image
                    src="/logo.png"
                    alt="TruComm Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                    priority
                  />
                  <div className="text-white text-xl font-bold tracking-tight font-logo">
                    <span className="text-[#FF4655]">Tru</span>Comm
                  </div>
                </Link>

                {/* Center - Navigation Links (Desktop) */}
                <NavLinksWrapper className="hidden md:flex items-center space-x-3">
                  <Link href="/about" className="nav-link text-white/70 hover:text-white transition-colors duration-200 font-medium font-menu text-sm">About Us</Link>
                  <Link href="/features" className="nav-link text-white/70 hover:text-white transition-colors duration-200 font-medium font-menu text-sm">Features</Link>
                  <Link href="/pricing" className="nav-link text-white/70 hover:text-white transition-colors duration-200 font-medium font-menu text-sm">Pricing</Link>
                  <Link href="/changelog" className="nav-link text-white/70 hover:text-white transition-colors duration-200 font-medium font-menu text-sm">Changelog</Link>
                  <Link href="/blogs" className="nav-link text-white/70 hover:text-white transition-colors duration-200 font-medium font-menu text-sm">Blogs</Link>
                  <Link href="/docs" className="nav-link text-white/70 hover:text-white transition-colors duration-200 font-medium font-menu text-sm">Docs</Link>
                </NavLinksWrapper>

                {/* Right - Download Button & Mobile Menu Toggle */}
                <div className="flex items-center gap-3">
                  {/* Sign In Button */}
                  <StyledWrapper className="hidden sm:block">
                    <Link href="/signin" className="button">
                      <span className="button_lg">
                        <span className="button_sl" />
                        <span className="button_text">Sign In</span>
                      </span>
                    </Link>
                  </StyledWrapper>

                  {/* Download Button - styled like Sign In */}
                  <StyledWrapper className="hidden sm:block">
                    <button onClick={handleDownloadClick} className="button">
                      <span className="button_lg">
                        <span className="button_sl" />
                        <span className="button_text flex items-center gap-2">
                          {isDownloading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Downloading...</span>
                            </>
                          ) : (
                            <>
                              <span>Download for</span>
                              {getOsIcon()}
                            </>
                          )}
                        </span>
                      </span>
                    </button>
                  </StyledWrapper>

                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={toggleMobileMenu}
                    className="md:hidden flex items-center justify-center w-8 h-8 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                  >
                    {isMobileMenuOpen ? (
                      <HiX className="w-5 h-5" />
                    ) : (
                      <HiMenu className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Menu */}
              {isMobileMenuOpen && (
                <div className={`md:hidden border-t backdrop-blur-xl rounded-b-2xl transition-all duration-300 ${
                  isScrolled 
                    ? 'border-white/10 bg-black/90 shadow-xl shadow-white/5' 
                    : 'border-white/5 bg-black/70'
                }`}>
                  <div className="px-4 py-3 space-y-3">
                    {/* Mobile Navigation Links */}
                    <div className="flex flex-col space-y-2">
                      <Link href="/about" className="text-left text-white/70 hover:text-white transition-colors duration-200 font-medium py-1.5 font-menu text-sm">About Us</Link>
                      <Link href="/features" className="text-left text-white/70 hover:text-white transition-colors duration-200 font-medium py-1.5 font-menu text-sm">Features</Link>
                      <Link href="/pricing" className="text-left text-white/70 hover:text-white transition-colors duration-200 font-medium py-1.5 font-menu text-sm">Pricing</Link>
                      <Link href="/changelog" className="text-left text-white/70 hover:text-white transition-colors duration-200 font-medium py-1.5 font-menu text-sm">Changelog</Link>
                      <Link href="/blogs" className="text-left text-white/70 hover:text-white transition-colors duration-200 font-medium py-1.5 font-menu text-sm">Blogs</Link>
                      <Link href="/docs" className="text-left text-white/70 hover:text-white transition-colors duration-200 font-medium py-1.5 font-menu text-sm">Docs</Link>
                    </div>
                    
                    {/* Mobile Download Button */}
                    <div className="pt-3 border-t border-white/5">
                      <Link 
                        href="/signin"
                        className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 transition-all duration-200 font-menu text-sm mb-2"
                      >
                        <span className="text-xs font-medium">Sign In</span>
                      </Link>
                      <button 
                        onClick={handleDownloadClick}
                        className="w-full flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 text-white px-3 py-2 rounded-lg border border-white/10 transition-all duration-200 font-menu text-sm"
                      >
                        {isDownloading ? (
                          <>
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span className="text-xs font-medium">Downloading...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-medium">Download for</span>
                            {getOsIcon()}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

const StyledWrapper = styled.div`
  .button {
    display: inline-block;
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    border: none;
    background: none;
    color: #0f1923;
    cursor: pointer;
    position: relative;
    padding: 4px;
    margin-bottom: 0;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 12px;
    line-height: 1;
    transition: all .15s ease;
  }

  .button::before,
  .button::after {
    content: '';
    display: block;
    position: absolute;
    right: 0;
    left: 0;
    height: calc(50% - 5px);
    border: 1px solid #7D8082;
    transition: all .15s ease;
  }

  .button::before { top: 0; border-bottom-width: 0; }
  .button::after { bottom: 0; border-top-width: 0; }

  .button:active, .button:focus { outline: none; }
  .button:active::before, .button:active::after { right: 3px; left: 3px; }
  .button:active::before { top: 3px; }
  .button:active::after { bottom: 3px; }

  .button_lg {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 12px;
    color: #fff;
    background-color: #0f1923;
    overflow: hidden;
    box-shadow: inset 0px 0px 0px 1px transparent;
  }

  .button_lg::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 2px;
    background-color: #0f1923;
  }

  .button_lg::after {
    content: '';
    display: block;
    position: absolute;
    right: 0;
    bottom: 0;
    width: 4px;
    height: 4px;
    background-color: #0f1923;
    transition: all .2s ease;
  }

  .button_sl {
    display: block;
    position: absolute;
    top: 0;
    bottom: -1px;
    left: -8px;
    width: 0;
    background-color: #ff4655;
    transform: skew(-15deg);
    transition: all .2s ease;
  }

  .button_text { position: relative; }
  .button_text { display: inline-flex; align-items: center; gap: 6px; line-height: 1; }

  .button:hover { color: #0f1923; }
  .button:hover .button_sl { width: calc(100% + 15px); }
  .button:hover .button_lg::after { background-color: #fff; }
`;

const NavLinksWrapper = styled.div`
  .nav-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.25rem;
    padding: 0 8px;
    border-radius: 6px;
    letter-spacing: 0.5px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
    will-change: transform, box-shadow;
    cursor: pointer;
  }

  .nav-link:hover {
    transform: translateY(-2px);
    box-shadow: 6px 6px 22px rgba(0,0,0,0.35), -6px -6px 22px rgba(255,255,255,0.06);
  }
`;
