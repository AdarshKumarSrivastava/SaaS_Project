"use client";

import React, { createContext, useContext, ReactNode, useEffect, useMemo, useCallback, useRef } from 'react';
import { getStorefrontProducts } from '@/lib/storefront';
import { normalizeTemplateKey } from '@/lib/template-registry';

interface CustomizationContextType {
  basePath?: string;
  siteData: any;
  products: any[];
  isBuilderContext?: boolean;
  activePath?: string;
  onNavigate?: (path: string) => void;
  navigate: (path: string) => void;
  resolveRoute: (path: string) => string;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export function CustomizationProvider({ 
  children, 
  siteData: initialSiteData,
  products: initialProducts,
  basePath = "",
  isBuilderContext = false,
  activePath = "/",
  onNavigate
}: { 
  children: ReactNode; 
  siteData: any;
  products: any[];
  basePath?: string;
  isBuilderContext?: boolean;
  activePath?: string;
  onNavigate?: (path: string) => void;
}) {
  const [siteData, setSiteData] = React.useState(initialSiteData);
  const [products, setProducts] = React.useState(initialProducts);

  const prevSiteDataStr = useRef<string>('');
  const prevProductsStr = useRef<string>('');

  useEffect(() => {
    try {
      const serialized = JSON.stringify(initialSiteData);
      if (serialized !== prevSiteDataStr.current) {
        prevSiteDataStr.current = serialized;
        setSiteData(initialSiteData);
      }
    } catch {
      setSiteData(initialSiteData);
    }
  }, [initialSiteData]);

  useEffect(() => {
    try {
      const serialized = JSON.stringify(initialProducts);
      if (serialized !== prevProductsStr.current) {
        prevProductsStr.current = serialized;
        setProducts(initialProducts);
      }
    } catch {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  const rawTemplateSlug = siteData?.global?.templateSlug;
  const templateSlug = useMemo(() => normalizeTemplateKey(rawTemplateSlug, siteData), [rawTemplateSlug, siteData]);
  
  const mergedProducts = useMemo(() => {
    return getStorefrontProducts(templateSlug, products || []);
  }, [templateSlug, products]);

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

  const prevThemeStr = useRef<string>('');
  useEffect(() => {
    if (!theme) return;
    const themeStr = JSON.stringify(theme);
    if (themeStr === prevThemeStr.current) return;
    prevThemeStr.current = themeStr;
    
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

  const resolveRoute = useCallback((path: string) => {
    if (basePath && path.startsWith(basePath)) return path;
    const safePath = path.startsWith('/') ? path : `/${path}`;
    return `${basePath || ''}${safePath}`;
  }, [basePath]);

  const navigate = useCallback((path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  }, [onNavigate]);

  const contextValue = useMemo(() => ({
    siteData,
    products: mergedProducts,
    basePath,
    isBuilderContext,
    activePath,
    onNavigate,
    navigate,
    resolveRoute
  }), [siteData, mergedProducts, basePath, isBuilderContext, activePath, onNavigate, navigate, resolveRoute]);

  return (
    <CustomizationContext.Provider value={contextValue}>
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomizationContext() {
  return useContext(CustomizationContext);
}
