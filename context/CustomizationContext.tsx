"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { getStorefrontProducts } from '@/lib/storefront';

interface CustomizationContextType {
  siteData: any;
  products: any[];
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export function CustomizationProvider({ 
  children, 
  siteData,
  products
}: { 
  children: ReactNode; 
  siteData: any;
  products: any[];
}) {
  const templateSlug = siteData?.global?.templateSlug || 'velocity';
  const mergedProducts = getStorefrontProducts(templateSlug, products || []);

  return (
    <CustomizationContext.Provider value={{ siteData, products: mergedProducts }}>
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomizationContext() {
  return useContext(CustomizationContext);
}
