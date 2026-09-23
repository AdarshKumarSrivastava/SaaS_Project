"use client";

import { usePathname } from 'next/navigation';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  // We have removed ReactLenis globally because it intercepts scroll events
  // causing significant jittering in complex layouts (iframes, nested scroll containers)
  // Native browser scrolling is preferred for maximum stability.
  return (
    <>
      {children}
    </>
  );
}
