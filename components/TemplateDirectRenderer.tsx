"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CustomizationProvider } from "@/context/CustomizationContext";
import { getTemplateConfig } from "@/lib/template-registry";

export function TemplateDirectRenderer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render once mounted to avoid hydration mismatch with usePathname
  if (!mounted) return <>{children}</>;

  // Extract template slug from pathname, e.g. /templates/minimalist -> minimalist
  // If it's a deeper route, like /templates/minimalist/products, it still gets "minimalist"
  const parts = pathname?.split('/') || [];
  
  // parts[0] is empty string, parts[1] is "templates", parts[2] is the slug
  const templateSlug = parts.length > 2 ? parts[2] : '';

  if (!templateSlug) {
    return <>{children}</>;
  }

  // Get the default schema for this template
  const config = getTemplateConfig(templateSlug);
  
  // If this isn't a recognized template, just render children
  if (!config) {
    return <>{children}</>;
  }

  // Use the template's canonical brand name instead of generic "Template Preview"
  const templateBrandName = config.name ? `My ${config.name}` : templateSlug.charAt(0).toUpperCase() + templateSlug.slice(1);
  const siteData = config.defaultSchema(templateBrandName);

  return (
    <CustomizationProvider
      siteData={siteData}
      products={[]}
      basePath={`/templates/${templateSlug}`}
      isBuilderContext={false}
      activePath={pathname || '/'}
    >
      {children}
    </CustomizationProvider>
  );
}
