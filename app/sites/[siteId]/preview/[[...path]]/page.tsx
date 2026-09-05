import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TemplateRenderer } from '@/components/TemplateRenderer';
import { resolveSiteData } from '@/lib/schema';

export default async function PreviewSitePage({ params }: { params: Promise<{ siteId: string, path?: string[] }> | { siteId: string, path?: string[] } }) {
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

  // 4. Resolve path
  let relativePath = '/';
  if (path && path.length > 0) {
    relativePath = '/' + path.join('/');
  }

  return (
    <TemplateRenderer
      siteData={schema}
      products={site.products}
      basePath={`/sites/${siteId}/preview`}
      activePath={relativePath}
      isBuilderContext={false}
      siteId={site.id}
    />
  );
}
