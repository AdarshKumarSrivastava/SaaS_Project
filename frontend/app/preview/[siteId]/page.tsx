import React from 'react';
import { notFound } from 'next/navigation';
import { RenderBlock, Section } from '@/components/builder/Registry';

export default async function PreviewPage({ params }: { params: { siteId: string } }) {
  const { siteId } = params;
  
  // Fetch from the public, unauthenticated endpoint
  const res = await fetch(`http://localhost:3001/api/public/sites/${siteId}`, {
    cache: 'no-store' // Ensure we always see the latest draft for MVP
  });
  
  if (!res.ok) {
    return notFound();
  }
  
  const site = await res.json();
  const schema: Section[] = Array.isArray(site.schema) ? site.schema : [];

  return (
    <main className="min-h-screen bg-black text-white w-full">
      {/* 
        This is the absolute magic of the registry pattern.
        We simply iterate over the exact JSON saved by the visual builder,
        and render it as completely static React components without any
        of the heavy drag-and-drop or context wrappers.
      */}
      {schema.length === 0 ? (
        <div className="flex items-center justify-center min-h-[50vh] text-zinc-500">
          This site is currently empty.
        </div>
      ) : (
        <div className="w-full flex flex-col space-y-1">
          {schema.map((section: Section) => (
            <div key={section.id} className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4">
              <RenderBlock section={section} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
