'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { FaShieldAlt, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaLock, FaUser } from 'react-icons/fa';
import Image from 'next/image';
import Noise from '../../components/Noise';
import Aurora from '../../components/Aurora';
import ClickSpark from '../../components/ClickSpark';
import PinProtection from '../../components/PinProtection';
import CountdownTimer from '../../components/CountdownTimer';
import './login-animations.css';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [showPinProtection, setShowPinProtection] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);

  const { login, isAuthenticated, isSuperAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated and is super admin
  useEffect(() => {
    if (!authLoading && isAuthenticated && isSuperAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, isSuperAdmin, authLoading, router]);

  // Show PIN protection on page load
  useEffect(() => {
    const pinVerified = localStorage.getItem('pinVerified');
    if (!pinVerified) {
      setShowPinProtection(true);
    } else {
      setPinVerified(true);
    }
  }, []);

  // Check for account lockout
  useEffect(() => {
    const storedLockoutTime = localStorage.getItem('loginLockout');
    if (storedLockoutTime && Date.now() < parseInt(storedLockoutTime)) {
      setIsLocked(true);
      setLockoutTime(parseInt(storedLockoutTime));
      setError('Account temporarily locked.');
    }
  }, []);

  // Handle unlock when countdown reaches zero
  const handleUnlock = () => {
    setIsLocked(false);
    setLockoutTime(0);
    setError('');
    localStorage.removeItem('loginLockout');
    localStorage.removeItem('failedAttempts');
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear email error when user starts typing
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
    
    // Clear general errors
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear password error when user starts typing
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: undefined }));
    }
    
    // Clear general errors
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Handle PIN protection success
  const handlePinSuccess = () => {
    localStorage.setItem('pinVerified', 'true');
    setPinVerified(true);
    setShowPinProtection(false);
  };

  // Handle PIN protection close
  const handlePinClose = () => {
    // Don't allow closing without verification
    if (!pinVerified) {
      return;
    }
  };


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submitted with:', { email, password: '***' });
    
    if (isSubmitting || isLocked) {
      console.log('❌ Form submission blocked:', { isSubmitting, isLocked });
      return;
    }

    // Clear previous messages
    setError('');
    setSuccess('');
    setFormErrors({});

    // Validate form
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed, starting login...');
    setIsSubmitting(true);

    try {
      console.log('📞 Calling login function...');
      const result = await login(email.trim(), password);
      console.log('📥 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, checking user role...');
        // Check if user is super admin
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('👤 User data:', user);
        
        if (user.designation === 'ADMIN') {
          console.log('✅ User is admin, redirecting...');
          setSuccess('Login successful! Redirecting...');
          // Clear any lockout
          localStorage.removeItem('loginLockout');
          localStorage.removeItem('failedAttempts');
          
          // Redirect after a short delay
          setTimeout(() => {
            console.log('🔄 Redirecting to dashboard...');
            router.push('/admin/dashboard');
          }, 1000);
        } else {
          console.log('❌ User is not admin, access denied');
          setError('Access denied. Super admin privileges required.');
          // Logout non-admin users
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } else {
        console.log('❌ Login failed:', result.error);
        // Handle failed login attempts
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          // Lock account for 15 minutes after 3 failed attempts
          const lockoutTime = Date.now() + (15 * 60 * 1000);
          localStorage.setItem('loginLockout', lockoutTime.toString());
          localStorage.setItem('failedAttempts', '0');
          setIsLocked(true);
          setError('Too many failed attempts. Account locked for 15 minutes.');
        } else {
          localStorage.setItem('failedAttempts', newAttempts.toString());
          setError(result.error || 'Invalid credentials. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <FaSpinner className="animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Show PIN protection if not verified
  if (showPinProtection && !pinVerified) {
    return (
      <PinProtection
        isOpen={showPinProtection}
        onSuccess={handlePinSuccess}
        onClose={handlePinClose}
      />
    );
  }

  return (
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Noise Background */}
        <div className="absolute inset-0 z-0">
          <Noise
            patternSize={250}
            patternScaleX={1}
            patternScaleY={1}
            patternRefreshInterval={2}
            patternAlpha={15}
          />
        </div>

        {/* Aurora Background */}
        <div className="absolute inset-0 z-10">
          <Aurora
            colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl floating-element-1"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating-element-2"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-red-500/10 rounded-full blur-3xl floating-element-3"></div>
        
        {/* Normal cursor - TargetCursor removed */}
        
        <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-12 login-container">
          <div className="w-full max-w-md">
            {/* Header with TruComm Logo */}
            <div className="text-center mb-8">
              <div className="logo-container inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 transform hover:scale-105 transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="TruComm Logo"
                  width={64}
                  height={64}
                  className="w-16 h-16"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">TruComm Admin</h1>
              <p className="text-gray-400 text-sm">Secure Access Portal</p>
            </div>

            {/* Login Form */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Software Login Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`input-field w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      formErrors.email 
                        ? 'border-red-500 focus:ring-red-500 field-error' 
                        : 'border-white/20 focus:ring-blue-500'
                    }`}
                    placeholder="admin@trucomm.com"
                    required
                    disabled={isSubmitting || isLocked}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <FaExclamationTriangle className="w-3 h-3 mr-1" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      className={`input-field w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 pr-12 ${
                        formErrors.password 
                          ? 'border-red-500 focus:ring-red-500 field-error' 
                          : 'border-white/20 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your password"
                      required
                      disabled={isSubmitting || isLocked}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                      disabled={isSubmitting || isLocked}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <FaExclamationTriangle className="w-3 h-3 mr-1" />
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="error-message bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
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

                {/* Success Message */}
                {success && (
                  <div className="success-message bg-green-500/10 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-green-400 text-sm flex items-center font-medium">
                      <FaCheckCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                      {success}
                    </p>
                  </div>
                )}

                {/* Attempts Counter */}
                {attempts > 0 && attempts < 3 && !isLocked && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-yellow-400 text-sm font-medium">
                      ⚠️ Failed attempts: {attempts}/3. Account will be locked after 3 failed attempts.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !email || !password || isLocked}
                  className="login-button w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02] disabled:transform-none disabled:shadow-none group"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="spinner-enhanced w-5 h-5" />
                      <span className="text-lg">Signing in...</span>
                    </>
                  ) : isLocked ? (
                    <>
                      <FaLock className="w-5 h-5" />
                      <span className="text-lg">Account Locked</span>
                    </>
                  ) : (
                    <>
                      <FaShieldAlt className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="text-lg">Access Admin Portal</span>
                    </>
                  )}
                </button>
            </form>

            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">
                © 2024 TruComm. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ClickSpark>
  );
}
