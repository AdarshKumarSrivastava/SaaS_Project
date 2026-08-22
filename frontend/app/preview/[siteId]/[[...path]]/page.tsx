import React from 'react';
import { notFound } from 'next/navigation';
import { CustomizationProvider } from '@/context/CustomizationContext';

// We map template slugs directly to their root components
import NexusProHomePage from '@/app/templates/nexus-pro/page';
import VelocityHomePage from '@/app/templates/velocity/page';
import QuantumHomePage from '@/app/templates/quantum/page';
// For multi-page we can also map the paths if needed, 
// e.g. /products maps to NexusProProductsPage.
// But wait, the prompt doesn't ask me to implement EVERY single page of EVERY template.
// I will implement the root pages and basic routing.

const templateMap: Record<string, React.ComponentType<any>> = {
  'nexus-pro': NexusProHomePage,
  'velocity': VelocityHomePage,
  'quantum': QuantumHomePage,
  // Add fallback placeholders if other templates are requested
};

export default async function LivePreviewRouter({ params }: { params: { siteId: string, path?: string[] } }) {
  const { siteId, path } = params;
  
  // Fetch from the public endpoint
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/sites/${siteId}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    return notFound();
  }
  
  const site = await res.json();
  const schema = site.schema || {};
  const templateSlug = schema.global?.templateSlug || 'velocity';
  
  let TemplateComponent = templateMap[templateSlug];

  if (!TemplateComponent) {
    // Fallback if template component not wired up yet
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1>Template {templateSlug} not connected to live router yet.</h1>
      </div>
    );
  }

  // Handle basic multi-page routing
  // Note: For a fully production scalable app, each template should export a component map
  // matching paths like `['products']` or `['products', '[id]']`. 
  // We will route just to the home page for now, as that's the core.

  return (
    <CustomizationProvider siteData={schema} products={site.products}>
      <TemplateComponent />
    </CustomizationProvider>
  );
}
