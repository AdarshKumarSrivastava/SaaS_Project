"use client";

import { useRef } from "react";

export function MagneticButton({ 
  children, 
  className = "",
  onClick
}: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={`quantum-magnetic-btn relative inline-block ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
