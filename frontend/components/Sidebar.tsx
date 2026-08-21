'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Images,
  UploadCloud,
  User,
  Settings,
  LogOut,
  HardDrive,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Images', href: '/images', icon: Images },
    { name: 'Upload', href: '/upload', icon: UploadCloud },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const storageUsedMB = user ? (user.storageUsed / (1024 * 1024)).toFixed(1) : '0';
  const storageLimitGB = user ? (user.storageLimit / (1024 * 1024 * 1024)).toFixed(0) : '5';
  const percentage = user && user.storageLimit > 0
    ? Math.min(100, Math.round((user.storageUsed / user.storageLimit) * 100))
    : 0;

  return (
    <aside className="w-64 bg-[#1e293b]/90 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">CloudSnap</h1>
            <p className="text-xs text-slate-400 font-medium">Image Storage Platform</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Storage & User Footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-4">
        {/* Storage Quick Glance */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-brand-400" /> Storage
            </span>
            <span className="text-slate-400">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                percentage > 90
                  ? 'bg-rose-500'
                  : percentage > 75
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-brand-500 to-indigo-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-right">
            {storageUsedMB} MB / {storageLimitGB} GB
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
