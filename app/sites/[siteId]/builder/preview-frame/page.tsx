"use client";

import React, { useState, useEffect } from 'react';
import { TemplateRenderer } from '@/components/TemplateRenderer';
import { useParams } from 'next/navigation';

export default function PreviewFramePage() {
  const params = useParams();
  const [siteData, setSiteData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [activePath, setActivePath] = useState<string>('/');

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'UPDATE_SCHEMA') {
        setSiteData(e.data.payload.siteData || e.data.payload);
        if (e.data.payload.products) {
          setProducts(e.data.payload.products);
        }
        if (e.data.payload.activePath) {
          setActivePath(e.data.payload.activePath);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Tell the parent builder shell that the iframe is ready to receive data
    window.parent.postMessage({ type: 'TEMPLATE_READY' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!siteData) {
    return (
      <div className="w-full h-full min-h-[100dvh] bg-white flex items-center justify-center">
        <div className="text-black/50 text-sm font-medium animate-pulse">Loading preview...</div>
      </div>
    );
  }

  return (
    <div id="preview-scroll-container" className="w-full h-full min-h-[100dvh] relative bg-white">
      <TemplateRenderer
        siteData={siteData}
        products={products}
        basePath={`/sites/${params?.siteId}/builder`}
        activePath={activePath}
        isBuilderContext={true}
        onNavigate={(path) => {
          // Send navigation intent to the parent
          window.parent.postMessage({ type: 'NAVIGATE', path }, '*');
        }}
      />
    </div>
  );
}
