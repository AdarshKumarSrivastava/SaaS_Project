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

    // Elite Staggered Columns Transition
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[99999] pointer-events-none overflow-hidden';
    
    const numCols = 5;
    const layer1: HTMLDivElement[] = [];
    const layer2: HTMLDivElement[] = [];

    for (let i = 0; i < numCols; i++) {
        // Accent Column (Background layer)
        const col1 = document.createElement('div');
        col1.className = 'absolute top-0 bottom-0 bg-ink z-[1]';
        col1.style.left = `${(i * 100) / numCols}%`;
        col1.style.width = `${100 / numCols + 0.5}%`; // prevent subpixel gaps
        col1.style.transform = 'translateY(100%)';
        col1.style.transition = `transform 0.7s cubic-bezier(0.85, 0, 0.15, 1)`;
        col1.style.transitionDelay = `${i * 0.05}s`;
        
        // Dark Column (Foreground layer)
        const col2 = document.createElement('div');
        col2.className = 'absolute top-0 bottom-0 bg-[#070707] z-[2]';
        col2.style.left = `${(i * 100) / numCols}%`;
        col2.style.width = `${100 / numCols + 0.5}%`;
        col2.style.transform = 'translateY(100%)';
        col2.style.transition = `transform 0.8s cubic-bezier(0.85, 0, 0.15, 1)`;
        col2.style.transitionDelay = `${0.1 + (i * 0.05)}s`; 

        overlay.appendChild(col1);
        overlay.appendChild(col2);
        layer1.push(col1);
        layer2.push(col2);
    }

    // Text container
    const textContainer = document.createElement('div');
    textContainer.className = 'absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10';
    
    // Create staggered text characters
    const textWrapper = document.createElement('div');
    textWrapper.className = 'flex overflow-hidden pb-4 px-8';
    
    const labelUpper = labelText.toUpperCase();
    const chars: HTMLSpanElement[] = [];
    
    for (let i = 0; i < labelUpper.length; i++) {
        const char = document.createElement('span');
        char.textContent = labelUpper[i] === ' ' ? '\u00A0' : labelUpper[i];
        // Apply hollow effect (stroke) and italic serif for that high-fashion awwwards look
        char.className = 'inline-block text-transparent font-serif italic text-5xl md:text-[8rem] lg:text-[11rem] leading-none tracking-tight';
        char.style.webkitTextStroke = '1px rgba(255,255,255,0.4)';
        char.style.transform = 'translateY(120%) scaleY(1.3) rotate(10deg)';
        char.style.filter = 'blur(12px)';
        char.style.opacity = '0';
        char.style.transition = `transform 0.9s cubic-bezier(0.7, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.7, 0, 0.2, 1), filter 0.9s cubic-bezier(0.7, 0, 0.2, 1), -webkit-text-stroke 0.8s ease, color 0.8s ease`;
        char.style.transitionDelay = `${0.3 + (i * 0.04)}s`;
        
        textWrapper.appendChild(char);
        chars.push(char);
    }

    // Subtext
    const subtext = document.createElement('div');
    subtext.textContent = 'ESTABLISHING CONNECTION...';
    subtext.className = 'mt-12 text-[#a0a0a0] text-[10px] md:text-xs uppercase tracking-[0.5em] font-mono opacity-0';
    subtext.style.transition = 'opacity 0.8s ease 0.8s';

    textContainer.appendChild(textWrapper);
    textContainer.appendChild(subtext);
    overlay.appendChild(textContainer);

    document.body.appendChild(overlay);

    // Force reflow
    void overlay.offsetWidth;

    // Animate columns in
    layer1.forEach(col => col.style.transform = 'translateY(0)');
    layer2.forEach(col => col.style.transform = 'translateY(0)');

    // Animate text in & fill color
    chars.forEach((char, i) => {
        char.style.transform = 'translateY(0) scaleY(1) rotate(0deg)';
        char.style.filter = 'blur(0px)';
        char.style.opacity = '1';
        
        // Fill in the text shortly after it appears
        setTimeout(() => {
            char.style.color = '#ffffff';
            char.style.webkitTextStroke = '0px rgba(255,255,255,0)';
        }, 700 + (i * 40));
    });
    
    subtext.style.opacity = '1';

    // Wait for animation to finish
    await sleep(1500);

    // Route change happens silently behind the black screen
    router.push(targetUrl);

    // Wait a brief moment for the new page DOM to mount
    await sleep(300);

    // Animate text out
    chars.forEach((char, i) => {
        char.style.transitionDelay = `${i * 0.03}s`;
        char.style.transitionDuration = `0.6s`;
        char.style.transform = 'translateY(-120%) scaleY(0.8) rotate(-5deg)';
        char.style.filter = 'blur(8px)';
        char.style.opacity = '0';
    });
    
    subtext.style.transitionDelay = '0s';
    subtext.style.transitionDuration = '0.3s';
    subtext.style.opacity = '0';

    await sleep(400);

    // Animate columns out (sliding up)
    layer2.forEach((col, i) => {
        col.style.transitionDelay = `${i * 0.05}s`;
        col.style.transform = 'translateY(-100%)';
    });
    layer1.forEach((col, i) => {
        col.style.transitionDelay = `${0.1 + (i * 0.05)}s`;
        col.style.transform = 'translateY(-100%)';
    });

    // Wait for columns to slide out
    await sleep(1000);
    
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
