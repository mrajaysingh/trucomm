"use client";

import { useState, useEffect } from 'react';
import { IoClose, IoDownload, IoCheckmarkCircle, IoAlertCircle } from 'react-icons/io5';

interface Plan {
  id: string;
  name: string;
  type: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  description: string;
  price: number;
  features: string[];
  duration: number;
}

interface PurchaseModalProps {
  plan: Plan;
  onClose: () => void;
}

interface CouponValidation {
  valid: boolean;
  discount: number;
  coupon?: {
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
  };
}

export default function PurchaseModal({ plan, onClose }: PurchaseModalProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    designation: 'EMPLOYEE' as 'ADMIN' | 'CEO' | 'HR' | 'EMPLOYEE'
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState<CouponValidation | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<any>(null);

  // Calculate pricing
  const baseAmount = plan.price;
  const discountAmount = couponValidation?.discount || 0;
  const amountAfterDiscount = baseAmount - discountAmount;
  const gstAmount = Math.round((amountAfterDiscount * 0.18) * 100) / 100;
  const totalAmount = amountAfterDiscount + gstAmount;

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponValidation(null);
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          amount: baseAmount
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setCouponValidation(data);
        setError('');
      } else {
        setCouponValidation({ valid: false, discount: 0 });
        setError(data.error);
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setError('Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (couponCode.trim()) {
        validateCoupon();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [couponCode]);

  // Test backend connectivity
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setError('');

    // Test backend connection first
    const isBackendOnline = await testBackendConnection();
    if (!isBackendOnline) {
        setError('Backend server is not running. Please start the server on port 5000.');
      setStep('error');
      return;
    }

    try {
      // Add retry logic for network issues
      let response;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/purchase/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...formData,
              planId: plan.id,
              couponCode: couponCode.trim() || null,
              paymentMethod: 'stripe', // For now, hardcoded
              paymentId: `pay_${Date.now()}`, // Mock payment ID
              userIP: '127.0.0.1', // Mock IP
              userAgent: navigator.userAgent
            })
          });
          break; // Success, exit retry loop
        } catch (fetchError) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw fetchError; // Re-throw if max retries reached
          }
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (!response) {
        throw new Error('No response received after retries');
      }

      const data = await response.json();

      if (response.ok) {
        setCredentials(data.credentials);
        setStep('success');
      } else {
        setError(data.error || 'Purchase failed');
        setStep('error');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      
      // More specific error messages
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setError('Unable to connect to server. Please check if the backend is running on port 5000.');
      } else if (error instanceof Error && error.name === 'TypeError') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      
      setStep('error');
    }
  };

  const downloadCredentials = () => {
    if (!credentials) return;

    const dataStr = JSON.stringify(credentials, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trucomm-credentials-${credentials.username}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (step === 'success') {
      downloadCredentials();
    }
    onClose();
  };

  if (step === 'success' && credentials) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h2>
            <p className="text-gray-400">Your TruComm account has been created.</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-white font-medium mb-3">Your Login Credentials:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Username:</span>
                <span className="text-white font-mono">{credentials.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Login Email:</span>
                <span className="text-white font-mono text-xs">{credentials.softwareLoginEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MMID:</span>
                <span className="text-white font-mono">{credentials.mmid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Password:</span>
                <span className="text-white font-mono">{credentials.password}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadCredentials}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <IoDownload className="w-5 h-5" />
              Download Credentials
            </button>
            <button
              onClick={handleClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <IoAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Purchase Failed</h2>
            <p className="text-gray-400">{error}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStep('form')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Processing Purchase</h2>
            <p className="text-gray-400">Please wait while we create your account...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Complete Your Purchase</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Purchase Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="john@company.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be a company email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Designation *
                </label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="HR">HR</option>
                  <option value="CEO">CEO</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter coupon code"
                  />
                  {validatingCoupon && (
                    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                {couponValidation?.valid && (
                  <p className="text-green-400 text-sm mt-1">
                    ✓ Coupon applied! You save ₹{couponValidation.discount}
                  </p>
                )}
                {error && (
                  <p className="text-red-400 text-sm mt-1">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Complete Purchase
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span className="text-white">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Base Price:</span>
                <span className="text-white">₹{baseAmount}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount:</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">GST (18%):</span>
                <span className="text-white">₹{gstAmount}</span>
              </div>
              <hr className="border-gray-600" />
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-white">Total:</span>
                <span className="text-white">₹{totalAmount}</span>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <p>• Your credentials will be generated automatically</p>
              <p>• Login details will be sent to your work email</p>
              <p>• Download credentials as JSON file</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
