"use client";

import { usePathname } from 'next/navigation';
import { ReactLenis } from '@studio-freight/react-lenis';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Disable smooth scroll interception for Builder and Dashboard
  if (pathname?.includes('/builder') || pathname?.includes('/dashboard')) {
    return <>{children}</>;
  }

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
