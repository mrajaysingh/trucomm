'use client';

import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import CountdownTimer from './CountdownTimer';
import Image from 'next/image';
import Noise from './Noise';
import Aurora from './Aurora';
import ClickSpark from './ClickSpark';

interface PinProtectionProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PinProtection({ isOpen, onSuccess, onClose }: PinProtectionProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Check for PIN lockout
  useEffect(() => {
    const storedLockoutTime = localStorage.getItem('pinLockout');
    if (storedLockoutTime && Date.now() < parseInt(storedLockoutTime)) {
      setIsLocked(true);
      setLockoutTime(parseInt(storedLockoutTime));
      setError('PIN access temporarily locked.');
    }
  }, []);

  // Handle unlock when countdown reaches zero
  const handleUnlock = () => {
    setIsLocked(false);
    setLockoutTime(0);
    setError('');
    localStorage.removeItem('pinLockout');
    localStorage.removeItem('pinAttempts');
  };

  // Handle PIN input
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Allow digits and one letter (auto-capitalize)
    value = value.replace(/[^A-Za-z0-9]/g, ''); // Remove non-alphanumeric characters
    
    // Count letters and digits
    const letterCount = (value.match(/[A-Za-z]/g) || []).length;
    const digitCount = (value.match(/[0-9]/g) || []).length;
    
    // Allow max 1 letter and max 10 total characters
    if (letterCount <= 1 && value.length <= 10) {
      // Auto-capitalize the letter if present
      value = value.replace(/[a-z]/g, (match) => match.toUpperCase());
      setPin(value);
      if (error) setError('');
    }
  };

  // Handle PIN submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || isLocked || !pin.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/pin/verify-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear any lockout
        localStorage.removeItem('pinLockout');
        localStorage.removeItem('pinAttempts');
        onSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          // Lock for 15 minutes after 3 failed attempts
          const lockoutTime = Date.now() + (15 * 60 * 1000);
          localStorage.setItem('pinLockout', lockoutTime.toString());
          localStorage.setItem('pinAttempts', '0');
          setIsLocked(true);
          setError('Too many failed attempts. PIN access locked for 15 minutes.');
        } else {
          localStorage.setItem('pinAttempts', newAttempts.toString());
          setError(data.error || 'Invalid PIN. Please try again.');
        }
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ClickSpark
      sparkColor='#fff'
      sparkSize={8}
      sparkRadius={12}
      sparkCount={6}
      duration={300}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
        
        {/* Noise Background */}
        <div className="absolute inset-0 z-0">
          <Noise
            patternSize={200}
            patternScaleX={1}
            patternScaleY={1}
            patternRefreshInterval={3}
            patternAlpha={10}
          />
        </div>

        {/* Aurora Background */}
        <div className="absolute inset-0 z-10">
          <Aurora
            colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
            blend={0.3}
            amplitude={0.8}
            speed={0.3}
          />
        </div>

        {/* Normal cursor - TargetCursor removed */}
        
        {/* PIN Protection Modal */}
        <div className="relative z-20 w-full max-w-md pin-container">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl mb-4 shadow-2xl shadow-red-500/30">
                <FaLock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">PIN Protection</h2>
              <p className="text-gray-300 text-sm">Enter the security PIN to access admin login</p>
            </div>

            {/* PIN Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PIN Input */}
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-2">
                  Security PIN
                </label>
                <div className="relative">
                  <input
                    id="pin"
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={handlePinChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 pr-12 text-center text-lg tracking-widest"
                    placeholder="Enter PIN (e.g., 12345678B)"
                    required
                    disabled={isLoading || isLocked}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    disabled={isLoading || isLocked}
                  >
                    {showPin ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-red-400 text-sm flex items-center font-medium mb-2">
                    <FaExclamationTriangle className="w-4 h-4 mr-3 flex-shrink-0" />
                    {error}
                  </p>
                  {isLocked && lockoutTime > 0 && (
                    <CountdownTimer 
                      lockoutTime={lockoutTime} 
                      onUnlock={handleUnlock}
                      className="text-red-300"
                    />
                  )}
                </div>
              )}

              {/* Attempts Counter */}
              {attempts > 0 && attempts < 3 && !isLocked && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-yellow-400 text-sm font-medium">
                    ⚠️ Failed attempts: {attempts}/3. Access will be locked after 3 failed attempts.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !pin.trim() || isLocked}
                className="animated-button w-full mb-6 sm:mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    <span className="text">Verifying...</span>
                    <div className="circle"></div>
                  </>
                ) : isLocked ? (
                  <>
                    <FaLock className="w-5 h-5" />
                    <span className="text">Access Locked</span>
                    <div className="circle"></div>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
                    </svg>
                    <span className="text">Verify PIN</span>
                    <div className="circle"></div>
                    <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-gray-500 text-xs">
                Secure access required for admin portal
              </p>
            </div>
          </div>
        </div>
      </div>
    </ClickSpark>
  );
}
