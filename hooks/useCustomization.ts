"use client";
import { useState, useEffect } from 'react';
import { useCustomizationContext } from '@/context/CustomizationContext';

export const useCustomization = () => {
  const context = useCustomizationContext();
  
  // If we have a context, we are in the live preview environment, not the builder iframe
  // Calculate initial flattened formData from context schema
  const initialFormData: Record<string, any> = (() => {
    let flattened: Record<string, any> = {};
    if (context?.siteData?.global) {
      flattened = { ...flattened, ...context.siteData.global };
    }
    if (context?.siteData?.pages) {
      context.siteData.pages.forEach((page: any) => {
        page.sections?.forEach((section: any) => {
          flattened = { ...flattened, ...section.props };
        });
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
    // We already seeded initialFormData.
    if (context) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_SCHEMA') {
         // Flatten the multi-page schema into a simple formData object for the template to consume
         const payload = event.data.payload;
         let flattenedFormData: Record<string, any> = {};
         
         if (payload?.global) {
            flattenedFormData = { ...flattenedFormData, ...payload.global };
         }
         
         if (payload?.pages) {
            payload.pages.forEach((page: any) => {
               page.sections?.forEach((section: any) => {
                  flattenedFormData = { ...flattenedFormData, ...section.props };
               });
            });
         }

         console.log("[useCustomization] Received UPDATE_SCHEMA:", flattenedFormData, payload.products);
         setData({ colors: {}, fonts: {}, formData: flattenedFormData, products: payload.products || [] });
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request initial data from parent
    if (window.parent && window.parent !== window) {
      console.log("[useCustomization] Requesting initial data via TEMPLATE_READY");
      window.parent.postMessage({ type: 'TEMPLATE_READY' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [context]);

  return data;
};

