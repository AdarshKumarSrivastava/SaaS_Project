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
         if (p.path === '/') return resolvedPath === '/' || resolvedPath.endsWith('/origin') || resolvedPath.endsWith('/velocity');
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
