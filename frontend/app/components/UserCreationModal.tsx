'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaEyeSlash, FaRandom, FaDownload, FaCheck, FaArrowRight, FaArrowLeft, FaUser, FaBuilding, FaCreditCard, FaShieldAlt } from 'react-icons/fa';
import Noise from './Noise';

interface UserCreationData {
  // Step 1: Personal & Company Details
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  designation: string;
  companyName: string;
  companyId: string;
  companyAddress: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Plan & Payment Details
  planId: string;
  softwareLoginEmail: string;
  mmid: string;
  purchaseDate: string;
  purchaseTime: string;
  transactionId: string;
  paymentMethod: string;
  amountPaid: string;
  
  // Step 3: Confirmation
  agreeToTerms: boolean;
}

interface UserCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const PLANS = [
  { id: 'xcomm', name: 'XComm', price: 999 },
  { id: 'xcomm-pro', name: 'XComm Pro', price: 1999 },
  { id: 'xcomm-elite', name: 'XComm Elite', price: 2999 }
];

const PAYMENT_METHODS = [
  'PhonePay',
  'GooglePay', 
  'Paytm',
  'UPI',
  'Cash'
];

const DESIGNATIONS = [
  'CEO',
  'HR',
  'EMPLOYEE'
];

export default function UserCreationModal({ isOpen, onClose, onUserCreated }: UserCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserCreationData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    designation: 'EMPLOYEE',
    companyName: '',
    companyId: '',
    companyAddress: '',
    password: '',
    confirmPassword: '',
    planId: '',
    softwareLoginEmail: '',
    mmid: '',
    purchaseDate: '',
    purchaseTime: '',
    transactionId: '',
    paymentMethod: '',
    amountPaid: '',
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserData(prev => ({ ...prev, password }));
  };

  // Generate random MMID
  const generateRandomMMID = () => {
    const mmid = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setUserData(prev => ({ ...prev, mmid }));
  };

  // Auto-generate software login email
  useEffect(() => {
    if (userData.username && userData.email) {
      const softwareEmail = `${userData.username}_${userData.mmid || 'temp'}@trucomm.com`;
      setUserData(prev => ({ ...prev, softwareLoginEmail: softwareEmail }));
    }
  }, [userData.username, userData.email, userData.mmid]);

  // Set current date and time
  useEffect(() => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);
    setUserData(prev => ({ 
      ...prev, 
      purchaseDate: date,
      purchaseTime: time
    }));
  }, []);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!userData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!userData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!userData.username.trim()) newErrors.username = 'Username is required';
    if (!userData.email.trim()) newErrors.email = 'Email is required';
    if (!userData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!userData.companyId.trim()) newErrors.companyId = 'Company ID is required';
    if (!userData.companyAddress.trim()) newErrors.companyAddress = 'Company address is required';
    if (!userData.password) newErrors.password = 'Password is required';
    if (userData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!userData.planId) newErrors.planId = 'Please select a plan';
    if (!userData.softwareLoginEmail.trim()) newErrors.softwareLoginEmail = 'Software login email is required';
    if (!userData.mmid.trim()) newErrors.mmid = 'MMID is required';
    if (!userData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!userData.purchaseTime) newErrors.purchaseTime = 'Purchase time is required';
    if (!userData.transactionId.trim()) newErrors.transactionId = 'Transaction ID is required';
    if (!userData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    if (!userData.amountPaid) newErrors.amountPaid = 'Amount paid is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!userData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    
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
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          currentIP: 'MANUAL',
          userAgent: navigator.userAgent
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Generate JSON file
        const jsonData = {
          userDetails: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            email: userData.email,
            designation: userData.designation,
            companyName: userData.companyName,
            companyId: userData.companyId,
            companyAddress: userData.companyAddress,
            softwareLoginEmail: userData.softwareLoginEmail,
            mmid: userData.mmid,
            password: userData.password
          },
          planDetails: {
            planId: userData.planId,
            planName: PLANS.find(p => p.id === userData.planId)?.name,
            amountPaid: userData.amountPaid
          },
          paymentDetails: {
            transactionId: userData.transactionId,
            paymentMethod: userData.paymentMethod,
            purchaseDate: userData.purchaseDate,
            purchaseTime: userData.purchaseTime
          },
          metadata: {
            createdBy: 'Manual Admin Creation',
            createdAt: new Date().toISOString(),
            currentIP: 'MANUAL'
          }
        };
        
        // Download JSON file
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-${userData.username}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('User created successfully and JSON file downloaded!');
        onUserCreated();
        onClose();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('An error occurred while creating user');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof UserCreationData, value: string | boolean) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden border border-blue-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-500/30 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <FaUser className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Create New User</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center p-3 border-b border-blue-500/30 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                currentStep >= step 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 border-blue-400 text-white shadow-lg shadow-blue-500/30' 
                  : 'border-blue-500/50 text-blue-400/70'
              }`}>
                {currentStep > step ? <FaCheck className="w-4 h-4" /> : <span className="text-sm font-semibold">{step}</span>}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${
                  currentStep > step ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-blue-500/30'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-3">
                  <FaUser className="w-4 h-4 text-blue-400" />
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Personal & Company Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">First Name *</label>
                  <input
                    type="text"
                    value={userData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Last Name *</label>
                  <input
                    type="text"
                    value={userData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Username *</label>
                  <input
                    type="text"
                    value={userData.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                    placeholder="Enter username"
                  />
                  {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Email *</label>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-blue-300">Designation *</label>
                <select
                  value={userData.designation}
                  onChange={(e) => updateField('designation', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white"
                >
                  {DESIGNATIONS.map(designation => (
                    <option key={designation} value={designation} className="bg-gray-800">{designation}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Company Name *</label>
                  <input
                    type="text"
                    value={userData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                    placeholder="Enter company name"
                  />
                  {errors.companyName && <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Company ID *</label>
                  <input
                    type="text"
                    value={userData.companyId}
                    onChange={(e) => updateField('companyId', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                    placeholder="Enter company ID"
                  />
                  {errors.companyId && <p className="text-red-400 text-sm mt-1">{errors.companyId}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-blue-300">Company Address *</label>
                <textarea
                  value={userData.companyAddress}
                  onChange={(e) => updateField('companyAddress', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                  placeholder="Enter company address"
                  rows={2}
                />
                {errors.companyAddress && <p className="text-red-400 text-sm mt-1">{errors.companyAddress}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={userData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="w-full px-3 py-2 pr-16 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                      placeholder="Enter password"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-blue-400 hover:text-purple-400 p-1 rounded transition-colors"
                        title="Generate random password"
                      >
                        <FaRandom className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-blue-400 p-1 rounded transition-colors"
                      >
                        {showPassword ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={userData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 p-1 rounded transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 mr-3">
                  <FaBuilding className="w-4 h-4 text-green-400" />
                </div>
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Plan Assignment & Payment Details</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-blue-300">Select Plan *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PLANS.map(plan => (
                    <div
                      key={plan.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                        userData.planId === plan.id
                          ? 'border-blue-400 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg shadow-blue-500/30'
                          : 'border-blue-500/30 hover:border-blue-400/50 hover:bg-blue-500/5'
                      }`}
                      onClick={() => updateField('planId', plan.id)}
                    >
                      <h4 className="font-semibold text-base text-white">{plan.name}</h4>
                      <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">₹{plan.price}</p>
                    </div>
                  ))}
                </div>
                {errors.planId && <p className="text-red-400 text-sm mt-1">{errors.planId}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Software Login Email *</label>
                  <input
                    type="email"
                    value={userData.softwareLoginEmail}
                    onChange={(e) => updateField('softwareLoginEmail', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                    placeholder="Auto-generated email"
                  />
                  {errors.softwareLoginEmail && <p className="text-red-400 text-sm mt-1">{errors.softwareLoginEmail}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">MMID *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userData.mmid}
                      onChange={(e) => updateField('mmid', e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                      placeholder="Auto-generated MMID"
                    />
                    <button
                      type="button"
                      onClick={generateRandomMMID}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-purple-400 p-1 rounded transition-colors"
                      title="Generate random MMID"
                    >
                      <FaRandom className="w-3 h-3" />
                    </button>
                  </div>
                  {errors.mmid && <p className="text-red-400 text-sm mt-1">{errors.mmid}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Purchase Date *</label>
                  <input
                    type="date"
                    value={userData.purchaseDate}
                    onChange={(e) => updateField('purchaseDate', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white"
                  />
                  {errors.purchaseDate && <p className="text-red-400 text-sm mt-1">{errors.purchaseDate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Purchase Time *</label>
                  <input
                    type="time"
                    value={userData.purchaseTime}
                    onChange={(e) => updateField('purchaseTime', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white"
                  />
                  {errors.purchaseTime && <p className="text-red-400 text-sm mt-1">{errors.purchaseTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Transaction ID *</label>
                  <input
                    type="text"
                    value={userData.transactionId}
                    onChange={(e) => updateField('transactionId', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                    placeholder="Enter transaction ID"
                  />
                  {errors.transactionId && <p className="text-red-400 text-sm mt-1">{errors.transactionId}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-300">Payment Method *</label>
                  <select
                    value={userData.paymentMethod}
                    onChange={(e) => updateField('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white"
                  >
                    <option value="" className="bg-gray-800">Select payment method</option>
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method} className="bg-gray-800">{method}</option>
                    ))}
                  </select>
                  {errors.paymentMethod && <p className="text-red-400 text-sm mt-1">{errors.paymentMethod}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-blue-300">Amount Paid *</label>
                <input
                  type="number"
                  value={userData.amountPaid}
                  onChange={(e) => updateField('amountPaid', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400"
                  placeholder="Enter amount paid"
                  min="0"
                  step="0.01"
                />
                {errors.amountPaid && <p className="text-red-400 text-sm mt-1">{errors.amountPaid}</p>}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 mr-3">
                  <FaShieldAlt className="w-4 h-4 text-purple-400" />
                </div>
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Preview & Confirmation</span>
              </h3>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-blue-900/20 rounded-lg p-4 space-y-3 border border-blue-500/20">
                <h4 className="text-base font-semibold mb-3 text-blue-300">User Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Full Name</label>
                    <p className="text-white font-medium">{userData.firstName} {userData.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Username</label>
                    <p className="text-white font-medium">{userData.username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white font-medium">{userData.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Designation</label>
                    <p className="text-white font-medium">{userData.designation}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Company Name</label>
                    <p className="text-white font-medium">{userData.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Company ID</label>
                    <p className="text-white font-medium">{userData.companyId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Password</label>
                    <p className="text-white font-medium font-mono">{userData.password}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">MMID</label>
                    <p className="text-white font-medium font-mono">{userData.mmid}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 rounded-lg p-4 space-y-3 border border-purple-500/20">
                <h4 className="text-base font-semibold mb-3 text-purple-300">Plan & Payment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Selected Plan</label>
                    <p className="text-white font-medium">{PLANS.find(p => p.id === userData.planId)?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Amount Paid</label>
                    <p className="text-white font-medium">₹{userData.amountPaid}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Transaction ID</label>
                    <p className="text-white font-medium">{userData.transactionId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Payment Method</label>
                    <p className="text-white font-medium">{userData.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Purchase Date</label>
                    <p className="text-white font-medium">{userData.purchaseDate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Purchase Time</label>
                    <p className="text-white font-medium">{userData.purchaseTime}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={userData.agreeToTerms}
                  onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
                  I agree to the terms and conditions and confirm that all information provided is accurate.
                  I understand that this will create a user account with the specified plan and payment details.
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-red-400 text-sm">{errors.agreeToTerms}</p>}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between p-4 border-t border-blue-500/30 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
              currentStep === 1
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-lg'
            }`}
          >
            <FaArrowLeft className="w-3 h-3 mr-2" />
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              Next
              <FaArrowRight className="w-3 h-3 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !userData.agreeToTerms}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                isLoading || !userData.agreeToTerms
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg shadow-green-500/30'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <FaDownload className="w-3 h-3 mr-2" />
                  Create User & Download JSON
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
