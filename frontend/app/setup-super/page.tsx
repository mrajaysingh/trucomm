'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCheck, FaArrowRight, FaArrowLeft, FaShieldAlt, FaGlobe, FaClock } from 'react-icons/fa';
import Noise from '../components/Noise';

interface SetupData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: PIN Protection
  unlockPin: string;
  confirmUnlockPin: string;
  
  // Step 3: Preview & Confirmation
  agreeToTerms: boolean;
}

interface SetupErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  unlockPin?: string;
  confirmUnlockPin?: string;
  agreeToTerms?: string;
}

export default function SetupSuperAdmin() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState<SetupData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    unlockPin: '',
    confirmUnlockPin: '',
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SetupErrors>({});
  const [userIP, setUserIP] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Get user IP and update time
  useEffect(() => {
    const getIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIP(data.ip);
      } catch (error) {
        console.error('Error fetching IP:', error);
        setUserIP('Unable to fetch IP');
      }
    };
    
    getIP();
    
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const validateStep1 = (): boolean => {
    const newErrors: SetupErrors = {};
    
    if (!setupData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!setupData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!setupData.username.trim()) newErrors.username = 'Username is required';
    if (!setupData.email.trim()) newErrors.email = 'Email is required';
    if (!setupData.password) newErrors.password = 'Password is required';
    if (setupData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (setupData.password !== setupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: SetupErrors = {};
    
    if (!setupData.unlockPin) newErrors.unlockPin = 'Unlock PIN is required';
    if (setupData.unlockPin.length !== 9) newErrors.unlockPin = 'PIN must be exactly 9 characters';
    if (!/^[0-9]{8}[A-Za-z]$/.test(setupData.unlockPin)) {
      newErrors.unlockPin = 'PIN must be 8 numbers followed by 1 letter';
    }
    if (setupData.unlockPin !== setupData.confirmUnlockPin) {
      newErrors.confirmUnlockPin = 'PINs do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: SetupErrors = {};
    
    if (!setupData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/setup-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...setupData,
          currentIP: userIP,
          setupPageUrlAlias: '/setup-super'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Super Admin created successfully!');
        router.push('/admin/login');
      } else {
        alert(data.error || 'Failed to create Super Admin');
      }
    } catch (error) {
      console.error('Error creating Super Admin:', error);
      alert('An error occurred while creating Super Admin');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof SetupData, value: string | boolean) => {
    setSetupData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Noise Background */}
      <div className="absolute inset-0 w-full h-full">
        <Noise
          patternSize={250}
          patternScaleX={1}
          patternScaleY={1}
          patternRefreshInterval={2}
          patternAlpha={15}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FaShieldAlt className="w-12 h-12 text-blue-400 mr-3" />
              <h1 className="text-4xl font-bold">Super Admin Setup</h1>
            </div>
            <p className="text-gray-400">Configure your super administrator account</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep > step ? <FaCheck className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-600'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-lg p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      value={setupData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter first name"
                    />
                    {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={setupData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter last name"
                    />
                    {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Username *</label>
                  <input
                    type="text"
                    value={setupData.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                  {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={setupData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={setupData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={setupData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6">PIN Protection Setup</h2>
                
                <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <FaLock className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="font-medium">Security Information</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Set up a 9-character PIN (8 numbers + 1 letter) for additional security. This PIN will be required for certain administrative actions.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Unlock PIN *</label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={setupData.unlockPin}
                      onChange={(e) => updateField('unlockPin', e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter 9-character PIN (8 numbers + 1 letter)"
                      maxLength={9}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPin ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.unlockPin && <p className="text-red-400 text-sm mt-1">{errors.unlockPin}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Unlock PIN *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      value={setupData.confirmUnlockPin}
                      onChange={(e) => updateField('confirmUnlockPin', e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm 9-character PIN"
                      maxLength={9}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPin ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmUnlockPin && <p className="text-red-400 text-sm mt-1">{errors.confirmUnlockPin}</p>}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6">Preview & Confirmation</h2>
                
                <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Account Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Full Name</label>
                      <p className="text-white font-medium">{setupData.firstName} {setupData.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Username</label>
                      <p className="text-white font-medium">{setupData.username}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white font-medium">{setupData.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Password</label>
                      <p className="text-white font-medium font-mono">{setupData.password}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Unlock PIN</label>
                      <p className="text-white font-medium font-mono">{setupData.unlockPin}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold mb-4">System Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <FaGlobe className="w-5 h-5 text-blue-400 mr-3" />
                      <div>
                        <label className="text-sm text-gray-400">Current IP Address</label>
                        <p className="text-white font-medium">{userIP}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="w-5 h-5 text-green-400 mr-3" />
                      <div>
                        <label className="text-sm text-gray-400">Creation Timestamp</label>
                        <p className="text-white font-medium">{currentTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaShieldAlt className="w-5 h-5 text-purple-400 mr-3" />
                      <div>
                        <label className="text-sm text-gray-400">Setup Page URL</label>
                        <p className="text-white font-medium">/setup-super</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={setupData.agreeToTerms}
                    onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
                    I agree to the terms and conditions and confirm that all information provided is accurate.
                    I understand that this will create a super administrator account with full system access.
                  </label>
                </div>
                {errors.agreeToTerms && <p className="text-red-400 text-sm">{errors.agreeToTerms}</p>}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next
                  <FaArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !setupData.agreeToTerms}
                  className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                    isLoading || !setupData.agreeToTerms
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaCheck className="w-4 h-4 mr-2" />
                      Create Super Admin
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
