"use client";

import React from 'react';

interface RouteLoadingSkeletonProps {
  canonicalPath?: string;
}

export function RouteLoadingSkeleton({ canonicalPath = "/" }: RouteLoadingSkeletonProps) {
  // 1. SHOP / PRODUCTS SKELETON
  if (canonicalPath === '/products') {
    return (
      <div className="w-full min-h-[70vh] px-6 md:px-12 py-16 max-w-[1600px] mx-auto animate-pulse">
        {/* Category & Title Shell */}
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="h-3 w-24 bg-neutral-300/40 dark:bg-white/10 rounded-full" />
          <div className="h-12 w-64 md:w-96 bg-neutral-300/50 dark:bg-white/15 rounded-xl" />
          <div className="h-4 w-48 md:w-72 bg-neutral-200/50 dark:bg-white/5 rounded-lg" />
        </div>

        {/* Filter / Category Pills */}
        <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
          <div className="h-9 w-16 bg-neutral-300/60 dark:bg-white/20 rounded-full" />
          <div className="h-9 w-24 bg-neutral-200/50 dark:bg-white/10 rounded-full" />
          <div className="h-9 w-28 bg-neutral-200/50 dark:bg-white/10 rounded-full" />
          <div className="h-9 w-20 bg-neutral-200/50 dark:bg-white/10 rounded-full" />
        </div>

        {/* Product Grid Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col space-y-4">
              <div className="w-full aspect-[4/5] bg-neutral-200/70 dark:bg-white/5 rounded-2xl overflow-hidden" />
              <div className="space-y-2 px-1">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-3/5 bg-neutral-300/60 dark:bg-white/15 rounded" />
                  <div className="h-4 w-1/4 bg-neutral-300/60 dark:bg-white/15 rounded" />
                </div>
                <div className="h-3 w-1/3 bg-neutral-200/60 dark:bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. PRODUCT DETAIL SKELETON
  if (canonicalPath === '/products/[id]') {
    return (
      <div className="w-full min-h-[70vh] px-6 md:px-12 py-16 max-w-[1400px] mx-auto animate-pulse">
        <div className="h-4 w-36 bg-neutral-200/60 dark:bg-white/10 rounded mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Gallery Column */}
          <div className="space-y-4">
            <div className="w-full aspect-square bg-neutral-200/70 dark:bg-white/5 rounded-3xl" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-neutral-200/50 dark:bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Product Info Column */}
          <div className="space-y-6 pt-4">
            <div className="h-3 w-20 bg-neutral-300/40 dark:bg-white/10 rounded-full" />
            <div className="h-10 w-4/5 bg-neutral-300/60 dark:bg-white/20 rounded-xl" />
            <div className="h-6 w-28 bg-neutral-300/50 dark:bg-white/15 rounded-lg" />
            <div className="h-20 w-full bg-neutral-200/50 dark:bg-white/5 rounded-xl" />
            <div className="h-12 w-full bg-neutral-300/60 dark:bg-white/20 rounded-xl mt-8" />
          </div>
        </div>
      </div>
    );
  }

  // 3. ABOUT PAGE SKELETON
  if (canonicalPath === '/about') {
    return (
      <div className="w-full min-h-[70vh] px-6 md:px-12 py-16 max-w-[1400px] mx-auto animate-pulse">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="h-3 w-20 bg-neutral-300/40 dark:bg-white/10 rounded-full" />
          <div className="h-12 w-80 md:w-[480px] bg-neutral-300/50 dark:bg-white/15 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="w-full aspect-[4/3] bg-neutral-200/70 dark:bg-white/5 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 w-3/4 bg-neutral-300/50 dark:bg-white/15 rounded-lg" />
            <div className="h-4 w-full bg-neutral-200/50 dark:bg-white/5 rounded" />
            <div className="h-4 w-5/6 bg-neutral-200/50 dark:bg-white/5 rounded" />
            <div className="h-4 w-4/6 bg-neutral-200/50 dark:bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // 4. CONTACT PAGE SKELETON
  if (canonicalPath === '/contact') {
    return (
      <div className="w-full min-h-[70vh] px-6 md:px-12 py-16 max-w-[1200px] mx-auto animate-pulse">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="h-3 w-20 bg-neutral-300/40 dark:bg-white/10 rounded-full" />
          <div className="h-10 w-64 bg-neutral-300/50 dark:bg-white/15 rounded-xl" />
        </div>
        <div className="max-w-xl mx-auto space-y-6">
          <div className="h-12 w-full bg-neutral-200/60 dark:bg-white/5 rounded-xl" />
          <div className="h-12 w-full bg-neutral-200/60 dark:bg-white/5 rounded-xl" />
          <div className="h-32 w-full bg-neutral-200/60 dark:bg-white/5 rounded-xl" />
          <div className="h-12 w-full bg-neutral-300/60 dark:bg-white/20 rounded-xl" />
        </div>
      </div>
    );
  }

  // 5. CART / CHECKOUT SKELETON
  if (canonicalPath === '/cart' || canonicalPath === '/checkout') {
    return (
      <div className="w-full min-h-[70vh] px-6 md:px-12 py-16 max-w-[1200px] mx-auto animate-pulse">
        <div className="h-8 w-48 bg-neutral-300/50 dark:bg-white/15 rounded-xl mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 border border-neutral-200/50 dark:border-white/5 rounded-2xl">
                <div className="w-20 h-20 bg-neutral-200/70 dark:bg-white/5 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/5 bg-neutral-300/50 dark:bg-white/15 rounded" />
                  <div className="h-3 w-1/4 bg-neutral-200/60 dark:bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-neutral-200/40 dark:bg-white/5 rounded-3xl p-6 space-y-4" />
        </div>
      </div>
    );
  }

  // 6. DEFAULT / HOME SKELETON
  return (
    <div className="w-full min-h-[70vh] px-6 md:px-12 py-20 max-w-[1600px] mx-auto animate-pulse">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6 mb-16">
        <div className="h-4 w-32 bg-neutral-300/40 dark:bg-white/10 rounded-full" />
        <div className="h-16 w-full md:w-[600px] bg-neutral-300/50 dark:bg-white/15 rounded-2xl" />
        <div className="h-5 w-4/5 md:w-[450px] bg-neutral-200/50 dark:bg-white/5 rounded-lg" />
        <div className="flex gap-4 pt-4">
          <div className="h-12 w-36 bg-neutral-300/60 dark:bg-white/20 rounded-full" />
          <div className="h-12 w-36 bg-neutral-200/50 dark:bg-white/10 rounded-full" />
        </div>
      </div>
      <div className="w-full aspect-[21/9] bg-neutral-200/60 dark:bg-white/5 rounded-3xl max-w-5xl mx-auto" />
    </div>
  );
}
