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

    // Apply asset resolution to global keys
    for (const key of Object.keys(merged.global)) {
      if (key === 'theme') continue;
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('image') || lowerKey.includes('logo') || lowerKey.includes('url') || lowerKey.includes('bg') || lowerKey.includes('icon') || lowerKey.includes('avatar')) {
        const val = merged.global[key];
        if (typeof val === 'string' && val.trim() !== '') {
          if (!val.startsWith('http') && !val.startsWith('data:') && !val.startsWith('/')) {
            merged.global[key] = defaultSchema.global[key];
          }
        } else if (!val) {
          merged.global[key] = defaultSchema.global[key];
        }
      }
    }
  }

  if (overrides.pages && Array.isArray(overrides.pages) && overrides.pages.length > 0) {
    merged.pages = overrides.pages.map((overridePage: any) => {
      const defaultPage = defaultSchema.pages?.find((p: any) => p.path === overridePage.path);
      
      if (!defaultPage) return overridePage;

      const mergedSections = (overridePage.sections || []).map((overrideSection: any) => {
          // Find matching default section by type
          // We match by relative order of that type in the page
          const defaultSectionsOfType = defaultPage.sections.filter((s: any) => s.type === overrideSection.type);
          const overrideSectionsOfType = overridePage.sections.filter((s: any) => s.type === overrideSection.type);
          
          const typeIndex = overrideSectionsOfType.indexOf(overrideSection);
          const defaultSection = defaultSectionsOfType[typeIndex];

          if (defaultSection) {
            const mergedProps = {
              ...defaultSection.props,
              ...(overrideSection.props || {})
            };

            // Global Asset Resolver Pipeline
            // If a project override provides a generic label like "Editorial" or a broken path,
            // we fall back to the safe default template asset to guarantee a valid URL.
            for (const key of Object.keys(mergedProps)) {
              const lowerKey = key.toLowerCase();
              if (lowerKey.includes('image') || lowerKey.includes('logo') || lowerKey.includes('url') || lowerKey.includes('bg') || lowerKey.includes('icon') || lowerKey.includes('avatar')) {
                const val = mergedProps[key];
                if (typeof val === 'string' && val.trim() !== '') {
                  // A valid URL must start with http, https, data:, or a root path /
                  if (!val.startsWith('http') && !val.startsWith('data:') && !val.startsWith('/')) {
                    // Invalid/unresolved asset reference (e.g. "Editorial", "Hero Image")
                    mergedProps[key] = defaultSection.props[key];
                  }
                } else if (!val) {
                  // Empty or undefined
                  mergedProps[key] = defaultSection.props[key];
                }
              }
            }

            return {
              ...overrideSection,
              props: mergedProps
            };
          }
          return overrideSection;
        })
        
      // Resilient Restore Pipeline
      // If a default section is missing from the overrides (e.g., due to template updates or past data corruption),
      // and it was NOT explicitly marked as isHidden by the user (which keeps it in the array), we restore it.
      if (defaultPage.sections) {
        defaultPage.sections.forEach((defaultSection: any) => {
          const defaultSectionsOfType = defaultPage.sections.filter((s: any) => s.type === defaultSection.type);
          const typeIndex = defaultSectionsOfType.indexOf(defaultSection);
          
          const mergedSectionsOfType = mergedSections.filter((s: any) => s.type === defaultSection.type);
          
          if (typeIndex >= mergedSectionsOfType.length) {
            // Missing from overrides, restore it!
            mergedSections.push({ ...defaultSection });
          }
        });
      }

      return {
        ...overridePage,
        sections: mergedSections
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
export function resolveSiteData(siteSchema: any, siteName: string = 'My Site', category?: string) {
  const rawSlug = siteSchema?.global?.templateSlug;
  const hint = siteSchema || { name: siteName, category };
  const templateSlug = normalizeTemplateKey(rawSlug, hint);
  const templateConfig = getTemplateConfig(templateSlug, hint);
  const defaultSchema = templateConfig.defaultSchema(siteName);
  
  return mergeSchema(defaultSchema, siteSchema);
}
