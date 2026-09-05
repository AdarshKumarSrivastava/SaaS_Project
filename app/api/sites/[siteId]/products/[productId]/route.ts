import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_PLATFORM_SECRET || 'fallback_secret';

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
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

  const role = await prisma.siteRole.findFirst({
    where: { siteId, userId: decoded.userId }
  });

  if (!role || !allowedRoles.includes(role.role)) {
    return { error: 'Forbidden: Insufficient permissions for this site', status: 403 };
  }

  return { user: decoded, role };
}

// GET: Single product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; productId: string }> }
) {
  try {
    const { siteId, productId } = await params;
    const auth = await verifySiteAccess(req, siteId, ['owner', 'editor', 'viewer']);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, siteId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        variants: { select: { id: true, name: true, sku: true, price: true, stock: true, attributes: true } }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[Product GET Single Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update product
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; productId: string }> }
) {
  try {
    const { siteId, productId } = await params;
    const auth = await verifySiteAccess(req, siteId, ['owner', 'editor']);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const existing = await prisma.product.findFirst({
      where: { id: productId, siteId }
    });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid product data', details: parsed.error.issues }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: parsed.data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        variants: { select: { id: true, name: true, sku: true, price: true, stock: true, attributes: true } }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[Product PATCH Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; productId: string }> }
) {
  try {
    const { siteId, productId } = await params;
    const auth = await verifySiteAccess(req, siteId, ['owner', 'editor']);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const existing = await prisma.product.findFirst({
      where: { id: productId, siteId }
    });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Product DELETE Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
