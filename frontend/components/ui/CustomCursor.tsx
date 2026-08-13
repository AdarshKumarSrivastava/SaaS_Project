"use client";

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Bypassing React renders for 60fps smooth tracking
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Outer ring (trailing, smooth spring)
  const springConfigOuter = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXOuter = useSpring(cursorX, springConfigOuter);
  const cursorYOuter = useSpring(cursorY, springConfigOuter);

  // Inner dot (snappy, immediate spring)
  const springConfigInner = { damping: 30, stiffness: 700, mass: 0.1 };
  const cursorXInner = useSpring(cursorX, springConfigInner);
  const cursorYInner = useSpring(cursorY, springConfigInner);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    
    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [cursorX, cursorY]);

  if (!isMounted) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-fuchsia-500/50 pointer-events-none z-[9999]"
        style={{
          x: cursorXOuter,
          y: cursorYOuter,
          translateX: "-50%",
          translateY: "-50%"
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan-400 pointer-events-none z-[9999]"
        style={{
          x: cursorXInner,
          y: cursorYInner,
          translateX: "-50%",
          translateY: "-50%"
        }}
      />
    </>
  );
}
