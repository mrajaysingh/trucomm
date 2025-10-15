'use client';

import React from 'react';
import {
  FaUsers,
  FaChartLine,
  FaShieldAlt,
  FaCog
} from 'react-icons/fa';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: string | undefined;
}

export default function AdminSidebar({ activeTab, setActiveTab, theme }: AdminSidebarProps) {
  return (
    <aside
      className={`sticky top-[64px] self-start w-64 backdrop-blur-xl border-r min-h-screen h-[calc(100vh-64px)] overflow-hidden transition-colors duration-300 ${
        theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-white/5 border-white/10'
      }`}
    >
      <nav className="p-4 space-y-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : theme === 'light'
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          <FaChartLine />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'usage'
              ? 'bg-blue-600 text-white'
              : theme === 'light'
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          <FaChartLine />
          <span>Usage</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white'
              : theme === 'light'
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          <FaUsers />
          <span>Users</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'sessions'
              ? 'bg-blue-600 text-white'
              : theme === 'light'
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          <FaShieldAlt />
          <span>Sessions</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white'
              : theme === 'light'
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          <FaCog />
          <span>Settings</span>
        </button>
      </nav>
    </aside>
  );
}


