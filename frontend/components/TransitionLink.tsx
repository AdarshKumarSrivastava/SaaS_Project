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

    const body = document.querySelector('body');
    if (body) {
      body.classList.add('page-transitioning');
      await sleep(300);
      router.push(props.href.toString());
      await sleep(100);
      body.classList.remove('page-transitioning');
    } else {
      router.push(props.href.toString());
    }
  };

  return (
    <Link {...props} onClick={handleTransition} className={className}>
      {children}
    </Link>
  );
};
