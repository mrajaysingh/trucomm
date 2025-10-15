'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  workEmail: string;
  softwareLoginEmail: string;
  designation: 'ADMIN' | 'CEO' | 'HR' | 'EMPLOYEE';
  mmid: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdminOrCEO: boolean;
  isManagement: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed values
  const isAuthenticated = !!user && !!token;
  const isSuperAdmin = user?.designation === 'ADMIN';
  const isAdminOrCEO = user?.designation === 'ADMIN' || user?.designation === 'CEO';
  const isManagement = ['ADMIN', 'CEO', 'HR'].includes(user?.designation || '');

  // Debug authentication state changes
  useEffect(() => {
    console.log('🔍 Auth state changed:', {
      user: user ? { id: user.id, username: user.username, designation: user.designation } : null,
      token: !!token,
      isAuthenticated,
      isSuperAdmin,
      isLoading
    });
  }, [user, token, isAuthenticated, isSuperAdmin, isLoading]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

        console.log('🔄 Initializing auth from localStorage:', {
          hasToken: !!storedToken,
          hasRefreshToken: !!storedRefreshToken,
          hasUser: !!storedUser
        });

        if (storedToken && storedUser) {
          // Restore authentication state from localStorage
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
          console.log('✅ Auth state restored from localStorage');
        } else {
          console.log('❌ No valid auth data found in localStorage');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setRefreshToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!token || !refreshToken) return;

    const refreshInterval = setInterval(async () => {
      const success = await refreshAuth();
      if (!success) {
        logout();
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes

    return () => clearInterval(refreshInterval);
  }, [token, refreshToken]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('🔐 Attempting login for:', email);
      console.log('🌐 API URL:', API_BASE_URL);
      
      const requestBody = {
        softwareLoginEmail: email,
        password,
        userIP: '127.0.0.1', // In production, get real IP
        userAgent: navigator.userAgent,
      };
      
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/super-admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        console.error('❌ Login failed:', data.error);
        return { success: false, error: data.error || 'Login failed' };
      }

      if (data.success) {
        const { accessToken, refreshToken: newRefreshToken, user: userData } = data;
        console.log('✅ Login successful for user:', userData.username);
        console.log('🔑 Token received:', !!accessToken);
        
        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(accessToken);
        setRefreshToken(newRefreshToken);
        setUser(userData);
        
        return { success: true };
      }

      console.error('❌ Login response missing success flag');
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Revoke refresh token on server
    if (refreshToken) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      }).catch(console.error);
    }

    // Clear all authentication and cache data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('pinVerified');
    localStorage.removeItem('pinLockout');
    localStorage.removeItem('pinAttempts');
    localStorage.removeItem('loginLockout');
    localStorage.removeItem('failedAttempts');
    
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const refreshAuth = async (): Promise<boolean> => {
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { accessToken, user: userData } = data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(accessToken);
        setUser(userData);
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated,
    isSuperAdmin,
    isAdminOrCEO,
    isManagement,
    login,
    logout,
    refreshAuth,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
