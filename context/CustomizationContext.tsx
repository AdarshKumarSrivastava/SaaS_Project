"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { getStorefrontProducts } from '@/lib/storefront';

interface CustomizationContextType {
  basePath?: string;
  siteData: any;
  products: any[];
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export function CustomizationProvider({ 
  children, 
  siteData,
  products,
  basePath
}: { 
  children: ReactNode; 
  siteData: any;
  products: any[];
  basePath?: string;
}) {
  const templateSlug = siteData?.global?.templateSlug || 'velocity';
  const mergedProducts = getStorefrontProducts(templateSlug, products || []);
  const theme = siteData?.global?.theme;

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
    <CustomizationContext.Provider value={{ siteData, products: mergedProducts, basePath }}>
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomizationContext() {
  return useContext(CustomizationContext);
}
