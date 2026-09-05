import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_PLATFORM_SECRET || 'fallback_secret';

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const { siteId } = await params;
    
    // Verify Platform Admin session
    const accessToken = req.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(accessToken, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has role for this site
    const role = await prisma.siteRole.findFirst({
      where: { siteId, userId: decoded.userId }
    });

    if (!role) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const customers = await prisma.customer.findMany({
      where: { siteId },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { orders: true, reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const mappedCustomers = customers.map(c => {
      const fullName = c.firstName || c.lastName 
        ? `${c.firstName || ''} ${c.lastName || ''}`.trim() 
        : c.email.split('@')[0];
      const totalSpent = c.orders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      return {
        id: c.id,
        siteId: c.siteId,
        email: c.email,
        name: fullName,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        lastLoginAt: c.lastLoginAt,
        createdAt: c.createdAt,
        orders: c.orders,
        ordersCount: c._count.orders,
        totalSpent,
        _count: c._count,
      };
    });

    return NextResponse.json({ customers: mappedCustomers });
  } catch (error) {
    console.error('[Admin Customers GET Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
