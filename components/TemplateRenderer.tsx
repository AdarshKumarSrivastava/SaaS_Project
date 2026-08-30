"use client";

import React, { useMemo } from 'react';
import { TEMPLATE_COMPONENTS, TEMPLATE_LAYOUTS } from '@/lib/template-components';
import { CustomizationProvider } from '@/context/CustomizationContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import { BuilderOverlay } from '@/components/builder/BuilderOverlay';

interface TemplateRendererProps {
  siteData: any;
  products: any[];
  basePath: string;
  activePath: string;
  isBuilderContext?: boolean;
  onNavigate?: (path: string) => void;
  siteId?: string;
}

export function TemplateRenderer({ siteData, products, basePath, activePath, isBuilderContext, onNavigate, siteId }: TemplateRendererProps) {
  const templateSlug = siteData?.global?.templateSlug || 'velocity';

  const templateRoutes = TEMPLATE_COMPONENTS[templateSlug];
  const TemplateLayout = TEMPLATE_LAYOUTS[templateSlug] || React.Fragment;

  if (!templateRoutes) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white p-6">
        <h1>Template "{templateSlug}" is not connected to the renderer.</h1>
      </div>
    );
  }

  // Exact match
  let TemplateComponent = templateRoutes[activePath];

  // Rough matcher for dynamic paths like /products/[id] in preview context
  if (!TemplateComponent) {
    const parts = activePath.split('/').filter(Boolean);
    if (parts.length === 2 && parts[0] === 'products') {
      TemplateComponent = templateRoutes['/products/[id]'];
    }
  }

  if (!TemplateComponent) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-6">
        <h1 className="text-xl font-bold mb-2">404 - Page Not Found</h1>
        <p className="text-white/60 text-sm">The route <strong>{activePath}</strong> does not exist in template <strong>{templateSlug}</strong>.</p>
      </div>
    );
  }

  return (
    <CustomizationProvider 
      siteData={siteData} 
      products={products} 
      basePath={basePath}
      isBuilderContext={isBuilderContext}
      onNavigate={onNavigate}
    >
      <CustomerAuthProvider siteId={siteId || ''}>
        <TemplateLayout>
          {isBuilderContext && <BuilderOverlay />}
          {/* Pass dummy params for dynamic components that expect it */}
          <TemplateComponent params={{ id: activePath.split('/')[2] || 'preview' }} />
        </TemplateLayout>
      </CustomerAuthProvider>
    </CustomizationProvider>
  );
}
