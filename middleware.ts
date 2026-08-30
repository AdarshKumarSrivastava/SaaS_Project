import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Determine the root domain
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'buildspace.app';

  // Extract subdomain if any
  let subdomain = '';
  if (hostname.includes('.localhost')) {
    subdomain = hostname.split('.localhost')[0];
  } else if (hostname.endsWith(`.${rootDomain}`)) {
    subdomain = hostname.replace(`.${rootDomain}`, '');
  }

  // Prevent routing to reserved subdomains
  if (['www', 'admin', 'app', 'api'].includes(subdomain)) {
     return NextResponse.next();
  }

  if (subdomain) {
    // Rewrite to our dynamic route for subdomains
    return NextResponse.rewrite(new URL(`/public-site/${subdomain}${url.pathname}`, req.url));
  }

  return NextResponse.next();
}
