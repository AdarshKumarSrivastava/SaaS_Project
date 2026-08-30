import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Get hostname (e.g., 'my-velocity.localhost:3000' or 'localhost:3000')
  const hostname = request.headers.get('host') || '';

  // If we are on standard localhost without a subdomain, just continue
  const isBaseDomain = hostname === 'localhost:3000' || hostname === '127.0.0.1:3000' || hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN || hostname === 'buildspace.app';

  // Exclude static files, API routes, and core Next.js routes
  if (
      url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/signup') ||
      url.pathname.startsWith('/images') || 
      (url.pathname === '/' && isBaseDomain) || // Allow main marketing page ONLY on base domain
      url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (isBaseDomain) {
    
    // NEW: Handle /sites/[siteId]/live route explicitly
    const liveMatch = url.pathname.match(/^\/sites\/([^/]+)\/live(\/.*)?$/);
    if (liveMatch) {
      const siteId = liveMatch[1];
      const trailingPath = liveMatch[2] || '';
      
      try {
        const apiUrl = new URL(`/api/sites/${siteId}/live`, request.url);
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          
          if (data.site?.subdomain && data.deployment) {
            // REDIRECT to the actual project subdomain so that Next.js <Link> components work natively
            const isProd = request.headers.get('host')?.includes('buildspace.app');
            const targetUrl = isProd 
              ? `https://${data.site.subdomain}.buildspace.app` 
              : `http://${data.site.subdomain}.localhost:3000`;
              
            return NextResponse.redirect(targetUrl);
          }
        }
      } catch (err) {
        console.error('Proxy live fetch error for siteId:', err);
      }
      
      url.pathname = `/s/not-live`;
      url.searchParams.set('siteId', siteId);
      return NextResponse.rewrite(url);
    }
    
    return NextResponse.next();
  }

  // Detect subdomain
  let subdomain = null;
  
  // Handle localhost testing (e.g. project1.localhost:3000)
  if (hostname.includes('.localhost')) {
    subdomain = hostname.split('.localhost')[0];
  } 
  // Handle production (e.g. project1.buildspace.app)
  else if (hostname.includes('.buildspace.app')) {
    subdomain = hostname.split('.buildspace.app')[0];
  }

  // If there is a valid project subdomain (and it's not 'www' or 'app' or 'admin')
  if (subdomain && !['www', 'app', 'admin', 'api'].includes(subdomain)) {
    // Rewrite to our new public-site catch-all route
    return NextResponse.rewrite(new URL(`/public-site/${subdomain}${url.pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
