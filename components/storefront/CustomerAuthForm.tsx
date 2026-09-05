"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useCustomizationContext } from '@/context/CustomizationContext';

interface CustomerAuthFormProps {
  mode: 'login' | 'signup';
  basePath?: string;
  brandName?: string;
  theme?: string;
}

export function CustomerAuthForm({
  mode,
  basePath = "",
  brandName = "Store",
}: CustomerAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useCustomerAuth();
  const __customContext = useCustomizationContext();
  const resolvedBasePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : basePath;

  const returnUrl = (searchParams ? searchParams.get('return') || searchParams.get('next') : "") || "";
  const pendingAction = searchParams ? searchParams.get('action') : null;
  const pendingProductId = searchParams ? searchParams.get('productId') || searchParams.get('product') : null;

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

  // Sanitize return path to prevent open redirect
  const sanitizeDestination = (dest: string) => {
    if (!dest) return `${resolvedBasePath}/profile`;
    if (dest.startsWith('/') && !dest.startsWith('//')) return dest;
    return `${resolvedBasePath}/profile`;
  };

  const handlePostAuthSuccess = () => {
    if (pendingAction === 'add-to-cart' && pendingProductId) {
      try {
        sessionStorage.setItem('pending_cart_add', pendingProductId);
      } catch (e) {}
    }

    const destination = sanitizeDestination(returnUrl);
    router.push(destination);
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(emailTrimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const res = await register(emailTrimmed, password, firstName.trim() || undefined, lastName.trim() || undefined);
        if (res.success) {
          setSuccessMessage("Account created successfully. Redirecting...");
          setTimeout(handlePostAuthSuccess, 800);
        } else {
          setError(res.error || "Unable to create account. Please try again.");
          setIsLoading(false);
        }
      } else {
        const res = await login(emailTrimmed, password);
        if (res.success) {
          setSuccessMessage("Authenticated. Redirecting...");
          setTimeout(handlePostAuthSuccess, 600);
        } else {
          setError(res.error || "Invalid email or password.");
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected authentication error occurred.");
      setIsLoading(false);
    }
  };

  // Build preserved query string for switching between login and signup
  const authQuery = new URLSearchParams();
  if (returnUrl) authQuery.set('return', returnUrl);
  if (pendingAction) authQuery.set('action', pendingAction);
  if (pendingProductId) authQuery.set('productId', pendingProductId);
  const authQueryString = authQuery.toString() ? `?${authQuery.toString()}` : "";

  return (
    <div className="min-h-screen bg-[var(--color-background,#fdfbf7)] text-[var(--color-foreground,#402c21)] flex flex-col justify-between pt-8 pb-16 px-4 sm:px-6 md:px-8 transition-colors duration-300">
      
      {/* Top Header / Back Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-8">
        <Link 
          href={sanitizeDestination(returnUrl) || `${resolvedBasePath}/`}
          className="inline-flex items-center gap-2 text-xs font-mono font-medium tracking-wider text-[var(--color-accent,#a38c7f)] hover:text-[var(--color-foreground,#402c21)] transition-colors select-none"
        >
          <ArrowLeft className="w-4 h-4" /> Return to store
        </Link>
        <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--color-accent,#a38c7f)] opacity-70">
          Secure Storefront Auth
        </span>
      </div>

      {/* Main Card Container */}
      <div className="max-w-md w-full mx-auto bg-[var(--color-foreground,#402c21)]/[0.03] border border-[var(--color-foreground,#402c21)]/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.04)] backdrop-blur-sm">
        
        {/* Editorial Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="text-[10px] font-mono tracking-[0.25em] font-bold uppercase text-[var(--color-accent,#a38c7f)] mb-3">
            {brandName}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-foreground,#402c21)] mb-3">
            {mode === 'signup' ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-foreground,#402c21)]/70 font-normal max-w-xs mx-auto leading-relaxed">
            {pendingAction === 'add-to-cart'
              ? "Sign in to add this item to your cart and complete your checkout."
              : mode === 'signup'
                ? "Join to track your orders, manage your profile, and save favorites."
                : "Sign in to access your orders, cart, and account profile."}
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
            <span className="flex-1 leading-relaxed">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-3.5 py-3 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-3.5 py-3 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-4 py-3 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete={mode === 'signup' ? "new-password" : "current-password"}
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

          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-foreground,#402c21)]/70 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--color-background,#fdfbf7)] border border-[var(--color-foreground,#402c21)]/15 rounded-xl px-4 py-3 text-sm text-[var(--color-foreground,#402c21)] placeholder:text-[var(--color-foreground,#402c21)]/30 focus:outline-none focus:border-[var(--color-foreground,#402c21)] transition-colors"
              />
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-[var(--color-foreground,#402c21)] text-[var(--color-background,#fdfbf7)] font-mono text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[var(--color-accent,#a38c7f)] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{mode === 'signup' ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </form>

        {/* Divider / Mode Switch Link */}
        <div className="mt-8 pt-6 border-t border-[var(--color-foreground,#402c21)]/10 text-center">
          {mode === 'signup' ? (
            <p className="text-xs text-[var(--color-foreground,#402c21)]/60">
              Already have an account?{" "}
              <Link 
                href={`${resolvedBasePath}/auth/login${authQueryString}`}
                className="font-bold underline text-[var(--color-foreground,#402c21)] hover:text-[var(--color-accent,#a38c7f)] transition-colors ml-1"
              >
                Sign In
              </Link>
            </p>
          ) : (
            <p className="text-xs text-[var(--color-foreground,#402c21)]/60">
              Don't have an account yet?{" "}
              <Link 
                href={`${resolvedBasePath}/auth/signup${authQueryString}`}
                className="font-bold underline text-[var(--color-foreground,#402c21)] hover:text-[var(--color-accent,#a38c7f)] transition-colors ml-1"
              >
                Create Account
              </Link>
            </p>
          )}
        </div>

      </div>

      {/* Footer Trust Indicator */}
      <div className="max-w-md w-full mx-auto text-center mt-8 text-[11px] text-[var(--color-accent,#a38c7f)] flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>End-to-end encrypted project authentication</span>
      </div>

    </div>
  );
}
