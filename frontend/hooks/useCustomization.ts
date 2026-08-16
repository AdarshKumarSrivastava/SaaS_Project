"use client";
import { useState, useEffect } from 'react';

export const useCustomization = () => {
  const [data, setData] = useState({ colors: {}, fonts: {}, formData: {} as any });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_SCHEMA') {
         // Flatten the multi-page schema into a simple formData object for the template to consume
         const payload = event.data.payload;
         let flattenedFormData = {};
         
         if (payload?.pages) {
            payload.pages.forEach((page: any) => {
               page.sections?.forEach((section: any) => {
                  flattenedFormData = { ...flattenedFormData, ...section.props };
               });
            });
         }
         if (payload?.global) {
            flattenedFormData = { ...flattenedFormData, ...payload.global };
         }

         console.log("[useCustomization] Received UPDATE_SCHEMA:", flattenedFormData);
         setData({ colors: {}, fonts: {}, formData: flattenedFormData });
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request initial data from parent
    if (window.parent && window.parent !== window) {
      console.log("[useCustomization] Requesting initial data via TEMPLATE_READY");
      window.parent.postMessage({ type: 'TEMPLATE_READY' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return data;
};
