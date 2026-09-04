import { TEMPLATE_REGISTRY, normalizeTemplateKey } from './template-registry';

/**
 * Merges template default products with custom site products.
 * This ensures that a site always retains its original template catalog
 * alongside any new custom products created by the admin.
 */
export const getStorefrontProducts = (templateSlug: string, customProducts: any[]) => {
  const normalizedSlug = normalizeTemplateKey(templateSlug);
  const template = TEMPLATE_REGISTRY[normalizedSlug] || TEMPLATE_REGISTRY['default'];
  const templateProducts = template ? template.defaultProducts || [] : [];
  
  // Create a merged list. Custom products append to the end of template products.
  // We use stable IDs (string IDs vs UUIDs usually) to prevent duplicates, 
  // but since we treat template products as static and custom products as dynamic,
  // we can simply concatenate them.
  
  // Normalize custom products so they match the flat structure expected by templates
  const normalizedCustomProducts = customProducts.map(p => ({
     ...p,
     // If category is an object (Prisma include), flatten to its name
     category: p.category && typeof p.category === 'object' ? p.category.name : p.category || p.categoryId || 'Uncategorized',
     // Ensure we have a primary image string
     image: p.image || (p.images && p.images.length > 0 ? p.images[0] : null)
  }));
  
  // Deduplicate by ID just in case there are accidental collisions
  const allProducts = [...templateProducts, ...normalizedCustomProducts];
  const uniqueProductsMap = new Map();
  
  allProducts.forEach(product => {
     if (!uniqueProductsMap.has(product.id)) {
        uniqueProductsMap.set(product.id, product);
     }
  });

  return Array.from(uniqueProductsMap.values());
};
