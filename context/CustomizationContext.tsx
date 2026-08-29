"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { getStorefrontProducts } from '@/lib/storefront';

interface CustomizationContextType {
  basePath?: string;
  siteData: any;
  products: any[];
  isBuilderContext?: boolean;
  onNavigate?: (path: string) => void;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export function CustomizationProvider({ 
  children, 
  siteData: initialSiteData,
  products: initialProducts,
  basePath,
  isBuilderContext,
  onNavigate
}: { 
  children: ReactNode; 
  siteData: any;
  products: any[];
  basePath?: string;
  isBuilderContext?: boolean;
  onNavigate?: (path: string) => void;
}) {
  const [siteData, setSiteData] = React.useState(initialSiteData);
  const [products, setProducts] = React.useState(initialProducts);

  useEffect(() => {
    setSiteData(initialSiteData);
  }, [initialSiteData]);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const templateSlug = siteData?.global?.templateSlug || 'velocity';
  const mergedProducts = getStorefrontProducts(templateSlug, products || []);
  const theme = siteData?.global?.theme;

  useEffect(() => {
    // If not in browser, abort
    if (typeof window === 'undefined') return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FOCUS_ELEMENT') {
         const { fieldKey, sectionId } = event.data;
         
         const target = ((fieldKey ? document.querySelector(`[data-field-key="${fieldKey}"]`) : null) 
                     || (sectionId ? document.querySelector(`[data-section-id="${sectionId}"]`) : null)) as HTMLElement;

         if (!target) {
            console.warn(`Preview target not found: ${fieldKey || sectionId}`);
            return;
         }

         // Calculate safe scroll offset (ensuring only the preview scrolls)
         const scrollContainer = document.getElementById('preview-scroll-container') || (document.scrollingElement || document.documentElement) as HTMLElement;
         const containerRect = scrollContainer.getBoundingClientRect();
         const targetRect = target.getBoundingClientRect();
         
         const offset = targetRect.top - containerRect.top + scrollContainer.scrollTop;
         
         scrollContainer.scrollTo({
           top: offset - (containerRect.height / 2) + (targetRect.height / 2),
           behavior: "smooth"
         });
      }
    };
    window.addEventListener('message', handleMessage);

    // Request initial data from parent if we are in an iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'TEMPLATE_READY' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (!theme) return;
    
    const root = document.documentElement;
    if (theme.colors) {
      if (theme.colors.background) root.style.setProperty('--color-background', theme.colors.background);
      if (theme.colors.foreground) root.style.setProperty('--color-foreground', theme.colors.foreground);
      if (theme.colors.primary) root.style.setProperty('--color-primary', theme.colors.primary);
      if (theme.colors.accent) root.style.setProperty('--color-accent', theme.colors.accent);
    }
    if (theme.typography) {
      if (theme.typography.headingFont) root.style.setProperty('--font-heading', `"${theme.typography.headingFont}", serif`);
      if (theme.typography.bodyFont) root.style.setProperty('--font-body', `"${theme.typography.bodyFont}", sans-serif`);
    }
    if (theme.layout) {
      if (theme.layout.containerWidth) root.style.setProperty('--container-width', theme.layout.containerWidth);
      if (theme.layout.spacing) root.style.setProperty('--spacing-md', theme.layout.spacing);
    }
  }, [theme]);

  return (
    <CustomizationContext.Provider value={{ siteData, products: mergedProducts, basePath, isBuilderContext, onNavigate }}>
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomizationContext() {
  return useContext(CustomizationContext);
}
