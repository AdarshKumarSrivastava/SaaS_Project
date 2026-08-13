import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g., demo.localhost:3000, janesbakery.com)
  const hostname = req.headers.get('host') || '';

  // Exclude internal Next.js routes, API routes, and our application routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/sites') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/signup') ||
    url.pathname.startsWith('/preview') || // allow direct access to preview
    url.pathname === '/' || // Allow main marketing page
    url.pathname.includes('.') // Exclude static files (favicon.ico, etc)
  ) {
    return NextResponse.next();
  }

  // If we are on standard localhost without a subdomain, just continue
  if (hostname === 'localhost:3000' || hostname === '127.0.0.1:3000') {
    return NextResponse.next();
  }

  try {
    // Ping our backend public lookup API
    // Edge middleware cannot use Prisma, so we rely on this highly-optimized micro-endpoint
    const res = await fetch(`http://localhost:3001/api/public/domains/lookup?host=${hostname}`);
    
    if (res.ok) {
      const data = await res.json();
      if (data.id) {
        // We found a site ID! Secretly rewrite the request to the preview engine
        // The user's URL bar will STILL show their custom domain/subdomain!
        return NextResponse.rewrite(new URL(`/preview/${data.id}`, req.url));
      }
    }
  } catch (error) {
    console.error('Middleware lookup failed:', error);
  }

  // If no match found or error, just continue (will likely 404 naturally)
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
