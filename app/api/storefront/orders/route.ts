import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_PLATFORM_SECRET || 'fallback_secret';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('storefront_session')?.value;
    const siteId = req.nextUrl.searchParams.get('siteId');

    if (!token || !siteId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    if (!decoded.customerId || decoded.siteId !== siteId) {
      return NextResponse.json({ error: 'Unauthorized for this store' }, { status: 403 });
    }

    // Strictly query orders for this customer and this site
    const orders = await prisma.order.findMany({
      where: {
        siteId,
        customerId: decoded.customerId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              }
            }
          }
        },
        timeline: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('[Storefront Orders GET Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
