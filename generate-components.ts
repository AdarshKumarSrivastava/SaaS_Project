import fs from 'fs';
import path from 'path';

const templatesDir = path.join(__dirname, 'app/templates');
const templates = fs.readdirSync(templatesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

let registry = 'export const TEMPLATE_COMPONENTS: Record<string, Record<string, React.ComponentType<any>>> = {\n';
let layoutsRegistry = 'export const TEMPLATE_LAYOUTS: Record<string, React.ComponentType<any>> = {\n';
let loadersRegistry = 'export const TEMPLATE_LOADERS: Record<string, Record<string, () => Promise<any>>> = {\n';

function scanDir(basePath: string, relativePath: string, template: string) {
  const currentPath = path.join(basePath, relativePath);
  const items = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      scanDir(basePath, path.join(relativePath, item.name), template);
    } else if (item.name === 'page.tsx') {
      const routePath = relativePath === '' ? '/' : `/${relativePath.replace(/\\/g, '/')}`;
      const importPath = `@/app/templates/${template}${routePath === '/' ? '' : routePath}/page`;
      registry += `    '${routePath}': dynamic(() => import('${importPath}')),\n`;
      loadersRegistry += `    '${routePath}': () => import('${importPath}'),\n`;
    } else if (relativePath === '' && item.name === 'layout.tsx') {
      const importPath = `@/app/templates/${template}/layout`;
      layoutsRegistry += `  '${template}': dynamic(() => import('${importPath}')),\n`;
    }
  }
}

for (const template of templates) {
  registry += `  '${template}': {\n`;
  loadersRegistry += `  '${template}': {\n`;
  scanDir(path.join(templatesDir, template), '', template);
  registry += `  },\n`;
  loadersRegistry += `  },\n`;
}

registry += '};\n';
layoutsRegistry += '};\n';
loadersRegistry += '};\n';

const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
import React from 'react';
import dynamic from 'next/dynamic';
import { normalizeTemplateKey } from './template-registry';

${registry}
${layoutsRegistry}
${loadersRegistry}
// Aliases and fallback support
TEMPLATE_COMPONENTS['nexus_pro'] = TEMPLATE_COMPONENTS['nexus-pro'];
TEMPLATE_COMPONENTS['default'] = TEMPLATE_COMPONENTS['velocity'];

TEMPLATE_LAYOUTS['nexus_pro'] = TEMPLATE_LAYOUTS['nexus-pro'];
TEMPLATE_LAYOUTS['default'] = TEMPLATE_LAYOUTS['velocity'];

TEMPLATE_LOADERS['nexus_pro'] = TEMPLATE_LOADERS['nexus-pro'];
TEMPLATE_LOADERS['default'] = TEMPLATE_LOADERS['velocity'];

/**
 * Preloads all route chunks for a template into browser memory in the background
 */
export function preloadTemplateRoutes(templateSlug: string) {
  if (typeof window === 'undefined') return;
  const loaders = TEMPLATE_LOADERS[templateSlug] || TEMPLATE_LOADERS['velocity'];
  if (loaders) {
    // Stagger / queue background preloading during browser idle frames
    const preloadAll = () => {
      Object.values(loaders).forEach(loader => {
        try {
          loader();
        } catch {
          // ignore
        }
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloadAll, { timeout: 2000 });
    } else {
      setTimeout(preloadAll, 50);
    }
  }
}

/**
 * Centralized template resolver: Single Source of Truth
 * Resolves the canonical template slug, route component map, and layout.
 */
export function resolveTemplateRenderer(templateSlugOrSiteData: any) {
  let rawSlug: string | undefined;
  let hintData: any;

  if (typeof templateSlugOrSiteData === 'string') {
    rawSlug = templateSlugOrSiteData;
  } else if (templateSlugOrSiteData && typeof templateSlugOrSiteData === 'object') {
    rawSlug = templateSlugOrSiteData.global?.templateSlug || templateSlugOrSiteData.templateSlug || templateSlugOrSiteData.category;
    hintData = templateSlugOrSiteData;
  }

  const slug = normalizeTemplateKey(rawSlug, hintData);
  const templateRoutes = TEMPLATE_COMPONENTS[slug] || TEMPLATE_COMPONENTS['velocity'];
  const TemplateLayout = TEMPLATE_LAYOUTS[slug] || TEMPLATE_LAYOUTS['velocity'] || React.Fragment;

  return {
    templateSlug: slug,
    templateRoutes,
    TemplateLayout,
  };
}
`;

fs.writeFileSync(path.join(__dirname, 'lib/template-components.ts'), fileContent);
console.log('Successfully generated dynamic lib/template-components.ts with preloaders');
