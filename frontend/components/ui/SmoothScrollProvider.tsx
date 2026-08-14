"use client";

import { ReactLenis } from '@studio-freight/react-lenis';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ 
      lerp: 0.08, 
      duration: 1.2, 
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2
    }}>
      {children as any}
    </ReactLenis>
  );
}
