"use client";

import React, { createContext, useContext, useState, useCallback, useTransition, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface PageTransitionContextType {
  /** Navigates with startTransition — keeps the current UI interactive while the new route loads. */
  navigateTo: (url: string) => void;
  /** Whether a transition is currently pending (route loading in background). */
  isPending: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(null);

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) {
    throw new Error('usePageTransition must be used within <PageTransitionProvider>');
  }
  return ctx;
}

/**
 * Wraps children and provides:
 * 1. `navigateTo()` — a non-blocking `router.push` wrapped in `React.startTransition`
 * 2. A sleek top progress bar that appears during transitions
 * 3. Prevents duplicate navigations
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastNavRef = useRef<string>('');

  const clearProgress = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  // When isPending finishes → complete the bar
  useEffect(() => {
    if (!isPending && visible) {
      clearProgress();
      setProgress(100);
      const hideTimeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
      return () => clearTimeout(hideTimeout);
    }
  }, [isPending, visible, clearProgress]);

  const navigateTo = useCallback((url: string) => {
    // Prevent duplicate navigations
    if (url === pathname || url === lastNavRef.current) return;
    lastNavRef.current = url;

    // Start the progress bar immediately
    setVisible(true);
    setProgress(15);
    clearProgress();

    // Simulate incremental progress while waiting
    let current = 15;
    progressTimerRef.current = setInterval(() => {
      current += Math.random() * 12;
      if (current > 90) current = 90;
      setProgress(current);
    }, 200);

    // Non-blocking navigation: keeps current UI responsive while new route loads
    startTransition(() => {
      router.push(url);
    });
  }, [pathname, router, startTransition, clearProgress]);

  return (
    <PageTransitionContext.Provider value={{ navigateTo, isPending }}>
      {/* Top progress bar */}
      {visible && (
        <div className="page-progress-bar" style={{ '--progress': `${progress}%` } as React.CSSProperties}>
          <div className="page-progress-bar__track" />
          <div className="page-progress-bar__glow" />
        </div>
      )}
      {children}
    </PageTransitionContext.Provider>
  );
}
