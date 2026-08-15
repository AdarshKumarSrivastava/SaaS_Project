"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User as UserIcon, LogOut, Settings, LayoutDashboard, Sparkles, 
  Shield, HelpCircle, ChevronDown, CheckCircle2, Key, CreditCard, X
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export const ProfileDropdown = (props: any) => {
  const authContext = useAuth();
  const rawUser = props.user || authContext.user;
  const logout = props.logout || authContext.logout;

  const displayName = (rawUser?.name && rawUser.name.trim()) || 
    (rawUser?.first_name ? `${rawUser.first_name} ${rawUser.last_name && rawUser.last_name !== '-' ? rawUser.last_name : ''}`.trim() : '') ||
    (rawUser?.email ? rawUser.email.split('@')[0] : '') ||
    'Senior Developer';

  const displayEmail = rawUser?.email || 'developer@buildspace.app';
  const initial = displayName ? displayName[0].toUpperCase() : 'S';

  const [isOpen, setIsOpen] = useState(props.isOpen ?? false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Avatar Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1.5 rounded-full bg-bg-subtle/80 hover:bg-bg-elevated border border-line/60 transition-all duration-300 shadow-sm active:scale-95 group"
          aria-label="User profile menu"
        >
          {/* Avatar Initial Circle */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent via-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              {initial}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-bg-elevated" />
          </div>

          {/* User Name Label (hidden on small mobile) */}
          <span className="text-xs font-semibold text-ink hidden md:inline-block max-w-[100px] truncate">
            {displayName.split(' ')[0]}
          </span>

          <ChevronDown className={`w-3.5 h-3.5 text-ink-soft transition-transform duration-300 ${isOpen ? 'rotate-180 text-ink' : ''}`} />
        </button>

        {/* Dropdown Menu Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 mt-3 w-72 bg-bg-elevated/95 backdrop-blur-2xl border border-line/80 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-3 z-50 overflow-hidden"
            >
              {/* User Header Info Card */}
              <div className="p-3.5 bg-bg-subtle/60 border border-line/60 rounded-2xl mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-ink truncate">{displayName}</p>
                    <p className="text-[11px] text-ink-soft truncate font-mono">{displayEmail}</p>
                  </div>
                </div>

                {/* Plan Badge */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-line/40 text-[10px]">
                  <span className="text-ink-soft uppercase tracking-wider font-semibold">Subscription</span>
                  <span className="inline-flex items-center gap-1 font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Empire Pro</span>
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-0.5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-ink hover:bg-bg-subtle rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4 text-ink-soft" />
                  <span>Workspace Dashboard</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-ink hover:bg-bg-subtle rounded-xl transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-ink-soft" />
                  <span>Account & Settings</span>
                </button>

                <Link
                  href="/templates"
                  className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-ink hover:bg-bg-subtle rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Template Vault</span>
                </Link>
              </div>

              {/* Security & System Info */}
              <div className="mt-2 pt-2 border-t border-line/60 space-y-0.5">
                <div className="px-3 py-1.5 flex items-center justify-between text-[10px] text-ink-soft">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>2FA Protected</span>
                  </span>
                  <span className="font-mono">v2.4.0</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/40 backdrop-blur-md z-40"
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg bg-bg-elevated border border-line rounded-[2.5rem] shadow-2xl overflow-hidden z-50"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-line flex justify-between items-center bg-bg-subtle/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-ink text-bg-elevated flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink">Account Profile & Settings</h3>
                    <p className="text-xs text-ink-soft">Manage user parameters & API environment</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-bg-subtle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-5">
                <div className="p-4 rounded-2xl bg-bg-subtle/80 border border-line/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {initial}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink">{displayName}</h4>
                      <p className="text-xs text-ink-soft font-mono">{displayEmail}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl border border-line/60 bg-bg-elevated text-xs">
                    <span className="text-ink-soft">Current Tier:</span>
                    <span className="font-bold text-accent">Empire Pro (Unlimited Nodes)</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl border border-line/60 bg-bg-elevated text-xs">
                    <span className="text-ink-soft">API Key Status:</span>
                    <span className="font-mono text-ink">bs_live_94829*****7291</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl border border-line/60 bg-bg-elevated text-xs">
                    <span className="text-ink-soft">Edge Region:</span>
                    <span className="font-medium text-ink">us-east-1 (N. Virginia)</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-line bg-bg-subtle/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="bg-ink text-bg-elevated px-5 py-2 rounded-xl text-xs font-semibold shadow-sm"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
