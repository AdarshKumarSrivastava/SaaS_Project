"use client";
import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useCustomizationContext } from '@/context/CustomizationContext';

export const useCustomization = () => {
  const context = useCustomizationContext();
  const pathname = usePathname() || '/';
  
  const data = useMemo(() => {
    let flattenedFormData: Record<string, any> = {};
    
    if (context?.siteData?.global) {
      flattenedFormData = { ...flattenedFormData, ...context.siteData.global };
    }
    
    if (context?.siteData?.pages) {
      const activePage = context.siteData.pages.find((p: any) => {
         if (p.path === '/') return pathname === '/' || pathname.endsWith('/origin') || pathname.endsWith('/velocity');
         return pathname.includes(p.path);
      }) || context.siteData.pages[0];

      activePage?.sections?.forEach((section: any) => {
        flattenedFormData = { ...flattenedFormData, ...section.props };
      });
    }

    return { 
      colors: {}, 
      fonts: {}, 
      formData: flattenedFormData,
      products: context?.products || []
    };
  }, [context?.siteData, context?.products, pathname]);

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

