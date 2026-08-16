"use client";

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const TransitionLink = ({ children, className, onClick, ...props }: TransitionLinkProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isHashLink = props.href.toString().startsWith('#') || props.href.toString().includes('/#');

  const handleTransition = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (onClick) {
      onClick(e);
    }

    if (isHashLink) {
      const url = new URL(props.href.toString(), window.location.href);
      if (url.pathname === pathname && url.hash) {
        const element = document.querySelector(url.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    }

    const targetUrl = props.href.toString();
    if (targetUrl === pathname) {
       return;
    }

    // Get click coordinates for origin
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;

    const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );
    const targetSize = `${maxRadius * 2}px`;

    // Extract dynamic label for the transition text
    let labelText = '';
    if (props['data-label']) {
        labelText = props['data-label'];
    } else if (e.currentTarget.textContent) {
        labelText = e.currentTarget.textContent.trim();
    } else {
        const path = targetUrl.split('?')[0].split('/').pop();
        labelText = path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Loading';
    }
    labelText = labelText.split('\n')[0].substring(0, 30); // Clean up

    // Elite Ripple Overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[99999] pointer-events-none overflow-hidden transition-transform duration-[800ms] ease-[cubic-bezier(0.7,0,0.3,1)]';
    
    // Premium color layers: Cream -> Accent/Grey -> Ink
    const colors = ['#EAE6DF', '#6E6D6B', '#0D0D0D'];
    const circles: HTMLDivElement[] = [];

    colors.forEach((color, i) => {
        const circle = document.createElement('div');
        circle.style.position = 'absolute';
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;
        circle.style.width = '0px';
        circle.style.height = '0px';
        circle.style.backgroundColor = color;
        circle.style.borderRadius = '50%';
        circle.style.transform = 'translate(-50%, -50%)';
        // Ultra-smooth easing curve
        circle.style.transition = `width 0.8s cubic-bezier(0.76, 0, 0.24, 1), height 0.8s cubic-bezier(0.76, 0, 0.24, 1)`;
        circle.style.transitionDelay = `${i * 120}ms`;
        
        overlay.appendChild(circle);
        circles.push(circle);
    });

    // Dynamic Text Element
    const textEl = document.createElement('div');
    textEl.textContent = labelText;
    textEl.className = 'absolute inset-0 flex items-center justify-center text-[#FCFBFA] font-medium text-5xl md:text-7xl tracking-tighter opacity-0 transition-opacity duration-[800ms] ease-out pointer-events-none z-10 mix-blend-difference';
    overlay.appendChild(textEl);

    document.body.appendChild(overlay);

    // Force reflow
    void overlay.offsetWidth;

    // Animate In: Expand circles from cursor and fade in text
    circles.forEach(circle => {
        circle.style.width = targetSize;
        circle.style.height = targetSize;
    });
    
    setTimeout(() => {
        textEl.style.opacity = '1';
    }, 300);

    // Wait for the final black circle to fully cover
    await sleep(800 + 240);

    // Route change happens silently behind the black screen
    router.push(targetUrl);

    // Wait a brief moment for the new page DOM to mount
    await sleep(200);

    // Animate Out: Fade text out immediately, then slide overlay up
    textEl.style.transition = 'opacity 300ms ease';
    textEl.style.opacity = '0';
    
    await sleep(100);

    // The entire overlay elegantly slides up and fades slightly
    overlay.style.transform = 'translateY(-100%)';
    overlay.style.opacity = '0.9';

    // Wait for slide up to finish
    await sleep(800);
    
    // Cleanup
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  };

  return (
    <Link {...props} onClick={handleTransition} className={className}>
      {children}
    </Link>
  );
};
