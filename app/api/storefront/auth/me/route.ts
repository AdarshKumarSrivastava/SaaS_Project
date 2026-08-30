import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_PLATFORM_SECRET || 'fallback_secret';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('storefront_session')?.value;
    const siteId = req.nextUrl.searchParams.get('siteId');

    if (!token || !siteId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (!decoded.customerId || decoded.siteId !== siteId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      }
    });

    if (!customer) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      customer
    });
  } catch (error) {
    console.error('[Storefront Auth Me Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
