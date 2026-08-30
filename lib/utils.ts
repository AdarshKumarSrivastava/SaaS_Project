import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLiveSiteUrl(subdomain: string) {
  // SSR fallback
  const isProd = process.env.NODE_ENV === 'production';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'buildspace.app';
  
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    // If we're on production buildspace.app
    if (host.includes('buildspace.app') || isProd) {
      return `https://${subdomain}.${rootDomain}`;
    }
    // For local development
    return `http://${subdomain}.localhost:3000`;
  }
  
  return isProd ? `https://${subdomain}.${rootDomain}` : `http://${subdomain}.localhost:3000`;
}
