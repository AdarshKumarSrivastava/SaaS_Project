import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CustomizationProvider } from '@/context/CustomizationContext';
import { resolveSiteData } from '@/lib/schema';
import { resolveTemplateRenderer } from '@/lib/template-components';

export default async function PreviewSitePage({ params }: { params: Promise<{ siteId: string, path?: string[] }> | { siteId: string, path?: string[] } }) {
  // Await params if it's a promise (Next.js 15+ behavior)
  const resolvedParams = await params;
  const { siteId, path } = resolvedParams;

  // 1. Fetch site with working schema (not published deployment)
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      products: {
        where: { status: 'ACTIVE' },
      }
    }
  });

  if (!site) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Site Not Found</h1>
        <p className="text-white/60 mb-8 max-w-md">
          The requested site does not exist or you don't have access.
        </p>
      </div>
    );
  }

  // 2. Parse the working schema
  let workingSchema: any = {};
  try {
    workingSchema = typeof site.schema === 'string'
      ? JSON.parse(site.schema)
      : (site.schema || {});
  } catch (e) {
    console.error("Failed to parse working schema", e);
    return notFound();
  }

  // 3. Resolve canonical schema
  const schema = resolveSiteData(workingSchema, site.name);
  const { templateSlug, templateRoutes, TemplateLayout } = resolveTemplateRenderer(schema);

  // 4. Resolve path
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

  // Graceful fallback to root
  if (!TemplateComponent && templateRoutes) {
    TemplateComponent = templateRoutes['/'];
  }

  if (!TemplateComponent) {
     return notFound();
  }

  return (
    <CustomizationProvider siteData={schema} products={site.products} basePath={`/sites/${siteId}/preview`}>
      <TemplateLayout>
        <TemplateComponent params={resolvedParams} />
      </TemplateLayout>
    </CustomizationProvider>
  );
}
