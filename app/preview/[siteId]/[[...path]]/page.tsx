import React from 'react';
import { notFound } from 'next/navigation';
import { CustomizationProvider } from '@/context/CustomizationContext';
import { resolveSiteData } from '@/lib/schema';
import { TEMPLATE_COMPONENTS } from '@/lib/template-components';
import { prisma } from '@/lib/prisma';

export default async function LivePreviewRouter({ params }: { params: Promise<{ siteId: string, path?: string[] }> | { siteId: string, path?: string[] } }) {
  const resolvedParams = await params;
  const { siteId, path } = resolvedParams;
  
  // Directly query the database for the preview (since this runs in the same backend)
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      products: { where: { status: 'ACTIVE' } }
    }
  });

  if (!site) {
    return notFound();
  }
  
  const schema = resolveSiteData(site.schema || {}, site.name);
  const templateSlug = schema.global?.templateSlug || 'velocity';
  
  // Resolve path
  let relativePath = '/';
  if (path && path.length > 0) {
    relativePath = '/' + path.join('/');
  }

  // Find component map for template
  const templateRoutes = TEMPLATE_COMPONENTS[templateSlug];
  if (!templateRoutes) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1>Template {templateSlug} not connected to live router yet.</h1>
      </div>
    );
  }

  // Exact match, or fallback to root if not found
  // For dynamic routes (like /products/123), a basic static router won't match exactly.
  // In a robust implementation, we would use a regex router for `[id]` paths.
  // We'll implement a simple matcher for `[id]`.
  let TemplateComponent = templateRoutes[relativePath];

  if (!TemplateComponent) {
    // Try to match dynamic routes like /products/[id]
    if (path && path.length === 2 && path[0] === 'products') {
       TemplateComponent = templateRoutes['/products/[id]'];
    }
  }

  // If still not found, render 404 or fallback to home
  if (!TemplateComponent) {
     TemplateComponent = templateRoutes['/'];
  }

  return (
    <CustomizationProvider siteData={schema} products={site.products}>
      <TemplateComponent params={resolvedParams} />
    </CustomizationProvider>
  );
}
