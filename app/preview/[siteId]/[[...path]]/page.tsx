import React from 'react';
import { notFound } from 'next/navigation';
import { CustomizationProvider } from '@/context/CustomizationContext';
import { resolveSiteData } from '@/lib/schema';
import { resolveTemplateRenderer } from '@/lib/template-components';
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
  const { templateSlug, templateRoutes } = resolveTemplateRenderer(schema);
  
  // Resolve path
  let relativePath = '/';
  if (path && path.length > 0) {
    relativePath = '/' + path.join('/');
  }

  let TemplateComponent = templateRoutes ? templateRoutes[relativePath] : null;

  if (!TemplateComponent && templateRoutes) {
    if (path && path.length === 2 && path[0] === 'products') {
       TemplateComponent = templateRoutes['/products/[id]'];
    }
  }

  // If still not found, fallback to home
  if (!TemplateComponent && templateRoutes) {
     TemplateComponent = templateRoutes['/'];
  }

  if (!TemplateComponent) {
    return notFound();
  }

  return (
    <CustomizationProvider siteData={schema} products={site.products}>
      <TemplateComponent params={resolvedParams} />
    </CustomizationProvider>
  );
}
