import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TemplateRenderer } from '@/components/TemplateRenderer';
import { resolveSiteData } from '@/lib/schema';

export default async function LiveSitePage({ params }: { params: Promise<{ siteId: string, path?: string[] }> | { siteId: string, path?: string[] } }) {
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

  // 4. Resolve path
  let relativePath = '/';
  if (path && path.length > 0) {
    relativePath = '/' + path.join('/');
  }

  return (
    <TemplateRenderer
      siteData={schema}
      products={site.products}
      basePath={`/sites/${siteId}/live`}
      activePath={relativePath}
      isBuilderContext={false}
      siteId={site.id}
    />
  );
}
