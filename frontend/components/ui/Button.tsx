"use client";
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className, variant = 'primary', size = 'md', children, ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-full";
  
  const variants = {
    primary: "bg-ink/85 backdrop-blur-md text-white hover:bg-ink shadow-md border border-white/10",
    secondary: "bg-bg-elevated/60 backdrop-blur-md text-ink hover:bg-bg-elevated shadow-sm border border-white/40 dark:border-white/10",
    ghost: "bg-transparent text-ink hover:bg-bg-subtle",
    outline: "bg-transparent text-ink border border-line hover:bg-bg-subtle/50 backdrop-blur-sm"
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg"
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
});
Button.displayName = "Button";
