"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TransitionLink } from '@/components/TransitionLink';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useAuth } from '@/context/AuthContext';
import { ProfileDropdown } from '@/components/ProfileDropdown';

export function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className="pointer-events-auto bg-bg-elevated/60 backdrop-blur-2xl border border-line/50 rounded-[1.25rem] px-4 py-2 flex items-center justify-between gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] max-w-full overflow-x-auto scrollbar-none">
        
        {/* Logo */}
        <TransitionLink href="/" className="flex flex-shrink-0 items-center gap-2 group mr-2">
          <div className="w-6 h-6 rounded-full bg-ink flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-bg-elevated font-bold text-xs">B</span>
          </div>
          <span className="font-semibold text-sm tracking-tight text-ink hidden sm:inline-block">BuildSpace</span>
        </TransitionLink>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <TransitionLink href="/templates" className="text-ink-soft hover:text-ink transition-colors whitespace-nowrap hidden md:inline-block">Templates</TransitionLink>
          <TransitionLink href="/pricing" className="text-ink-soft hover:text-ink transition-colors whitespace-nowrap hidden md:inline-block">Pricing</TransitionLink>
        </div>

        <div className="h-4 w-px bg-line flex-shrink-0 mx-2 hidden sm:block"></div>

        {/* Auth / CTA */}
        <div className="flex items-center gap-4 flex-shrink-0 text-sm font-medium">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <TransitionLink href="/dashboard" className="text-ink-soft hover:text-ink transition-colors whitespace-nowrap">Dashboard</TransitionLink>
              <div className="relative">
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="text-xs font-bold text-accent">
                    {user ? `${user.first_name?.[0] || user.name?.[0] || 'U'}`.toUpperCase() : 'U'}
                  </span>
                </div>
                <ProfileDropdown isOpen={isDropdownOpen} setIsOpen={setIsDropdownOpen} user={user} logout={logout} />
              </div>
            </div>
          ) : (
            <>
              <TransitionLink href="/login" className="text-ink-soft hover:text-ink transition-colors whitespace-nowrap">Log In</TransitionLink>
              <TransitionLink href="/login" className="flex">
                <MagneticButton className="group bg-ink text-bg-elevated px-4 py-1.5 rounded-xl text-sm font-semibold hover:bg-ink/90 transition-colors whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    Start Building <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </MagneticButton>
              </TransitionLink>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
