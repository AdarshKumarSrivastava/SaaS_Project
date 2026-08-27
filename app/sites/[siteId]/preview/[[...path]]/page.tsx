import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CustomizationProvider } from '@/context/CustomizationContext';
import { resolveSiteData } from '@/lib/schema';
import { TEMPLATE_COMPONENTS, TEMPLATE_LAYOUTS } from '@/lib/template-components';

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
  const templateSlug = schema.global?.templateSlug || 'velocity';

  // 4. Resolve path
  let relativePath = '/';
  if (path && path.length > 0) {
    relativePath = '/' + path.join('/');
  }

  // 5. Find component map for template
  const templateRoutes = TEMPLATE_COMPONENTS[templateSlug];
  const TemplateLayout = TEMPLATE_LAYOUTS[templateSlug] || React.Fragment;
  
  if (!templateRoutes) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-center p-6">
        <h1>Template "{templateSlug}" is not connected to the renderer yet.</h1>
      </div>
    );
  }

  let TemplateComponent = templateRoutes[relativePath];

  if (!TemplateComponent) {
    if (path && path.length === 2 && path[0] === 'products') {
       TemplateComponent = templateRoutes['/products/[id]'];
    }
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
