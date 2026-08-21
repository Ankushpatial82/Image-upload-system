'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  UploadCloud,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Images,
  Settings,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Images', href: '/images', icon: Images },
    { name: 'Upload', href: '/upload', icon: UploadCloud },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Brand Title */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-base text-white tracking-wide">CloudSnap</span>
      </div>

      {/* Desktop Search / Quick CTA */}
      <div className="hidden md:flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-100 capitalize">
          {pathname.replace('/', '') || 'Dashboard'}
        </h2>
      </div>

      {/* User Actions Right */}
      <div className="flex items-center gap-3">
        <Link
          href="/upload"
          className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Image</span>
        </Link>

        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-sm font-medium text-slate-200 leading-tight">{user.name}</p>
              <p className="text-xs text-slate-400 leading-tight">{user.email}</p>
            </div>
          </div>
        )}

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg md:hidden hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#1e293b] border-b border-slate-800 p-4 space-y-2 md:hidden shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};
