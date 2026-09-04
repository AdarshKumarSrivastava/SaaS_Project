import { TEMPLATE_REGISTRY, normalizeTemplateKey, getTemplateConfig } from './template-registry';

/**
 * Deep merges site overrides into the canonical default schema.
 * This ensures that a site override NEVER destroys the original template structure.
 */
export function mergeSchema(defaultSchema: any, overrides: any) {
  if (!overrides || typeof overrides !== 'object') return defaultSchema;

  const merged = { ...defaultSchema, ...overrides };

  if (defaultSchema.global) {
    const defaultTheme = {
      colors: {
        background: '#fdfbf7',
        foreground: '#402c21',
        primary: '#a38c7f',
        accent: '#e5e0dc'
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Inter'
      },
      layout: {
        containerWidth: '1400px',
        spacing: '1rem'
      }
    };
    
    merged.global = { 
      ...defaultSchema.global, 
      ...(overrides.global || {}),
      theme: {
        ...defaultTheme,
        ...(defaultSchema.global.theme || {}),
        ...(overrides.global?.theme || {})
      }
    };
  }

  if (overrides.pages && Array.isArray(overrides.pages) && overrides.pages.length > 0) {
    merged.pages = overrides.pages.map((overridePage: any) => {
      const defaultPage = defaultSchema.pages?.find((p: any) => p.path === overridePage.path);
      
      if (!defaultPage) return overridePage;

      return {
        ...overridePage,
        sections: (overridePage.sections || []).map((overrideSection: any) => {
          // Find matching default section by type
          // We match by relative order of that type in the page
          const defaultSectionsOfType = defaultPage.sections.filter((s: any) => s.type === overrideSection.type);
          const overrideSectionsOfType = overridePage.sections.filter((s: any) => s.type === overrideSection.type);
          
          const typeIndex = overrideSectionsOfType.indexOf(overrideSection);
          const defaultSection = defaultSectionsOfType[typeIndex];

          if (defaultSection) {
            return {
              ...overrideSection,
              props: {
                ...defaultSection.props,
                ...(overrideSection.props || {})
              }
            };
          }
          return overrideSection;
        })
      };
    });
  }

  return merged;
}

/**
 * Computes the delta/overrides between the Canonical Template and the user's modifications.
 */
export function extractOverrides(defaultSchema: any, modifiedSchema: any) {
  const overrides: any = {};

  if (modifiedSchema.global) {
    overrides.global = { ...modifiedSchema.global };
    if (modifiedSchema.global.theme) {
      overrides.global.theme = { ...modifiedSchema.global.theme };
    }
  }

  // The new architecture treats the Builder's modified schema as the absolute source of truth.
  // We no longer attempt to extract minimal diffs, because doing so destroys structural
  // changes like reordering, adding, or deleting sections.
  if (modifiedSchema.pages && Array.isArray(modifiedSchema.pages)) {
    overrides.pages = modifiedSchema.pages;
  }

  return overrides;
}

/**
 * Convenience function to resolve a site's full schema directly from its DB schema object
 */
export function resolveSiteData(siteSchema: any, siteName: string = 'My Site') {
  const rawSlug = siteSchema?.global?.templateSlug;
  const templateSlug = normalizeTemplateKey(rawSlug, siteSchema || siteName);
  const templateConfig = getTemplateConfig(templateSlug, siteSchema || siteName);
  const defaultSchema = templateConfig.defaultSchema(siteName);
  
  return mergeSchema(defaultSchema, siteSchema);
}
