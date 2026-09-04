import { BuilderProvider } from '@/context/BuilderContext';
import React from 'react';

export default async function BuilderLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode; 
  params: Promise<{ siteId: string }>;
}) {
  const resolvedParams = await params;
  return (
    <BuilderProvider siteId={resolvedParams.siteId}>
      {children}
    </BuilderProvider>
  );
}
