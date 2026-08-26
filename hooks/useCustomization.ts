"use client";
import { useState, useEffect } from 'react';
import { useCustomizationContext } from '@/context/CustomizationContext';
import { getStorefrontProducts } from '@/lib/storefront';

export const useCustomization = () => {
  const context = useCustomizationContext();
  
  // If we have a context, we are in the live preview environment, not the builder iframe
  // Calculate initial flattened formData from context schema
  const initialFormData: Record<string, any> = (() => {
    let flattened: Record<string, any> = {};
    if (context?.siteData?.global) {
      flattened = { ...flattened, ...context.siteData.global };
    }
    
    // In live environments, determine which page we are on
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    
    if (context?.siteData?.pages) {
      const activePage = context.siteData.pages.find((p: any) => {
         if (p.path === '/') return currentPath === '/' || currentPath.endsWith('/origin') || currentPath.endsWith('/velocity');
         return currentPath.includes(p.path);
      }) || context.siteData.pages[0]; // fallback to first page

      activePage?.sections?.forEach((section: any) => {
        flattened = { ...flattened, ...section.props };
      });
    }
    return flattened;
  })();

  const [data, setData] = useState({ 
    colors: {}, 
    fonts: {}, 
    formData: initialFormData,
    products: context?.products || []
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If context exists, we don't need to listen to iframe messages
    if (context) return;
    
    // Dispatch navigation events back to the parent builder so it syncs its state
    const notifyParentOfNavigation = () => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'IFRAME_NAVIGATED', path: window.location.pathname }, '*');
      }
    };
    notifyParentOfNavigation();
    
    // Note: since this is a Next.js app router and layout doesn't rerender,
    // we also listen for popstate if using client side routing (though usually next/navigation is better)
    window.addEventListener('popstate', notifyParentOfNavigation);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_SCHEMA') {
         // Flatten the multi-page schema into a simple formData object for the template to consume
         const payload = event.data.payload;
         let flattenedFormData: Record<string, any> = {};
         
         if (payload?.global) {
            flattenedFormData = { ...flattenedFormData, ...payload.global };
         }
         
         if (payload?.pages) {
            // During builder preview, try to guess the page from URL or fallback
            const currentPath = window.location.pathname;
            const activePage = payload.pages.find((p: any) => {
               if (p.path === '/') return currentPath === '/' || currentPath.endsWith('/origin') || currentPath.endsWith('/velocity');
               return currentPath.includes(p.path);
            }) || payload.pages[0]; // fallback to first page

            activePage?.sections?.forEach((section: any) => {
               flattenedFormData = { ...flattenedFormData, ...section.props };
            });
         }

         console.log("[useCustomization] Received UPDATE_SCHEMA:", flattenedFormData, payload.products);
         
         const templateSlug = payload?.global?.templateSlug || 'velocity';
         const mergedProducts = getStorefrontProducts(templateSlug, payload.products || []);
         
         setData({ colors: {}, fonts: {}, formData: flattenedFormData, products: mergedProducts });
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request initial data from parent
    if (window.parent && window.parent !== window) {
      console.log("[useCustomization] Requesting initial data via TEMPLATE_READY");
      window.parent.postMessage({ type: 'TEMPLATE_READY' }, '*');
    }

    return () => {
       window.removeEventListener('message', handleMessage);
       window.removeEventListener('popstate', notifyParentOfNavigation);
    };
  }, [context]);

  return data;
};

