import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(), // Optional because we can generate it
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

export const listProducts = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const products = await prisma.product.findMany({
      where: { siteId },
      include: {
        category: true,
        brand: true,
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('[listProducts Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid product data', details: parsed.error.issues });
    }
    
    // Auto-generate slug if missing
    let slug = parsed.data.slug;
    if (!slug) {
      slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      // Ensure uniqueness
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
        taxRate: parsed.data.taxRate,
        stock: parsed.data.stock,
        lowStockThreshold: parsed.data.lowStockThreshold,
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
        category: true,
        brand: true,
        variants: true
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('[createProduct Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const siteId = req.params.siteId as string;
    
    const parsed = productSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid product data', details: parsed.error.issues });
    }

    const product = await prisma.product.update({
      where: { id: productId, siteId }, // siteId in where ensures authorization logic matches
      data: parsed.data,
      include: {
        category: true,
        brand: true,
        variants: true
      }
    });

    res.json(product);
  } catch (error) {
    console.error('[updateProduct Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const siteId = req.params.siteId as string;

    await prisma.product.delete({
      where: { id: productId, siteId }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[deleteProduct Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
