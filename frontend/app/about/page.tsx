"use client";

import { useState, useEffect } from 'react';
import Noise from '../components/Noise';
import Aurora from '../components/Aurora';
import BackToTop from '../components/BackToTop';
import TargetCursor from '../components/TargetCursor';
import ClickSpark from '../components/ClickSpark';
import TextType from '../components/TextType';
import Orb from '../components/Orb';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { useLenis } from '../hooks/useLenis';
import { FaShieldAlt, FaLock, FaServer, FaUsers, FaRocket, FaGlobe, FaAward, FaCode, FaHeart, FaLightbulb, FaCog, FaChartLine } from 'react-icons/fa';
import { GiCrossedSwords, GiLockedChest, GiTargetArrows, GiRocketThruster } from 'react-icons/gi';
import Image from 'next/image';
import ChromaHover, { ChromaGrid } from '../components/ChromaHover';
import CosmicPortalButton from '../components/CosmicPortalButton';

export default function About() {
  const { isMobile, isLoading } = useMobileDetection();
  const { scrollTo } = useLenis();
  const [activeTab, setActiveTab] = useState('mission');

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
        {/* Hero Section */}
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
                <div className="mb-2 sm:mb-0">About</div>
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
                Pioneering the future of secure communication with revolutionary technology and unwavering commitment to privacy.
              </p>
              
              {/* Scroll to Content Indicator */}
              <div className="mt-8 sm:mt-12 text-center">
                <button
                  onClick={() => {
                    if (!isMobile) {
                      scrollTo('#about-content', { offset: -100 });
                    }
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium">Learn More</span>
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
            {/* About Content Section */}
            <section id="about-content" className="relative z-20 w-full min-h-screen py-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12 sm:mb-16">
                  {[
                    { id: 'mission', label: 'Our Mission', icon: FaRocket },
                    { id: 'story', label: 'Our Story', icon: FaHeart },
                    { id: 'values', label: 'Our Values', icon: FaAward },
                    { id: 'team', label: 'Our Team', icon: FaUsers },
                    { id: 'technology', label: 'Technology', icon: FaCode }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm sm:text-base font-menu">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="min-h-[600px]">
                  {/* Mission Tab */}
                  {activeTab === 'mission' && (
                    <div className="space-y-12">
                      <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-heading leading-tight">
                          Our Mission
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                          To revolutionize secure communication by making military-grade security accessible to everyone
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 sm:p-8">
                            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-heading">
                              Security First, Always
                            </h3>
                            <p className="text-gray-300 leading-relaxed">
                              We believe that privacy and security are fundamental human rights. Our mission is to provide 
                              cutting-edge communication tools that protect your data with military-grade encryption and 
                              zero-compromise security protocols.
                            </p>
                          </div>
                          
                          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
                            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-heading">
                              Innovation Through Technology
                            </h3>
                            <p className="text-gray-300 leading-relaxed">
                              Our proprietary BYOSS technology represents a breakthrough in communication security, 
                              offering unprecedented protection while maintaining the speed and reliability users expect.
                            </p>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="w-full h-96 bg-black rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl shadow-white/5">
                            <div className="text-center">
                              <Image
                                src="/logo.png"
                                alt="TruComm Logo"
                                width={120}
                                height={120}
                                className="mx-auto mb-4"
                                priority
                              />
                              <h4 className="text-xl font-bold text-white mb-2 font-heading">TruComm</h4>
                              <p className="text-gray-400 text-sm">Secure Communication Redefined</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Story Tab */}
                  {activeTab === 'story' && (
                    <div className="space-y-12">
                      <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-heading leading-tight">
                          Our Story
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                          Born from a vision to democratize security and protect digital communications worldwide
                        </p>
                      </div>

                      <div className="max-w-4xl mx-auto">
                        <div className="space-y-8">
                          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaLightbulb className="text-2xl text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white mb-2 font-heading">The Beginning</h3>
                                <p className="text-gray-300 leading-relaxed">
                                  TruComm was founded in 2023 by a team of cybersecurity experts who witnessed the growing 
                                  threats to digital privacy. We recognized that existing communication tools were vulnerable 
                                  and decided to build something revolutionary.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaRocket className="text-2xl text-green-400" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white mb-2 font-heading">The Breakthrough</h3>
                                <p className="text-gray-300 leading-relaxed">
                                  After years of research and development, we created our proprietary BYOSS (Bring Your Own Storage System) 
                                  technology. This revolutionary approach completely reimagines how secure 
                                  communication works, offering unprecedented protection.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaGlobe className="text-2xl text-purple-400" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white mb-2 font-heading">Global Impact</h3>
                                <p className="text-gray-300 leading-relaxed">
                                  Today, TruComm serves thousands of users worldwide, from individual privacy advocates to 
                                  enterprise teams requiring military-grade security. Our technology has become the gold 
                                  standard for secure communication.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Values Tab */}
                  {activeTab === 'values' && (
                    <div className="space-y-12">
                      <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-heading leading-tight">
                          Our Values
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                          The principles that guide everything we do
                        </p>
                      </div>

                      <ChromaGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                            <FaShieldAlt className="text-2xl text-red-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3 font-heading">Security First</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            We never compromise on security. Every feature, every update, every decision is made with 
                            security as the top priority.
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                            <FaHeart className="text-2xl text-blue-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3 font-heading">Privacy by Design</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            We believe privacy is a fundamental right. Our technology is built from the ground up to 
                            protect user privacy without compromise.
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                            <FaCog className="text-2xl text-green-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3 font-heading">Innovation</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            We continuously push the boundaries of what's possible in secure communication, always 
                            staying ahead of emerging threats.
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
                            <FaUsers className="text-2xl text-yellow-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3 font-heading">Transparency</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            We believe in open communication with our users. We're transparent about our technology, 
                            our processes, and our commitment to security.
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                            <FaChartLine className="text-2xl text-purple-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3 font-heading">Excellence</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            We strive for excellence in everything we do, from our technology to our customer service, 
                            ensuring the best possible experience for our users.
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                            <GiTargetArrows className="text-2xl text-orange-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3 font-heading">User-Centric</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Our users are at the center of everything we do. We listen, we learn, and we continuously 
                            improve based on their needs and feedback.
                          </p>
                        </div>
                      </ChromaGrid>
                    </div>
                  )}

                  {/* Team Tab */}
                  {activeTab === 'team' && (
                    <div className="space-y-12">
                      <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-heading leading-tight">
                          Our Team
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                          World-class experts in cybersecurity, cryptography, and software engineering
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCode className="text-3xl text-blue-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 font-heading">Engineering Team</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Our engineering team consists of world-class developers and cryptographers with decades 
                            of combined experience in building secure systems.
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
                          <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaShieldAlt className="text-3xl text-green-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 font-heading">Security Experts</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Our security team includes former military cybersecurity specialists and industry 
                            veterans who have protected critical infrastructure worldwide.
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaRocket className="text-3xl text-purple-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 font-heading">Product Team</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Our product team ensures that cutting-edge security technology is accessible and 
                            user-friendly for everyone, from individuals to enterprises.
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-bold text-white mb-4 font-heading">Join Our Mission</h3>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                          We're always looking for passionate individuals who share our vision of a more secure digital world. 
                          If you're ready to make a difference, we'd love to hear from you.
                        </p>
                        <CosmicPortalButton
                          onClick={() => window.open('mailto:careers@trucomm.com', '_blank')}
                          className="w-full sm:w-auto"
                          label="View Open Positions"
                          showSystemIcon={true}
                        />
                      </div>
                    </div>
                  )}

                  {/* Technology Tab */}
                  {activeTab === 'technology' && (
                    <div className="space-y-12">
                      <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-heading leading-tight">
                          Our Technology
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                          Revolutionary security protocols that set new industry standards
                        </p>
                      </div>

                      {/* BYOSS Technology Card */}
                      <div className="mb-12">
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-2xl shadow-blue-500/20">
                          <div className="flex flex-col lg:flex-row items-center gap-8">
                            <div className="flex-1">
                              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                                Industry Exclusive
                              </div>
                              <h3 className="text-3xl font-bold text-white mb-4 font-heading">
                                BYOSS Technology
                              </h3>
                              <p className="text-gray-300 mb-6 leading-relaxed">
                                Our proprietary BYOSS (Bring Your Own Storage System) technology is the only 
                                industrial-level storage protocol that provides complete data sovereignty and control. 
                                This revolutionary approach ensures enterprise-grade storage security while 
                                maintaining lightning-fast data access speeds.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
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
                            <div className="w-full sm:w-64 lg:w-80 h-64 sm:h-80 bg-black rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl shadow-white/5">
                              <div className="text-center">
                                <Image
                                  src="/logo.png"
                                  alt="TruComm Logo"
                                  width={120}
                                  height={120}
                                  className="mx-auto mb-4"
                                  priority
                                />
                                <h4 className="text-xl font-bold text-white mb-2 font-heading">BYOSS</h4>
                                <p className="text-gray-400 text-sm">Revolutionary Security</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Security Features Grid */}
                      <ChromaGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                            <FaServer className="text-2xl text-white" />
                          </div>
                          <h4 className="text-xl font-bold text-white mb-3 font-heading">
                            4-Step Server Level EEE
                          </h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            End-to-End Security protocol with four layers of server-level protection ensuring complete data integrity.
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                            <GiCrossedSwords className="text-2xl text-white" />
                          </div>
                          <h4 className="text-xl font-bold text-white mb-3 font-heading">
                            Military Level Security
                          </h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Enterprise-grade security protocols that meet and exceed military standards for data protection.
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                            <FaLock className="text-2xl text-white" />
                          </div>
                          <h4 className="text-xl font-bold text-white mb-3 font-heading">
                            Dual AES-256
                          </h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Double-layered AES-256 encryption ensuring maximum security for all data transmissions.
                          </p>
                        </div>
                      </ChromaGrid>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-20 w-full py-20 px-4 sm:px-6 lg:px-8 bg-black">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-heading leading-tight">
                    By the Numbers
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Our impact in the world of secure communication
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-bold text-blue-400 mb-2 font-heading">10K+</div>
                    <div className="text-gray-300 text-sm sm:text-base">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-bold text-green-400 mb-2 font-heading">99.9%</div>
                    <div className="text-gray-300 text-sm sm:text-base">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-bold text-purple-400 mb-2 font-heading">50+</div>
                    <div className="text-gray-300 text-sm sm:text-base">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-bold text-orange-400 mb-2 font-heading">0</div>
                    <div className="text-gray-300 text-sm sm:text-base">Security Breaches</div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-20 w-full py-20 px-4 sm:px-6 lg:px-8">
              {/* Orb Background */}
              <div className="absolute inset-0 z-0">
                <Orb
                  hoverIntensity={0.5}
                  rotateOnHover={true}
                  hue={0}
                  forceHoverState={false}
                />
              </div>
              
              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-heading leading-tight">
                  Ready to Experience True Security?
                </h2>
                <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                  Join thousands of users who trust TruComm for their most sensitive communications
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <CosmicPortalButton
                    onClick={() => window.open('/signup', '_self')}
                    className="w-full sm:w-auto"
                    label="Get Started Free"
                    showSystemIcon={true}
                  />
                  <CosmicPortalButton
                    onClick={() => window.open('/pricing', '_self')}
                    className="w-full sm:w-auto"
                    label="View Pricing"
                    showSystemIcon={false}
                  />
                </div>
              </div>
            </section>
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
      </div>
    </ClickSpark>
  );
}
