"use client";

import { useState, useEffect } from 'react';
import Noise from './components/Noise';
import Aurora from './components/Aurora';
import BackToTop from './components/BackToTop';
import TargetCursor from './components/TargetCursor';
import ClickSpark from './components/ClickSpark';
import TextType from './components/TextType';
import Orb from './components/Orb';
import MobilePopup from './components/MobilePopup';
import MobileAlert from './components/MobileAlert';
import { useMobileDetection } from './hooks/useMobileDetection';
import { useLenis } from './hooks/useLenis';
import { FaShieldAlt, FaLock, FaServer } from 'react-icons/fa';
import { GiCrossedSwords, GiLockedChest } from 'react-icons/gi';
import Image from 'next/image';
import ChromaHover, { ChromaGrid } from './components/ChromaHover';
import CosmicPortalButton from './components/CosmicPortalButton';
import PurchaseModal from './components/PurchaseModal';

export default function Home() {
  const { isMobile, isLoading } = useMobileDetection();
  const { scrollTo } = useLenis();
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const [showMobileAlert, setShowMobileAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [downloadCountdown, setDownloadCountdown] = useState(5);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; type: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'; description: string; price: number; features: string[]; duration: number } | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Plan data matching the pricing page
  const plans: { id: string; name: string; type: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'; description: string; price: number; features: string[]; duration: number }[] = [
    {
      id: 'xcomm',
      name: 'XComm',
      type: 'BASIC',
      description: 'Perfect for individuals and small teams starting their secure communication journey.',
      price: 5,
      features: [
        '10GB Data Center Storage',
        'RC4 & RSA Encryption',
        'Logs Control',
        'EEE Security',
        'Main Support'
      ],
      duration: 1
    },
    {
      id: 'xcomm-pro',
      name: 'XComm Pro',
      type: 'PROFESSIONAL',
      description: 'Advanced security features for growing businesses and professional teams.',
      price: 15,
      features: [
        '100GB Data Center Storage',
        'AES-256 & ECC Encryption (military-grade)',
        'Advanced Logs Control with export options',
        'EEE+ Security (enhanced enterprise-grade)',
        'Priority Support (24/7 Email & Chat)'
      ],
      duration: 1
    },
    {
      id: 'xcomm-elite',
      name: 'XComm Elite',
      type: 'ENTERPRISE',
      description: 'Ultimate security suite with BYOSS technology for enterprise-level protection.',
      price: 30,
      features: [
        'Loaded With BYOSS Tech',
        '1TB Data Center Storage',
        'Hybrid Post-Quantum Encryption',
        'Full Logs Control with Monitoring & Alerts',
        'Zero-Trust EEE Security Suite',
        'Dedicated Account Manager + VIP Support'
      ],
      duration: 1
    }
  ];

  // Handle plan selection
  const handleSelectPlan = (plan: { id: string; name: string; type: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'; description: string; price: number; features: string[]; duration: number }) => {
    if (isMobile) {
      setAlertConfig({
        title: 'Purchase Not Available',
        message: 'Purchase feature is only available on desktop devices. Please switch to a desktop or laptop to access this feature.'
      });
      setShowMobileAlert(true);
    } else {
      setSelectedPlan(plan);
      setShowPurchaseModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowPurchaseModal(false);
    setSelectedPlan(null);
  };

  // Show mobile popup when mobile is detected
  useEffect(() => {
    if (isMobile && !isLoading) {
      setShowMobilePopup(true);
    }
  }, [isMobile, isLoading]);

  // Handle download click
  const handleDownloadClick = () => {
    if (isMobile) {
      setAlertConfig({
        title: 'Download Not Available',
        message: 'Download feature is only available on desktop devices. Please switch to a desktop or laptop to access this feature.'
      });
      setShowMobileAlert(true);
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

  // Handle mobile button clicks
  const handleMobileButtonClick = (action: string) => {
    if (isMobile) {
      const config = {
        'get-started': {
          title: 'Action Not Permitted',
          message: 'Get Started feature is only available on desktop devices. Please switch to a desktop or laptop to access this feature.'
        },
        'pricing': {
          title: 'Pricing Not Available',
          message: 'Pricing information is only accessible on desktop devices. Please use a desktop or laptop to view our pricing plans.'
        }
      };
      
      setAlertConfig(config[action as keyof typeof config]);
      setShowMobileAlert(true);
    }
  };

  // If loading detection, still render; global preloader handles initial block

  return (
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="min-h-screen bg-black relative overflow-hidden">
          {/* Mobile Popup */}
          {showMobilePopup && (
            <MobilePopup onClose={() => setShowMobilePopup(false)} />
          )}

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

          {/* Hero Section - Always visible */}
        <section className="hero-section relative z-10 w-full min-h-screen flex items-center justify-center pt-20">
                {/* Target Cursor for Hero Section */}
                <TargetCursor 
                  spinDuration={2}
                  hideDefaultCursor={true}
                  scopeSelector=".hero-section"
                />
                
                {/* Aurora Background for Hero Section */}
                <div className="absolute inset-0 z-10">
                  <Aurora
                    colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
                    blend={0.5}
                    amplitude={1.0}
                    speed={0.5}
                  />
                </div>
                
                {/* Hero Content */}
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 font-heading cursor-target leading-tight">
                  <div className="mb-2 sm:mb-0">Welcome to</div>
                  <div className="text-blue-400 font-hero-logo group inline-block">
                    <TextType 
                      text="TruComm"
                      typingSpeed={75}
                      pauseDuration={1500}
                      showCursor={true}
                      cursorCharacter="|"
                      className="text-blue-400"
                    />
                  </div>
                    </h1>
                <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 cursor-target leading-relaxed">
                      The ultimate communication platform for modern teams.
                    </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center px-4">
                  <CosmicPortalButton
                    onClick={handleDownloadClick}
                    className="w-full sm:w-auto"
                    label={isDownloading ? "Downloading..." : "Download"}
                    showSystemIcon={!isDownloading}
                    isDownloading={isDownloading}
                  />
                </div>
               
               {/* Scroll to Pricing Indicator */}
               <div className="mt-8 sm:mt-12 text-center">
                 <button
                   onClick={() => {
                     if (!isMobile) {
                       scrollTo('#features', { offset: -100 });
                     } else {
                       handleMobileButtonClick('get-started');
                     }
                   }}
                   className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer group"
                 >
                   <div className="flex flex-col items-center gap-2">
                     <span className="text-sm font-medium">Explore</span>
                     <div className="w-6 h-6 border-2 border-gray-400 group-hover:border-white rounded-full flex items-center justify-center transition-colors duration-300">
                       <svg className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                       </svg>
                     </div>
                   </div>
                 </button>
               </div>
                  </div>
                </div>
          </section>

          {/* Desktop-only sections */}
          {!isMobile && (
            <>
              {/* Removed ScrollVelocity section */}

      {/* Why We Are Unique Section */}
      <section id="features" className="relative z-20 w-full min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-12 sm:mb-16 px-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-heading leading-tight">
              Our Technology
            </h2>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Revolutionary security protocols that set new industry standards for communication safety
            </p>
          </div>

          {/* Featured BYOSS Technology Card */}
                  <div className="mb-12 sm:mb-16">
                    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl shadow-blue-500/20">
                      <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
                        <div className="flex-1 order-2 lg:order-1">
                          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    Industry Exclusive
                  </div>
                          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 font-heading leading-tight">
                    BYOSS Technology
                  </h3>
                          <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                    Our proprietary BYOSS (Bring Your Own Storage System) technology is the only industrial-level storage protocol that provides complete data sovereignty and control. This revolutionary approach ensures enterprise-grade storage security while maintaining lightning-fast data access speeds.
                  </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></span>
                      Complete Data Sovereignty
                    </div>
                    <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></span>
                      Enterprise Storage Control
                    </div>
                    <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></span>
                      Lightning-Fast Data Access
                    </div>
                    <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></span>
                      Proprietary Technology
                    </div>
                  </div>
                </div>
                        <div className="w-full sm:w-64 lg:w-80 h-64 sm:h-80 bg-black rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl shadow-white/5 transform hover:scale-105 transition-all duration-300 relative order-1 lg:order-2">
                  {/* 3D effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 rounded-2xl pointer-events-none"></div>
                  {/* Content */}
                  <div className="relative z-10">
        <Image
                      src="/logo.png"
                      alt="TruComm Logo"
                              width={80}
                              height={80}
                              className="sm:w-[120px] sm:h-[120px]"
          priority
        />
                  </div>
                </div>
              </div>
            </div>
          </div>

                                      {/* Other Security Features Grid */}
                    <ChromaGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {/* 4-Step Server Level EEE */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <FaServer className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          4-Step Server Level EEE
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          End-to-End Security protocol with four layers of server-level protection ensuring complete data integrity.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Layer 1: Authentication
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Layer 2: Encryption
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Layer 3: Validation
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Layer 4: Transmission
                          </div>
                        </div>
                      </div>

                      {/* Military Level Security */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <GiCrossedSwords className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          Military Level Security
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          Enterprise-grade security protocols that meet and exceed military standards for data protection.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Top Secret Clearance Level
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Defense-Grade Encryption
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Threat Intelligence
                          </div>
                        </div>
                      </div>

                      {/* Dual AES-256 */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <FaLock className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          Dual AES-256
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          Double-layered AES-256 encryption ensuring maximum security for all data transmissions.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Layer 1: AES-256
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Layer 2: AES-256
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Quantum-Resistant
                          </div>
                        </div>
                      </div>

                      {/* SOC 2 Aligned Security */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <FaShieldAlt className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          SOC 2 Aligned Security
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          Industry-standard security controls aligned with SOC 2 Type II compliance requirements.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Security Controls
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Availability Controls
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Processing Integrity
                          </div>
                        </div>
                      </div>

                      {/* Encryption at Transit and Rest */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <FaLock className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          Encryption at Transit and Rest
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          End-to-end encryption ensuring data security both during transmission and while stored.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            HTTPS/TLS Encryption
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            AES-256 at Rest
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Zero Knowledge Access
                          </div>
                        </div>
                      </div>

                      {/* Data Security */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <FaShieldAlt className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          Data Security
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          AWS-powered infrastructure with robust physical security controls and data protection.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            AWS Infrastructure
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Physical Security
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Authorized Access Only
                          </div>
                        </div>
                      </div>

                      {/* Access Control */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <FaLock className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          Access Control
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          Strict access management ensuring only authorized personnel can access sensitive areas.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Role-Based Access
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Multi-Factor Auth
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Audit Logging
                          </div>
                        </div>
                      </div>

                      {/* Secure Development Practices */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <FaServer className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          Secure Development Practices
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          Comprehensive code review and testing processes before any release.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Peer Code Reviews
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Automated Testing
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Security Scanning
                          </div>
                        </div>
                      </div>

                      {/* Resilient and Monitored */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <FaShieldAlt className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          Resilient and Monitored
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          Advanced threat detection, logging, and alerting systems for continuous monitoring.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Threat Detection
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Real-time Logging
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full flex-shrink-0"></span>
                            Instant Alerts
                          </div>
                        </div>
                      </div>

                      {/* GDPR Compliance */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <FaShieldAlt className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          GDPR Compliance
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          Full compliance with global privacy regulations including GDPR rights and obligations.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            Privacy by Design
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            Consent Management
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            Global Compliance
                          </div>
                        </div>
                      </div>

                      {/* Security Audits */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <FaShieldAlt className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          Security Audits
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          Regular internal and third-party vulnerability assessments with comprehensive penetration testing.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            Vulnerability Assessments
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            Penetration Testing
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            Third-Party Audits
                          </div>
                        </div>
                      </div>

                      {/* Rapid Incident Management */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                          <FaShieldAlt className="text-xl sm:text-2xl text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-heading leading-tight">
                          Incident Management
                        </h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                          Comprehensive Incident Response Plan with efficient detection, response, and recovery procedures.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            Incident Response Plan
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            Rapid Detection
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            Recovery Procedures
                          </div>
                        </div>
                      </div>
                    </ChromaGrid>
                </div>
              </section>

              {/* Pricing Section */}
              <section className="relative z-20 w-full min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-black">
                {/* Orb Background */}
                <div className="absolute inset-0 z-0">
                  <Orb
                    hoverIntensity={0.5}
                    rotateOnHover={true}
                    hue={0}
                    forceHoverState={false}
                  />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto">
                  <div className="text-center mb-12 sm:mb-16 px-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-heading leading-tight">
                      Pricing Plans
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                      Choose the perfect security solution for your communication needs
                    </p>
            </div>

                  {/* Pricing Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {plans.map((plan, index) => (
                      <div
                        key={plan.id}
                        className={`relative backdrop-blur-xl border rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:scale-105 cursor-target ${
                          plan.id === 'xcomm-pro' 
                            ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/40 hover:bg-blue-600/30' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {plan.id === 'xcomm-pro' && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                              Most Popular
                            </span>
                          </div>
                        )}
                        
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 leading-tight">{plan.name}</h3>
                        <div className="mb-2">
                          <span className="text-3xl sm:text-4xl font-bold text-white">${plan.price}</span>
                          <span className="text-gray-400 ml-2 text-sm sm:text-base">/mo</span>
                        </div>
                        <div className="mb-4 sm:mb-6">
                          <span className="text-xs sm:text-sm text-blue-300">7 day free trial</span>
                        </div>
                        <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                          {plan.description}
                        </p>
                        <button 
                          onClick={() => handleSelectPlan(plan)}
                          className="animated-button w-full mb-6 sm:mb-8"
                        >
                          <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
                          </svg>
                          <span className="text">Start Free Trial</span>
                          <span className="circle"></span>
                          <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
                          </svg>
                        </button>
                        <div>
                          <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Includes:</h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {plan.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center gap-2 sm:gap-3 text-gray-300 text-xs sm:text-sm">
                                <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Section */}
                  <div className="text-center mt-12 sm:mt-16 px-4">
                    <button 
                      onClick={() => handleSelectPlan(plans[1])} // Default to XComm Pro
                      className="w-full sm:w-auto bg-[#0f1923] hover:bg-[#ff4655] text-white hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-colors duration-200 text-base sm:text-lg"
                    >
                      Start Your Free Trial
                    </button>
                    <p className="text-gray-400 mt-3 sm:mt-4 text-xs sm:text-sm">
                      No credit card required • Cancel anytime
                    </p>
          </div>
        </div>
      </section>

              {/* Changelog Section removed as requested */}
            </>
          )}

                    {/* Rest of the page with noise background */}
              <div className="relative z-0">
                <Noise
                  patternSize={250}
                  patternScaleX={1}
                  patternScaleY={1}
                  patternRefreshInterval={2}
                  patternAlpha={15}
                />
              </div>
              
              {/* Back to Top Button */}
              <BackToTop />
              
              {/* Purchase Modal */}
              {showPurchaseModal && selectedPlan && (
                <PurchaseModal
                  plan={selectedPlan}
                  onClose={handleCloseModal}
                />
              )}
            </div>
          </ClickSpark>
  );
}
