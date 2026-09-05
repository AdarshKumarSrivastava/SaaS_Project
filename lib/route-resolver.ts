/**
 * Centralized Live Route Resolver
 * Maps any public URL, template-prefixed URL, or route alias into a canonical page key
 * that matches the template registry component maps.
 */

export interface ResolvedLiveRoute {
  /** Canonical route matching keys in TEMPLATE_COMPONENTS (e.g. '/', '/products', '/products/[id]', '/about') */
  canonicalPath: string;
  /** Normalized public path for browser URL display (e.g. '/', '/products', '/about') */
  publicPath: string;
  /** Whether the route matches a dynamic product page */
  isDynamicProduct: boolean;
  /** Extracted product ID or slug */
  productId?: string;
  /** Route params passed to the page component */
  params: Record<string, string>;
}

const ALIAS_MAP: Record<string, string> = {
  '/shop': '/products',
  '/catalog': '/products',
  '/all-products': '/products',
  '/collection': '/products',
  '/items': '/products',
  '/account': '/profile',
  '/my-account': '/profile',
  '/me': '/profile',
  '/user': '/profile',
  '/login': '/auth/login',
  '/signin': '/auth/login',
  '/signup': '/auth/signup',
  '/register': '/auth/signup',
  '/bag': '/cart',
  '/basket': '/cart',
  '/cart/checkout': '/checkout',
  '/pay': '/checkout',
  '/saved': '/wishlist',
  '/favorites': '/wishlist',
};

export function resolveLiveRoute(rawPath: string | string[] | undefined): ResolvedLiveRoute {
  let pathStr = '/';

  if (Array.isArray(rawPath)) {
    pathStr = '/' + rawPath.filter(Boolean).join('/');
  } else if (typeof rawPath === 'string') {
    pathStr = rawPath.trim();
  }

  // Ensure leading slash
  if (!pathStr.startsWith('/')) {
    pathStr = '/' + pathStr;
  }

  // Strip template prefix if present (e.g., /templates/origin/products -> /products)
  pathStr = pathStr.replace(/^\/templates\/[a-zA-Z0-9_-]+/i, '') || '/';
  if (!pathStr.startsWith('/')) pathStr = '/' + pathStr;

  // Clean duplicate slashes
  pathStr = pathStr.replace(/\/+/g, '/');

  // Strip trailing slash unless root
  if (pathStr.length > 1 && pathStr.endsWith('/')) {
    pathStr = pathStr.slice(0, -1);
  }

  const lower = pathStr.toLowerCase();

  // 1. Check direct alias
  if (ALIAS_MAP[lower]) {
    const aliased = ALIAS_MAP[lower];
    return {
      canonicalPath: aliased,
      publicPath: aliased,
      isDynamicProduct: false,
      params: {}
    };
  }

  // 2. Check dynamic product detail route: /products/:id, /shop/:id, /items/:id
  const productDetailMatch = pathStr.match(/^\/(?:products|shop|items|catalog)\/([^/]+)$/i);
  if (productDetailMatch) {
    const idOrSlug = productDetailMatch[1];
    return {
      canonicalPath: '/products/[id]',
      publicPath: `/products/${idOrSlug}`,
      isDynamicProduct: true,
      productId: idOrSlug,
      params: { id: idOrSlug }
    };
  }

  // 3. Standard route
  return {
    canonicalPath: pathStr,
    publicPath: pathStr,
    isDynamicProduct: false,
    params: {}
  };
}
