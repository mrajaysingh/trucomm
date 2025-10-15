"use client";

import React, { useState } from 'react';
import { FaBug, FaCheckCircle, FaClock, FaCode, FaShieldAlt, FaRocket, FaTools, FaLock, FaBuilding, FaPhone, FaBook, FaMobile, FaPlug, FaCrosshairs, FaGlobe, FaTrophy, FaBolt, FaPalette, FaSearch, FaUsers, FaChartBar, FaClipboardList } from 'react-icons/fa';
import { MdSecurity, MdBugReport, MdNewReleases } from 'react-icons/md';

interface BugReport {
  id: string;
  name: string;
  description: string;
  foundBy: string;
  foundDate: string;
  fixedDate: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Fixed' | 'In Progress' | 'Open';
}

interface Release {
  version: string;
  date: string;
  type: 'Major' | 'Minor' | 'Patch' | 'Security';
  title: string;
  description: string;
  features: string[];
  bugFixes: BugReport[];
  isUpcoming?: boolean;
}

const changelogData: Release[] = [
  {
    version: "1.0.0",
    date: "2025-10-15",
    type: "Major",
    title: "Official Launch - Public Release",
    description: "The highly anticipated public launch of TruComm with revolutionary BYOSS technology and enterprise-grade security.",
    isUpcoming: true,
    features: [
      "Complete BYOSS (Bring Your Own Storage System) technology suite",
      "Full enterprise deployment capabilities",
      "24/7 customer support and dedicated onboarding",
      "Complete documentation and developer API access",
      "Native mobile applications for iOS and Android",
      "Integration marketplace with 50+ connectors",
      "Advanced AI-powered threat detection",
      "Multi-language support (10+ languages)"
    ],
    bugFixes: []
  },
  {
    version: "0.9.5",
    date: "2025-02-28",
    type: "Security",
    title: "Final Security Certification - Release Candidate",
    description: "Final security validation and performance optimization before public launch.",
    isUpcoming: true,
    features: [
      "Complete penetration testing validation",
      "Final SOC 2 Type II compliance certification",
      "Performance optimization for 100,000+ concurrent users",
      "Final UI/UX polish and accessibility improvements",
      "Advanced audit logging and compliance reporting"
    ],
    bugFixes: []
  },
  {
    version: "0.9.0",
    date: "2025-02-10",
    type: "Major",
    title: "Open Beta Launch - Public Preview",
    description: "Public beta release showcasing complete BYOSS technology implementation.",
    isUpcoming: true,
    features: [
      "Full BYOSS protocol implementation",
      "4-Layer Server Level EEE security",
      "Military-grade dual AES-256 encryption",
      "Real-time collaboration suite",
      "Advanced admin dashboard with analytics",
      "Comprehensive audit logging system"
    ],
    bugFixes: []
  },
  {
    version: "Launch Preparation",
    date: "2025-01-30",
    type: "Major",
    title: "Pre-Launch Milestone Achieved",
    description: "All major development milestones completed successfully. Ready for beta testing phase.",
    features: [
      "Core BYOSS technology development completed",
      "Security architecture fully implemented",
      "User interface and experience finalized",
      "Enterprise features ready for deployment",
      "Quality assurance testing completed",
      "Infrastructure scaled for global launch"
    ],
    bugFixes: []
  }
];

const Changelog: React.FC = () => {
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Major' | 'Minor' | 'Patch' | 'Security'>('All');

  const filteredReleases = filterType === 'All' 
    ? changelogData 
    : changelogData.filter(release => release.type === filterType);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'High': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Major': return <FaRocket className="w-4 h-4" />;
      case 'Minor': return <FaCode className="w-4 h-4" />;
      case 'Patch': return <FaTools className="w-4 h-4" />;
      case 'Security': return <FaShieldAlt className="w-4 h-4" />;
      default: return <MdNewReleases className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Major': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Minor': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Patch': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Security': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes('byoss') || feature.toLowerCase().includes('security')) {
      return <FaLock className="w-3 h-3 text-blue-400" />;
    }
    if (feature.toLowerCase().includes('enterprise') || feature.toLowerCase().includes('deployment')) {
      return <FaBuilding className="w-3 h-3 text-blue-400" />;
    }
    if (feature.toLowerCase().includes('support') || feature.toLowerCase().includes('customer')) {
      return <FaPhone className="w-3 h-3 text-green-400" />;
    }
    if (feature.toLowerCase().includes('documentation') || feature.toLowerCase().includes('api')) {
      return <FaBook className="w-3 h-3 text-blue-400" />;
    }
    if (feature.toLowerCase().includes('mobile') || feature.toLowerCase().includes('applications')) {
      return <FaMobile className="w-3 h-3 text-blue-400" />;
    }
    if (feature.toLowerCase().includes('integration') || feature.toLowerCase().includes('connectors')) {
      return <FaPlug className="w-3 h-3 text-green-400" />;
    }
    if (feature.toLowerCase().includes('threat') || feature.toLowerCase().includes('detection')) {
      return <FaCrosshairs className="w-3 h-3 text-red-400" />;
    }
    if (feature.toLowerCase().includes('language') || feature.toLowerCase().includes('multi')) {
      return <FaGlobe className="w-3 h-3 text-blue-400" />;
    }
    if (feature.toLowerCase().includes('testing') || feature.toLowerCase().includes('validation')) {
      return <FaCheckCircle className="w-3 h-3 text-green-400" />;
    }
    if (feature.toLowerCase().includes('compliance') || feature.toLowerCase().includes('soc')) {
      return <FaTrophy className="w-3 h-3 text-yellow-400" />;
    }
    if (feature.toLowerCase().includes('performance') || feature.toLowerCase().includes('optimization')) {
      return <FaBolt className="w-3 h-3 text-yellow-400" />;
    }
    if (feature.toLowerCase().includes('ui') || feature.toLowerCase().includes('ux') || feature.toLowerCase().includes('interface')) {
      return <FaPalette className="w-3 h-3 text-purple-400" />;
    }
    if (feature.toLowerCase().includes('audit') || feature.toLowerCase().includes('logging')) {
      return <FaSearch className="w-3 h-3 text-blue-400" />;
    }
    if (feature.toLowerCase().includes('collaboration') || feature.toLowerCase().includes('real-time')) {
      return <FaUsers className="w-3 h-3 text-green-400" />;
    }
    if (feature.toLowerCase().includes('dashboard') || feature.toLowerCase().includes('analytics')) {
      return <FaChartBar className="w-3 h-3 text-blue-400" />;
    }
    if (feature.toLowerCase().includes('comprehensive') || feature.toLowerCase().includes('system')) {
      return <FaClipboardList className="w-3 h-3 text-blue-400" />;
    }
    if (feature.toLowerCase().includes('encryption') || feature.toLowerCase().includes('military')) {
      return <FaShieldAlt className="w-3 h-3 text-red-400" />;
    }
    // Default icon
    return <FaCheckCircle className="w-3 h-3 text-green-400" />;
  };

  return (
    <section className="relative z-20 w-full min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-heading leading-tight">
            Development Roadmap & Updates
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Follow our development journey from initial concept to public launch
          </p>
          
          {/* Launch Countdown Indicator */}
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 mb-8">
            <div className="relative">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
            <span className="text-blue-400 font-medium">Official Launch Coming October 2025</span>
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-1 h-4 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-1 h-4 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {(['All', 'Major', 'Minor', 'Patch', 'Security'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterType === type
                  ? 'bg-[#0f1923] text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-[#ff4655] hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Releases Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 opacity-20"></div>
          
          <div className="space-y-8">
            {filteredReleases.map((release, index) => (
              <div key={release.version} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute left-6 w-4 h-4 rounded-full border-2 ${
                  release.isUpcoming 
                    ? 'bg-green-400 border-green-400 animate-pulse shadow-lg shadow-green-400/50' 
                    : 'bg-blue-500 border-blue-500'
                }`}>
                  {release.isUpcoming && (
                    <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  )}
                </div>

                {/* Release Card */}
                <div className="ml-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  {/* Release Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <span className="text-2xl font-bold text-white">v{release.version}</span>
                      {release.isUpcoming && (
                        <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                          Upcoming
                        </span>
                      )}
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getTypeColor(release.type)}`}>
                        {getTypeIcon(release.type)}
                        {release.type}
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{new Date(release.date).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{release.title}</h3>
                  <p className="text-gray-300 mb-4">{release.description}</p>

                  {/* Features */}
                  {release.features.length > 0 && (
                    <div className="mb-4">
                      <h4 className="flex items-center gap-2 text-white font-semibold mb-3">
                        <FaCheckCircle className="text-green-400 w-4 h-4" />
                        New Features
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {release.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                            <span className="mt-0.5 flex-shrink-0">{getFeatureIcon(feature)}</span>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bug Fixes */}
                  {release.bugFixes.length > 0 && (
                    <div className="mb-4">
                      <h4 className="flex items-center gap-2 text-white font-semibold mb-3">
                        <MdBugReport className="text-red-400 w-4 h-4" />
                        Bug Fixes ({release.bugFixes.length})
                      </h4>
                      <button
                        onClick={() => setSelectedRelease(selectedRelease?.version === release.version ? null : release)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                      >
                        {selectedRelease?.version === release.version ? 'Hide Details' : 'View Details'}
                      </button>
                      
                      {selectedRelease?.version === release.version && (
                        <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                          {release.bugFixes.map((bug) => (
                            <div key={bug.id} className="bg-black/20 border border-white/5 rounded-lg p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
                                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                  <span className="font-semibold text-white">{bug.name}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(bug.severity)}`}>
                                    {bug.severity}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">ID: {bug.id}</span>
                              </div>
                              <p className="text-sm text-gray-300 mb-3">{bug.description}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400">Found by:</span>
                                  <span className="text-white">{bug.foundBy}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400">Found:</span>
                                  <span className="text-white">{new Date(bug.foundDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400">Fixed:</span>
                                  <span className="text-green-400">{new Date(bug.fixedDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Statistics */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaRocket className="text-green-400 w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">100%</div>
            <div className="text-sm text-gray-400">Development Complete</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaShieldAlt className="text-blue-400 w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">256-bit</div>
            <div className="text-sm text-gray-400">Military Grade Encryption</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MdSecurity className="text-white w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">Zero</div>
            <div className="text-sm text-gray-400">Security Vulnerabilities</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaClock className="text-blue-300 w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round((new Date('2025-10-15').getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-gray-400">Days Until Launch</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Changelog;
