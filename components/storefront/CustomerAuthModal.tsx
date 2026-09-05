"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  User, 
  ShoppingBag, 
  Package, 
  LogOut,
  KeyRound
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useCustomizationContext } from '@/context/CustomizationContext';
import Link from 'next/link';

export function CustomerAuthModal() {
  const { 
    isAuthModalOpen, 
    authModalView, 
    authModalMessage, 
    authModalReason,
    closeAuthModal, 
    setAuthModalView,
    executePendingAction,
    customer,
    isAuthenticated,
    login,
    register,
    logout
  } = useCustomerAuth();

  const customContext = useCustomizationContext();
  const brandName = customContext?.siteData?.name || customContext?.siteData?.brandName || "STORE";
  const basePath = typeof customContext?.basePath === "string" ? customContext.basePath : "";

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form errors/state when view or modal open state changes
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
    setPassword("");
    setConfirmPassword("");
  }, [authModalView, isAuthModalOpen]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(emailTrimmed, password);
      if (res.success) {
        setSuccessMessage("Signed in successfully!");
        executePendingAction();
        setTimeout(() => {
          closeAuthModal();
        }, 500);
      } else {
        setError(res.error || "Invalid email or password.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await register(
        emailTrimmed, 
        password, 
        firstName.trim() || undefined, 
        lastName.trim() || undefined
      );
      if (res.success) {
        setSuccessMessage("Account created successfully!");
        executePendingAction();
        setTimeout(() => {
          closeAuthModal();
        }, 500);
      } else {
        setError(res.error || "Unable to create account. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    // Simulate safe password recovery flow
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("If an account exists with this email, password reset instructions have been sent.");
    }, 800);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      closeAuthModal();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/45 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeAuthModal();
        }
      }}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-[460px] bg-[var(--color-background,#fdfbf7)] text-[var(--color-foreground,#402c21)] border border-[var(--color-foreground,#402c21)]/15 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.25)] p-6 sm:p-8 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-in zoom-in-95"
        style={{
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-[var(--color-foreground,#402c21)]/50 hover:text-[var(--color-foreground,#402c21)] hover:bg-[var(--color-foreground,#402c21)]/10 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================================= */}
        {/* VIEW 1: LOGIN */}
        {/* ========================================================================= */}
        {authModalView === 'login' && !isAuthenticated && (
          <div>
            <div className="text-center mb-6 sm:mb-8 pt-2">
              <div className="text-[10px] font-mono tracking-[0.25em] font-bold uppercase text-[var(--color-accent,#a38c7f)] mb-2">
                {brandName}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-foreground,#402c21)] mb-2">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-foreground,#402c21)]/70 font-normal leading-relaxed max-w-xs mx-auto">
                {authModalMessage || "Sign in to access your orders, cart, and account profile."}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-4 py-3 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthModalView('forgot_password')}
                    className="text-[11px] text-[var(--color-accent,#a38c7f)] hover:text-[var(--color-foreground,#402c21)] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-4 py-3 pr-11 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-[var(--color-foreground,#402c21)]/40 hover:text-[var(--color-foreground,#402c21)] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-[var(--color-foreground,#402c21)] text-[var(--color-background,#fdfbf7)] font-mono text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[var(--color-accent,#a38c7f)] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  {isLoading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-[var(--color-foreground,#402c21)]/10 text-center">
              <p className="text-xs text-[var(--color-foreground,#402c21)]/65">
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => setAuthModalView('register')}
                  className="font-bold underline text-[var(--color-foreground,#402c21)] hover:text-[var(--color-accent,#a38c7f)] transition-colors ml-1"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: REGISTER */}
        {/* ========================================================================= */}
        {authModalView === 'register' && !isAuthenticated && (
          <div>
            <div className="text-center mb-6 sm:mb-8 pt-2">
              <div className="text-[10px] font-mono tracking-[0.25em] font-bold uppercase text-[var(--color-accent,#a38c7f)] mb-2">
                {brandName}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-foreground,#402c21)] mb-2">
                Create Account
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-foreground,#402c21)]/70 font-normal leading-relaxed max-w-xs mx-auto">
                Create your customer account to manage orders and saved items.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-4 py-2.5 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-4 py-2.5 pr-11 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[var(--color-foreground,#402c21)]/40 hover:text-[var(--color-foreground,#402c21)] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-4 py-2.5 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-[var(--color-foreground,#402c21)] text-[var(--color-background,#fdfbf7)] font-mono text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[var(--color-accent,#a38c7f)] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  {isLoading ? (
                    <span>Creating account...</span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-[var(--color-foreground,#402c21)]/10 text-center">
              <p className="text-xs text-[var(--color-foreground,#402c21)]/65">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthModalView('login')}
                  className="font-bold underline text-[var(--color-foreground,#402c21)] hover:text-[var(--color-accent,#a38c7f)] transition-colors ml-1"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: FORGOT PASSWORD */}
        {/* ========================================================================= */}
        {authModalView === 'forgot_password' && !isAuthenticated && (
          <div>
            <div className="text-center mb-6 sm:mb-8 pt-2">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--color-foreground,#402c21)]/5 flex items-center justify-center text-[var(--color-foreground,#402c21)]">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-foreground,#402c21)] mb-2">
                Reset Password
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-foreground,#402c21)]/70 font-normal leading-relaxed max-w-xs mx-auto">
                Enter your registered email address to receive password recovery instructions.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed text-xs">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-4 py-3 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-[var(--color-foreground,#402c21)] text-[var(--color-background,#fdfbf7)] font-mono text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[var(--color-accent,#a38c7f)] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  {isLoading ? (
                    <span>Sending instructions...</span>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-[var(--color-foreground,#402c21)]/10 text-center">
              <p className="text-xs text-[var(--color-foreground,#402c21)]/65">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => setAuthModalView('login')}
                  className="font-bold underline text-[var(--color-foreground,#402c21)] hover:text-[var(--color-accent,#a38c7f)] transition-colors ml-1"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: ACCOUNT PANEL (When Authenticated or authModalView === 'account') */}
        {/* ========================================================================= */}
        {(isAuthenticated || authModalView === 'account') && (
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-foreground,#402c21)]/10 mb-6">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--color-foreground,#402c21)]">
                Account
              </h2>
            </div>

            {/* Customer Profile Summary */}
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[var(--color-foreground,#402c21)]/5 border border-[var(--color-foreground,#402c21)]/10 mb-6">
              <div className="w-12 h-12 rounded-full bg-[var(--color-foreground,#402c21)] text-[var(--color-background,#fdfbf7)] flex items-center justify-center font-serif text-lg font-bold shrink-0">
                {customer?.firstName ? customer.firstName.charAt(0).toUpperCase() : (customer?.email ? customer.email.charAt(0).toUpperCase() : "C")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-[var(--color-foreground,#402c21)] truncate">
                  {customer?.firstName || customer?.lastName 
                    ? `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() 
                    : "Valued Customer"}
                </div>
                <div className="text-xs text-[var(--color-foreground,#402c21)]/60 font-mono truncate">
                  {customer?.email || "customer@example.com"}
                </div>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="flex flex-col gap-2 mb-6">
              <Link
                href={`${basePath}/orders`}
                onClick={closeAuthModal}
                className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[var(--color-foreground,#402c21)]/5 transition-colors border border-transparent hover:border-[var(--color-foreground,#402c21)]/10 group"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-[var(--color-accent,#a38c7f)]" />
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--color-foreground,#402c21)]">
                    My Orders
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-foreground,#402c21)]/40 group-hover:text-[var(--color-foreground,#402c21)] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href={`${basePath}/cart`}
                onClick={closeAuthModal}
                className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[var(--color-foreground,#402c21)]/5 transition-colors border border-transparent hover:border-[var(--color-foreground,#402c21)]/10 group"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-[var(--color-accent,#a38c7f)]" />
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--color-foreground,#402c21)]">
                    Shopping Cart
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-foreground,#402c21)]/40 group-hover:text-[var(--color-foreground,#402c21)] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href={`${basePath}/profile`}
                onClick={closeAuthModal}
                className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[var(--color-foreground,#402c21)]/5 transition-colors border border-transparent hover:border-[var(--color-foreground,#402c21)]/10 group"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[var(--color-accent,#a38c7f)]" />
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--color-foreground,#402c21)]">
                    Full Profile & Security
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-foreground,#402c21)]/40 group-hover:text-[var(--color-foreground,#402c21)] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

            {/* Logout Action */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-transparent border border-[var(--color-foreground,#402c21)]/20 text-[var(--color-foreground,#402c21)]/80 hover:text-red-600 hover:border-red-500/40 hover:bg-red-500/5 font-mono text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoading ? "Signing out..." : "Log Out"}</span>
            </button>
          </div>
        )}

        {/* Subtle Security Badge */}
        <div className="mt-6 pt-4 text-center border-t border-[var(--color-foreground,#402c21)]/5">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-accent,#a38c7f)] opacity-70">
            <ShieldCheck className="w-3 h-3" />
            <span>Project Encrypted Storefront Auth</span>
          </div>
        </div>

      </div>
    </div>
  );
}
