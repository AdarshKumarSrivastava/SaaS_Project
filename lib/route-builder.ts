import { getTemplateConfig } from './template-registry';

interface RouteBuilderParams {
  templateSlug?: string | null;
  page?: string | null;
  basePath?: string | null;
}

/**
 * Builds a deterministic, safe route for any template or project.
 * Never returns URLs containing "undefined", "null", or "[object Object]".
 */
export function buildRoutePath({ templateSlug, page, basePath }: RouteBuilderParams): string {
  // 1. Clean the page path
  let cleanPage = '';
  if (page && typeof page === 'string') {
    cleanPage = page.toLowerCase().trim();
    if (!cleanPage.startsWith('/')) {
      cleanPage = '/' + cleanPage;
    }
    // Normalize /home to /
    if (cleanPage === '/home') {
      cleanPage = '';
    }
  }

  // 2. If we have a valid basePath, use it (handles /sites/123/builder, /sites/123/live, etc.)
  if (basePath && typeof basePath === 'string' && basePath.trim() !== '') {
    let cleanBase = basePath.trim();
    if (cleanBase.endsWith('/')) {
      cleanBase = cleanBase.slice(0, -1);
    }
    
    // Prevent basePath from ending in "/undefined" (defensive)
    if (cleanBase.endsWith('/undefined')) {
      cleanBase = cleanBase.replace(/\/undefined$/, '/velocity'); // Safe fallback
    }

    return `${cleanBase}${cleanPage}` || '/';
  }

  // 3. Fallback to /templates/[slug]/[page]
  let safeSlug = 'velocity';
  
  if (templateSlug && typeof templateSlug === 'string' && templateSlug.trim() !== '' && templateSlug !== 'undefined' && templateSlug !== 'null') {
    // Resolve through registry to get authoritative slug
    const config = getTemplateConfig(templateSlug);
    if (config) {
      safeSlug = config.id.replace(/^(starter|growth|premium)-/, '');
    }
  }

  return `/templates/${safeSlug}${cleanPage}` || '/';
}
