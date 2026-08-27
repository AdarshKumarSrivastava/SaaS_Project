import { TEMPLATE_REGISTRY } from './template-registry';

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

  if (defaultSchema.pages) {
    merged.pages = defaultSchema.pages.map((defaultPage: any, pIdx: number) => {
      // Find override by page path or ID, or simply index
      let overridePage = (overrides.pages || []).find((p: any) => p.id === defaultPage.id);
      if (!overridePage) {
        overridePage = (overrides.pages || [])[pIdx];
      }

      if (!overridePage) return defaultPage;

      return {
        ...defaultPage,
        ...overridePage,
        sections: defaultPage.sections.map((defaultSec: any, sIdx: number) => {
          let overrideSec = overridePage.sections?.[sIdx];
          
          if (!overrideSec) return defaultSec;

          return {
            ...defaultSec,
            ...overrideSec,
            props: { ...defaultSec.props, ...(overrideSec.props || {}) }
          };
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

  if (modifiedSchema.pages && defaultSchema.pages) {
    overrides.pages = modifiedSchema.pages.map((page: any, pIdx: number) => {
      const defaultPage = defaultSchema.pages[pIdx];
      if (!defaultPage) return page; // new page entirely

      return {
        id: page.id,
        name: page.name,
        path: page.path,
        title: page.title,
        description: page.description,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        sections: page.sections.map((section: any, sIdx: number) => {
          const defaultSec = defaultPage.sections[sIdx];
          if (!defaultSec) return section;

          const propsOverride: any = {};
          if (section.props) {
            Object.keys(section.props).forEach(key => {
              // Only save if it actually differs from default
              if (section.props[key] !== defaultSec.props[key]) {
                propsOverride[key] = section.props[key];
              }
            });
          }

          return {
            id: section.id,
            type: section.type,
            props: propsOverride
          };
        })
      };
    });
  }

  return overrides;
}

/**
 * Convenience function to resolve a site's full schema directly from its DB schema object
 */
export function resolveSiteData(siteSchema: any, siteName: string = 'My Site') {
  const templateSlug = siteSchema?.global?.templateSlug || 'velocity';
  const templateConfig = TEMPLATE_REGISTRY[templateSlug] || TEMPLATE_REGISTRY['default'];
  const defaultSchema = templateConfig.defaultSchema(siteName);
  
  return mergeSchema(defaultSchema, siteSchema);
}
