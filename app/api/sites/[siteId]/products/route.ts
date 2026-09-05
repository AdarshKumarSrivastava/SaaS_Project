import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_PLATFORM_SECRET || 'fallback_secret';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1).optional(),
  price: z.number().min(0),
  comparePrice: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  taxRate: z.number().optional(),
  stock: z.number().int().optional(),
  lowStockThreshold: z.number().int().optional(),
  weight: z.number().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
});

async function verifySiteAccess(req: NextRequest, siteId: string, allowedRoles = ['owner', 'editor', 'viewer']) {
  // Check authorization header or cookie
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const cookieToken = req.cookies.get('accessToken')?.value;
  const token = bearerToken || cookieToken;

  if (!token) {
    return { error: 'Unauthorized: No token provided', status: 401 };
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return { error: 'Unauthorized: Invalid token', status: 401 };
  }

  if (!decoded?.userId) {
    return { error: 'Unauthorized: No user identifier in token', status: 401 };
  }

  // Check role
  const role = await prisma.siteRole.findFirst({
    where: { siteId, userId: decoded.userId }
  });

  if (!role || !allowedRoles.includes(role.role)) {
    return { error: 'Forbidden: Insufficient permissions for this site', status: 403 };
  }

  return { user: decoded, role };
}

// GET: List all products for a site (high-performance project-scoped query)
export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const { siteId } = await params;
    const auth = await verifySiteAccess(req, siteId, ['owner', 'editor', 'viewer']);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const products = await prisma.product.findMany({
      where: { siteId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        variants: { select: { id: true, name: true, sku: true, price: true, stock: true, attributes: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[Products GET Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new product for a site
export async function POST(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const { siteId } = await params;
    const auth = await verifySiteAccess(req, siteId, ['owner', 'editor']);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid product data', details: parsed.error.issues }, { status: 400 });
    }

    // Auto-generate slug if missing
    let slug = parsed.data.slug;
    if (!slug) {
      slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const existing = await prisma.product.findFirst({ where: { siteId, slug } });
      if (existing) slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        siteId,
        name: parsed.data.name,
        slug,
        price: parsed.data.price,
        comparePrice: parsed.data.comparePrice,
        description: parsed.data.description,
        shortDescription: parsed.data.shortDescription,
        sku: parsed.data.sku,
        barcode: parsed.data.barcode,
        taxRate: parsed.data.taxRate || 0,
        stock: parsed.data.stock || 0,
        lowStockThreshold: parsed.data.lowStockThreshold || 5,
        weight: parsed.data.weight,
        dimensions: parsed.data.dimensions,
        seoTitle: parsed.data.seoTitle,
        seoDescription: parsed.data.seoDescription,
        status: parsed.data.status || 'DRAFT',
        images: parsed.data.images || [],
        categoryId: parsed.data.categoryId,
        brandId: parsed.data.brandId,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        variants: { select: { id: true, name: true, sku: true, price: true, stock: true, attributes: true } }
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[Products POST Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
