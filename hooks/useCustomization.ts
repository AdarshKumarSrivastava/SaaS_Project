"use client";
import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useCustomizationContext } from '@/context/CustomizationContext';

export const useCustomization = () => {
  const context = useCustomizationContext();
  const pathname = usePathname() || '/';
  
  const siteData = context?.siteData;
  const products = context?.products;
  const activePath = context?.activePath;

  const data = useMemo(() => {
    let flattenedFormData: Record<string, any> = {};
    
    if (siteData?.global) {
      flattenedFormData = { ...flattenedFormData, ...siteData.global };
    }
    
    // Resolve the active path: prioritize context.activePath for builder preview mode
    const resolvedPath = activePath || pathname;

    if (siteData?.pages) {
      const activePage = siteData.pages.find((p: any) => {
         if (p.path === '/') {
           // Home page matches: exact '/', or path ending with the template slug
           // e.g. '/templates/minimalist', '/templates/origin', etc.
           if (resolvedPath === '/') return true;
           const segments = resolvedPath.split('/').filter(Boolean);
           // If last segment is the template slug and there's nothing after it, it's the home page
           const templateSlug = siteData?.global?.templateSlug;
           if (templateSlug && segments.length > 0 && segments[segments.length - 1] === templateSlug) return true;
           return false;
         }
         return resolvedPath.includes(p.path);
      }) || siteData.pages[0];

      activePage?.sections?.forEach((section: any) => {
        flattenedFormData = { ...flattenedFormData, ...section.props };
      });
    }

    return { 
      colors: {}, 
      fonts: {}, 
      formData: flattenedFormData,
      products: products || []
    };
  }, [siteData, products, activePath, pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Dispatch navigation events back to the parent builder so it syncs its state
    const notifyParentOfNavigation = () => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'IFRAME_NAVIGATED', path: pathname }, '*');
      }
    };
    notifyParentOfNavigation();
  }, [pathname]);

  return data;
};
