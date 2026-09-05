import React from 'react';
import { notFound } from 'next/navigation';
import { resolveSiteData } from '@/lib/schema';
import { TemplateRenderer } from '@/components/TemplateRenderer';
import { prisma } from '@/lib/prisma';

export default async function LivePreviewRouter({ params }: { params: Promise<{ siteId: string, path?: string[] }> | { siteId: string, path?: string[] } }) {
  const resolvedParams = await params;
  const { siteId, path } = resolvedParams;
  
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
  
  let relativePath = '/';
  if (path && path.length > 0) {
    relativePath = '/' + path.join('/');
  }

  return (
    <TemplateRenderer
      siteData={schema}
      products={site.products}
      basePath={`/preview/${siteId}`}
      activePath={relativePath}
      isBuilderContext={false}
      siteId={site.id}
    />
  );
}
