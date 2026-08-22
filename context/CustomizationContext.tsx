"use client";

import React, { createContext, useContext, ReactNode } from 'react';

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
  return (
    <CustomizationContext.Provider value={{ siteData, products }}>
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomizationContext() {
  return useContext(CustomizationContext);
}
