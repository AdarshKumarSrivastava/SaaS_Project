import { notFound } from 'next/navigation';
import { prisma } from '@/server/lib/prisma';
import { TemplateRenderer } from '@/components/TemplateRenderer';
import type { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ domain: string, path?: string[] }> 
}): Promise<Metadata> {
  const { domain } = await params;
  const subdomain = domain.replace('%3A', ':').split(':')[0];
  
  const site = await prisma.site.findUnique({
    where: { subdomain }
  });

  if (!site || site.status !== 'published') {
    return {
      title: 'Not Found'
    };
  }

  const deployment = await prisma.deployment.findFirst({
    where: { siteId: site.id, status: 'LIVE' },
    orderBy: { createdAt: 'desc' }
  });

  const schema = deployment?.schema as any;
  const siteName = schema?.global?.name || site.name;
  const description = schema?.global?.description || `Welcome to ${siteName}, powered by BuildSpace.`;

  return {
    title: siteName,
    description,
    openGraph: {
      title: siteName,
      description,
      siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
    },
  };
}

export default async function PublicSitePage({ 
  params 
}: { 
  params: Promise<{ domain: string, path?: string[] }> 
}) {
  const { domain, path } = await params;
  
  // Clean up domain (just in case)
  const subdomain = domain.replace('%3A', ':').split(':')[0];

  // 1. Fetch site
  const site = await prisma.site.findUnique({
    where: { subdomain }
  });

  if (!site || site.status !== 'published') {
    return notFound();
  }

  // 2. Fetch the active LIVE deployment
  const deployment = await prisma.deployment.findFirst({
    where: { siteId: site.id, status: 'LIVE' },
    orderBy: { createdAt: 'desc' }
  });

  if (!deployment || !deployment.schema) {
    return notFound();
  }

  // 3. Fetch LIVE products (so admin updates to products show instantly on live sites)
  const products = await prisma.product.findMany({
    where: { siteId: site.id, status: 'ACTIVE' },
    include: { variants: true }
  });

  // 4. Determine active path
  const activePath = path && path.length > 0 ? `/${path.join('/')}` : '/';

  // 5. Render directly through centralized TemplateRenderer
  return (
    <TemplateRenderer
      siteData={deployment.schema as any}
      products={products as any}
      activePath={activePath}
      basePath=""
      isBuilderContext={false}
      siteId={site.id}
    />
  );
}
