"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export const ProfileDropdown = (props: any) => {
  const authContext = useAuth();
  const user = props.user || authContext.user;
  const logout = props.logout || authContext.logout;
  const [isOpen, setIsOpen] = useState(props.isOpen ?? false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center text-white font-medium text-sm">
          {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-white/10 mb-2">
            <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
          </div>
          
          <div className="px-2 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            
            <button
              onClick={() => {
                setIsOpen(false);
                // Implementation for settings would go here
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>

          <div className="px-2 mt-2 pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
