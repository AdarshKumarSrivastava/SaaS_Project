import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CustomizationProvider } from '@/context/CustomizationContext';
import { resolveSiteData } from '@/lib/schema';
import { resolveTemplateRenderer } from '@/lib/template-components';

export default async function LiveSitePage({ params }: { params: Promise<{ siteId: string, path?: string[] }> | { siteId: string, path?: string[] } }) {
  // Await params if it's a promise (Next.js 15+ behavior)
  const resolvedParams = await params;
  const { siteId, path } = resolvedParams;

  // 1. Fetch site with published deployment
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      publishedDeployment: true,
      products: {
        where: { status: 'ACTIVE' },
      }
    }
  });

  if (!site || !site.publishedDeployment) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Site Not Published</h1>
        <p className="text-white/60 mb-8 max-w-md">
          This site does not have an active deployment yet.
        </p>
      </div>
    );
  }

  // 2. Parse the deployment schema
  let deploymentSchema: any = {};
  try {
    deploymentSchema = typeof site.publishedDeployment.schema === 'string'
      ? JSON.parse(site.publishedDeployment.schema)
      : site.publishedDeployment.schema;
  } catch (e) {
    console.error("Failed to parse deployment schema", e);
    return notFound();
  }

  // 3. Resolve canonical schema
  const schema = resolveSiteData(deploymentSchema, site.name);
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
    <CustomizationProvider siteData={schema} products={site.products} basePath={`/sites/${siteId}/live`}>
      <TemplateLayout>
        <TemplateComponent params={resolvedParams} />
      </TemplateLayout>
    </CustomizationProvider>
  );
}
