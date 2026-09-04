"use client";

import React, { Component, ReactNode } from 'react';
import { resolveTemplateRenderer } from '@/lib/template-components';
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

class TemplateErrorBoundary extends Component<{ children: ReactNode; templateSlug: string }, { hasError: boolean; error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`Template Error in [${this.props.templateSlug}]:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center bg-[#0d0d0d] text-white p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-semibold mb-2">Unable to render template ({this.props.templateSlug})</h2>
          <p className="text-white/50 text-xs max-w-md mb-4 font-mono">
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Retry Render
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function TemplateRenderer({ siteData, products, basePath, activePath, isBuilderContext, onNavigate, siteId }: TemplateRendererProps) {
  const { templateSlug, templateRoutes, TemplateLayout } = resolveTemplateRenderer(siteData);

  // Exact match
  let TemplateComponent = templateRoutes ? templateRoutes[activePath] : null;

  // Match dynamic paths like /products/[id]
  if (!TemplateComponent && templateRoutes) {
    const parts = activePath.split('/').filter(Boolean);
    if (parts.length === 2 && parts[0] === 'products') {
      TemplateComponent = templateRoutes['/products/[id]'];
    }
  }

  // Graceful fallback to root path if specific route not found but root exists
  if (!TemplateComponent && templateRoutes) {
    TemplateComponent = templateRoutes['/'] || Object.values(templateRoutes)[0];
  }

  if (!TemplateComponent) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-[#0d0d0d] text-white p-6 text-center">
        <h1 className="text-xl font-bold mb-2">404 - Page Not Found</h1>
        <p className="text-white/60 text-sm">The route <strong>{activePath}</strong> does not exist in template <strong>{templateSlug}</strong>.</p>
      </div>
    );
  }

  return (
    <TemplateErrorBoundary templateSlug={templateSlug}>
      <CustomizationProvider 
        siteData={siteData} 
        products={products} 
        basePath={basePath}
        isBuilderContext={isBuilderContext}
        activePath={activePath}
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
    </TemplateErrorBoundary>
  );
}
