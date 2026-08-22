import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Get hostname (e.g., 'my-velocity.localhost:3000' or 'localhost:3000')
  const hostname = request.headers.get('host') || '';

  // Exclude static files, API routes, and core Next.js routes
  if (
      url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/signup') ||
      url.pathname.startsWith('/images') || 
      url.pathname === '/' || // Allow main marketing page
      url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If we are on standard localhost without a subdomain, just continue
  if (hostname === 'localhost:3000' || hostname === '127.0.0.1:3000') {
    
    // NEW: Handle /sites/[siteId]/live route explicitly
    const liveMatch = url.pathname.match(/^\/sites\/([^/]+)\/live(\/.*)?$/);
    if (liveMatch) {
      const siteId = liveMatch[1];
      const trailingPath = liveMatch[2] || '';
      
      try {
        const res = await fetch(`/api/sites/${siteId}/live`);
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
  if (subdomain && !['www', 'app', 'admin'].includes(subdomain)) {
    try {
      // Fetch live configuration for this subdomain
      const res = await fetch(`/api/sites/live/${subdomain}`);
      if (res.ok) {
        const data = await res.json();
        const templateSlug = data.deployment?.schema?.global?.templateSlug;
        
        if (templateSlug) {
          // Rewrite to the actual template route (e.g., /templates/velocity/...)
          url.pathname = `/templates/${templateSlug}${url.pathname}`;
          
          const response = NextResponse.rewrite(url);
          // Pass the live data through a header so the layout can inject it
          // We use btoa to base64 encode it for safe header transport in Edge runtime
          const base64Data = btoa(JSON.stringify(data));
          response.headers.set('x-live-data', base64Data);
          return response;
        }
      }
    } catch (err) {
      console.error('Proxy live fetch error:', err);
    }
    
    // If not found or not live, rewrite to a generic not-live page
    url.pathname = `/s/not-live`;
    return NextResponse.rewrite(url);
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
