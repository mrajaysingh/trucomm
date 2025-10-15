'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { FaSpinner } from 'react-icons/fa';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  requireAdminOrCEO?: boolean;
  requireManagement?: boolean;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requireSuperAdmin = false,
  requireAdminOrCEO = false,
  requireManagement = false,
  fallback
}: ProtectedRouteProps) {
  const { isAuthenticated, isSuperAdmin, isAdminOrCEO, isManagement, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/admin/login');
        return;
      }

      if (requireSuperAdmin && !isSuperAdmin) {
        router.push('/');
        return;
      }

      if (requireAdminOrCEO && !isAdminOrCEO) {
        router.push('/');
        return;
      }

      if (requireManagement && !isManagement) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, isSuperAdmin, isAdminOrCEO, isManagement, isLoading, requireSuperAdmin, requireAdminOrCEO, requireManagement, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <FaSpinner className="animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return fallback || (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (requireAdminOrCEO && !isAdminOrCEO) {
    return fallback || (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (requireManagement && !isManagement) {
    return fallback || (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
