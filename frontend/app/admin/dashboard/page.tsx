'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import ThemeToggle from '../../components/ThemeToggle';
import Noise from '../../components/Noise';
import UserCreationModal from '../../components/UserCreationModal';
import Image from 'next/image';
import { 
  FaUsers, 
  FaChartLine, 
  FaShieldAlt, 
  FaCog, 
  FaSignOutAlt,
  FaUserPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaDownload,
  FaSync,
  FaUser,
  FaChevronDown,
  FaUserCog,
  FaKey,
  FaBell,
  FaCog as FaSettings
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';

interface User {
  id: string;
  username: string;
  email: string;
  workEmail: string;
  softwareLoginEmail: string;
  designation: 'ADMIN' | 'CEO' | 'HR' | 'EMPLOYEE';
  isActive: boolean;
  currentIP: string;
  mmid: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    purchases: number;
    loginSessions: number;
  };
}

interface SystemStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  sessions: {
    total: number;
    active: number;
  };
  purchases: {
    total: number;
    recent: number;
  };
  roleDistribution: Array<{
    designation: string;
    _count: { designation: number };
  }>;
  recentLogins: Array<{
    id: string;
    user: {
      username: string;
      designation: string;
    };
    ipAddress: string;
    createdAt: string;
  }>;
}

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const { user, logout, isSuperAdmin, token, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [refreshingStats, setRefreshingStats] = useState(false);
  const [refreshingUsers, setRefreshingUsers] = useState(false);
  const [showUserCreationModal, setShowUserCreationModal] = useState(false);

  // Redirect if not authenticated or not super admin
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) {
      console.log('⏳ Auth still loading, not redirecting yet');
      return;
    }

    if (!isSuperAdmin) {
      console.log('❌ User is not super admin, redirecting to login');
      // Clear invalid tokens from storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      router.push('/admin/login');
    }
  }, [isSuperAdmin, router, authLoading]);

  // Fetch data on component mount
  useEffect(() => {
    console.log('🔍 Dashboard useEffect triggered:', { 
      isSuperAdmin, 
      token: !!token, 
      user: user ? { id: user.id, username: user.username, designation: user.designation } : null,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
      authLoading: authLoading
    });
    
    // Don't fetch data while auth is still loading
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }
    
    if (isSuperAdmin && token) {
      console.log('✅ Fetching dashboard data...');
      fetchDashboardData(true);
    } else {
      console.log('❌ Not fetching data - isSuperAdmin:', isSuperAdmin, 'token:', !!token);
      if (!isSuperAdmin) {
        console.log('❌ User is not super admin. User designation:', user?.designation);
      }
      if (!token) {
        console.log('❌ No token available');
      }
    }
  }, [isSuperAdmin, token, user, authLoading]);

  const fetchDashboardData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
      setIsLoading(true);
      }
      await Promise.all([
        fetchUsers(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (isInitialLoad) {
      setIsLoading(false);
      }
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('🔄 Fetching users...', { token: !!token, API_BASE_URL });
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('👤 User data:', user);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      });

      const url = `${API_BASE_URL}/auth/users?${params}`;
      console.log('📡 Fetching from URL:', url);
      console.log('🔍 About to make fetch request...');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Users response status:', response.status, response.ok);
      console.log('📡 Users response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Users data received:', data);
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('❌ Users fetch failed - Status:', response.status, 'StatusText:', response.statusText);
        if (response.status === 401) {
          console.log('🔐 Unauthorized - clearing storage and redirecting to login');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push('/admin/login');
          return;
        }
        try {
          const errorData = await response.json();
          console.error('❌ Users fetch error data:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          const errorText = await response.text();
          console.error('❌ Raw error response:', errorText);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🔄 Fetching stats...', { token: !!token, API_BASE_URL });
      const url = `${API_BASE_URL}/auth/stats`;
      console.log('📡 Fetching stats from URL:', url);
      console.log('🔍 About to make stats fetch request...');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Stats response status:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Stats data received:', data);
        setStats(data.stats);
      } else {
        if (response.status === 401) {
          console.log('🔐 Unauthorized - clearing storage and redirecting to login');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push('/admin/login');
          return;
        }
        const errorData = await response.json();
        console.error('❌ Stats fetch failed:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      if (action === 'delete') {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          await fetchUsers();
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive: action === 'activate' }),
        });

        if (response.ok) {
          await fetchUsers();
        }
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    console.log('🔍 Current state:', { isSuperAdmin, token: !!token, user: user?.username });
    
    // Set individual loading states
    setRefreshingStats(true);
    setRefreshingUsers(true);
    
    try {
      await fetchDashboardData(false);
    } finally {
      // Reset loading states after a short delay to show the loading indicators
      setTimeout(() => {
        setRefreshingStats(false);
        setRefreshingUsers(false);
      }, 1000);
    }
  };

  // Close profile modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.classList.contains('profile-modal-backdrop')) {
        setShowProfileModal(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProfileModal(false);
      }
    };

    if (showProfileModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showProfileModal]);

  // Reset logout confirmation after 5 seconds
  useEffect(() => {
    if (showLogoutConfirm) {
      const timer = setTimeout(() => {
        setShowLogoutConfirm(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showLogoutConfirm]);

  // Handle logout with confirmation
  const handleLogout = () => {
    if (!showLogoutConfirm) {
      // First click - show confirmation
      setShowLogoutConfirm(true);
    } else {
      // Second click - execute logout
      setShowProfileModal(false);
      setShowLogoutConfirm(false);
      logout();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <FaSpinner className="animate-spin" />
          <span>Restoring session...</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <FaSpinner className="animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireSuperAdmin>
    <div className={`min-h-screen pt-16 transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-gray-50 text-gray-900' 
        : 'bg-black text-white'
    }`}>
      {/* Header */}
      <header className={`fixed inset-x-0 top-0 z-40 h-16 backdrop-blur-xl border-b px-6 transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-white/80 border-gray-200'
          : 'bg-white/5 border-white/10'
      }`}>
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black">
              <Image
                src="/logo.png"
                alt="TruComm Logo"
                width={40}
                height={40}
                className="w-10 h-10"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">TruComm Admin Dashboard</h1>
              <p className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Welcome back, {user?.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />
            
            {/* Profile Button */}
            <button
              onClick={() => setShowProfileModal(!showProfileModal)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                theme === 'light'
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <FaUser className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">{user?.username}</span>
              <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${showProfileModal ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">System Overview</h2>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshingStats || refreshingUsers}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                  >
                    <FaSync className={`w-4 h-4 ${(refreshingStats || refreshingUsers) ? 'animate-spin' : ''}`} />
                    <span>{(refreshingStats || refreshingUsers) ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
              </div>

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 dashboard-card-grid" style={{ zIndex: 1 }}>
                  <div className="backdrop-blur-xl border rounded-lg p-6 dashboard-card transition-colors duration-300 ${
                    theme === 'light'
                      ? 'bg-white/90 border-gray-200'
                      : 'bg-white/5 border-white/10'
                  }">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm transition-colors duration-300 ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>Total Users</p>
                        <div className="flex items-center space-x-2">
                          {refreshingStats ? (
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                          ) : (
                            <p className={`text-2xl font-bold transition-colors duration-300 ${
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>{stats.users.total}</p>
                          )}
                        </div>
                      </div>
                      <FaUsers className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="mt-2 text-sm text-green-400">
                      {stats.users.active} active
                    </div>
                  </div>

                  <div className="backdrop-blur-xl border rounded-lg p-6 dashboard-card transition-colors duration-300 ${
                    theme === 'light'
                      ? 'bg-white/90 border-gray-200'
                      : 'bg-white/5 border-white/10'
                  }">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm transition-colors duration-300 ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>Active Sessions</p>
                        <div className="flex items-center space-x-2">
                          {refreshingStats ? (
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                          ) : (
                            <p className={`text-2xl font-bold transition-colors duration-300 ${
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>{stats.sessions.active}</p>
                          )}
                        </div>
                      </div>
                      <FaShieldAlt className="w-8 h-8 text-green-400" />
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      {stats.sessions.total} total
                    </div>
                  </div>

                  <div className="backdrop-blur-xl border rounded-lg p-6 dashboard-card transition-colors duration-300 ${
                    theme === 'light'
                      ? 'bg-white/90 border-gray-200'
                      : 'bg-white/5 border-white/10'
                  }">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm transition-colors duration-300 ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>Total Purchases</p>
                        <div className="flex items-center space-x-2">
                          {refreshingStats ? (
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
                          ) : (
                            <p className={`text-2xl font-bold transition-colors duration-300 ${
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>{stats.purchases.total}</p>
                          )}
                        </div>
                      </div>
                      <FaChartLine className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="mt-2 text-sm text-green-400">
                      {stats.purchases.recent} this week
                    </div>
                  </div>

                  <div className="backdrop-blur-xl border rounded-lg p-6 dashboard-card transition-colors duration-300 ${
                    theme === 'light'
                      ? 'bg-white/90 border-gray-200'
                      : 'bg-white/5 border-white/10'
                  }">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm transition-colors duration-300 ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>Role Distribution</p>
                        <div className="flex items-center space-x-2">
                          {refreshingStats ? (
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                          ) : (
                            <p className={`text-2xl font-bold transition-colors duration-300 ${
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>{stats.roleDistribution.length}</p>
                          )}
                        </div>
                      </div>
                      <FaCog className="w-8 h-8 text-orange-400" />
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      roles configured
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {stats?.recentLogins && (
                <div className={`backdrop-blur-xl border rounded-lg p-6 transition-colors duration-300 ${
                  theme === 'light'
                    ? 'bg-white/90 border-gray-200'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <h3 className="text-lg font-semibold mb-4">Recent Logins</h3>
                  <div className="space-y-3">
                    {refreshingStats ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                          <span className={`text-sm transition-colors duration-300 ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>Loading recent logins...</span>
                        </div>
                      </div>
                    ) : (
                      stats.recentLogins.slice(0, 5).map((login) => (
                      <div key={login.id} className={`flex items-center justify-between py-2 border-b last:border-b-0 transition-colors duration-300 ${
                        theme === 'light' ? 'border-gray-200' : 'border-white/10'
                      }`}>
                        <div>
                          <p className={`font-medium transition-colors duration-300 ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{login.user.username}</p>
                          <p className={`text-sm transition-colors duration-300 ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>{login.user.designation} • {login.ipAddress}</p>
                        </div>
                        <p className={`text-sm transition-colors duration-300 ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {new Date(login.createdAt).toLocaleString()}
                        </p>
                      </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Usage Analytics</h2>
                <button
                  onClick={handleRefresh}
                  disabled={refreshingStats}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <FaSync className={refreshingStats ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
              <div className={`p-6 rounded-xl border transition-colors duration-300 ${
                theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'
              }`}>
                <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                <div className="text-sm opacity-70">Coming soon...</div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshingStats || refreshingUsers}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                  >
                    <FaSync className={`w-4 h-4 ${(refreshingStats || refreshingUsers) ? 'animate-spin' : ''}`} />
                    <span>{(refreshingStats || refreshingUsers) ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <button 
                    onClick={() => setShowUserCreationModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
                  >
                    <FaUserPlus />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className={`backdrop-blur-xl border rounded-lg p-4 dashboard-card transition-colors duration-300 ${
                theme === 'light'
                  ? 'bg-white/90 border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                          theme === 'light'
                            ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                            : 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      theme === 'light'
                        ? 'bg-gray-50 border-gray-300 text-gray-900'
                        : 'bg-white/10 border-white/20 text-white'
                    }`}
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="CEO">CEO</option>
                    <option value="HR">HR</option>
                    <option value="EMPLOYEE">Employee</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      theme === 'light'
                        ? 'bg-gray-50 border-gray-300 text-gray-900'
                        : 'bg-white/10 border-white/20 text-white'
                    }`}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className={`backdrop-blur-xl border rounded-lg overflow-hidden dashboard-card transition-colors duration-300 ${
                theme === 'light'
                  ? 'bg-white/90 border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`transition-colors duration-300 ${
                      theme === 'light' ? 'bg-gray-100' : 'bg-white/10'
                    }`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>User</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>Role</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>Status</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>Purchases</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>Sessions</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y transition-colors duration-300 ${
                      theme === 'light' ? 'divide-gray-200' : 'divide-white/10'
                    }`}>
                      {refreshingUsers ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                              <span className={`text-sm transition-colors duration-300 ${
                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                              }`}>Loading users...</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                        <tr key={user.id} className={`transition-colors duration-200 ${
                          theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                        }`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className={`text-sm font-medium transition-colors duration-300 ${
                                theme === 'light' ? 'text-gray-900' : 'text-white'
                              }`}>{user.username}</div>
                              <div className={`text-sm transition-colors duration-300 ${
                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                              }`}>{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.designation === 'ADMIN' ? 'bg-red-100 text-red-800' :
                              user.designation === 'CEO' ? 'bg-purple-100 text-purple-800' :
                              user.designation === 'HR' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.designation}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user._count.purchases}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user._count.loginSessions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {/* View user details */}}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => {/* Edit user */}}
                                className="text-yellow-400 hover:text-yellow-300"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleUserAction(user.id, user.isActive ? 'deactivate' : 'activate')}
                                className={`${user.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className={`px-6 py-3 border-t flex items-center justify-between transition-colors duration-300 ${
                  theme === 'light'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className={`text-sm transition-colors duration-300 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Active Sessions</h2>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
                <p className="text-gray-400">Session management features coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">System Settings</h2>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
                <p className="text-gray-400">System settings coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>

    {/* Profile Modal - Rendered using Portal */}
    {showProfileModal && typeof window !== 'undefined' && createPortal(
      <div className="profile-modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999999]">
        <div className={`profile-modal relative overflow-hidden border rounded-lg shadow-2xl w-80 max-w-sm mx-4 animate-fade-in transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-white/95 border-gray-200'
            : 'bg-gray-900/95 border-gray-700'
        }`}>
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
          {/* Modal Content */}
          <div className="relative z-10">
          <div className={`p-6 border-b transition-colors duration-300 ${
            theme === 'light' ? 'border-gray-200' : 'border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Profile Menu</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className={`transition-colors ${
                  theme === 'light' 
                    ? 'text-gray-600 hover:text-gray-900' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <FaUser className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`font-medium transition-colors duration-300 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>{user?.username}</p>
                <p className={`text-sm transition-colors duration-300 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>{user?.email}</p>
                <p className="text-xs text-gray-500 font-medium">{user?.designation}</p>
              </div>
            </div>
          </div>
          
          <div className="py-2">
            <button
              onClick={() => {
                setShowProfileModal(false);
                // Handle profile view
              }}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors duration-200 ${
                theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
              }`}
            >
              <FaUserCog className="w-5 h-5 text-gray-400" />
              <span className={`transition-colors duration-300 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>View Profile</span>
            </button>
            
            <button
              onClick={() => {
                setShowProfileModal(false);
                // Handle change password
              }}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors duration-200 ${
                theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
              }`}
            >
              <FaKey className="w-5 h-5 text-gray-400" />
              <span className={`transition-colors duration-300 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Change Password</span>
            </button>
            
            <button
              onClick={() => {
                setShowProfileModal(false);
                // Handle notifications
              }}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors duration-200 ${
                theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
              }`}
            >
              <FaBell className="w-5 h-5 text-gray-400" />
              <span className={`transition-colors duration-300 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Notifications</span>
            </button>
            
            <button
              onClick={() => {
                setShowProfileModal(false);
                // Handle settings
              }}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors duration-200 ${
                theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
              }`}
            >
              <FaSettings className="w-5 h-5 text-gray-400" />
              <span className={`transition-colors duration-300 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Account Settings</span>
            </button>
          </div>
          
          <div className={`border-t py-2 transition-colors duration-300 ${
            theme === 'light' ? 'border-gray-200' : 'border-gray-700'
          }`}>
            <button
              onClick={handleLogout}
              className={`logout-button w-full flex items-center space-x-3 px-6 py-3 text-left ${
                showLogoutConfirm 
                  ? 'bg-gradient-to-r from-red-900/70 to-red-800/70 hover:from-red-900/80 hover:to-red-800/80 border-2 border-red-400 shadow-xl shadow-red-500/30 scale-[1.02] confirm' 
                  : 'hover:bg-red-900/30 hover:scale-[1.01]'
              }`}
            >
              <FaSignOutAlt className={`logout-icon w-5 h-5 ${showLogoutConfirm ? 'text-red-100 scale-110' : 'text-red-400'}`} />
              <span className={`logout-text ${showLogoutConfirm ? 'text-red-100 font-bold text-base tracking-wide' : 'text-red-400'}`}>
                {showLogoutConfirm ? 'Confirm Logout' : 'Logout'}
              </span>
              {showLogoutConfirm && (
                <div className="logout-indicator ml-auto">
                  <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse shadow-sm shadow-red-400/50"></div>
                </div>
              )}
            </button>
          </div>
          </div>
        </div>
      </div>,
      document.body
    )}

    {/* User Creation Modal */}
    <UserCreationModal
      isOpen={showUserCreationModal}
      onClose={() => setShowUserCreationModal(false)}
      onUserCreated={() => {
        setShowUserCreationModal(false);
        fetchUsers(); // Refresh the users list
      }}
    />
    </ProtectedRoute>
  );
}
