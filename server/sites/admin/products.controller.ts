import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().min(0),
  comparePrice: z.number().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  taxRate: z.number().optional(),
  stock: z.number().int().optional(),
  lowStockThreshold: z.number().int().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
});

export const getProducts = async (req: Request, res: Response) => {
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
    res.status(200).json({ products });
  } catch (error: any) {
    console.error('[getProducts Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const productId = req.params.productId as string;
    const product = await prisma.product.findFirst({
      where: { id: productId, siteId },
      include: {
        category: true,
        brand: true,
        variants: true
      }
    });
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json({ product });
  } catch (error: any) {
    console.error('[getProduct Error]', error);
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
    
    const product = await prisma.product.create({
      data: {
        siteId,
        ...parsed.data,
      }
    });
    
    res.status(201).json({ product });
  } catch (error: any) {
    console.error('[createProduct Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const productId = req.params.productId as string;
    const parsed = productSchema.partial().safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid product data', details: parsed.error.issues });
    }
    
    // Ensure product belongs to site
    const existing = await prisma.product.findFirst({ where: { id: productId, siteId } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    
    const product = await prisma.product.update({
      where: { id: productId },
      data: parsed.data
    });
    
    res.status(200).json({ product });
  } catch (error: any) {
    console.error('[updateProduct Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const productId = req.params.productId as string;
    
    const existing = await prisma.product.findFirst({ where: { id: productId, siteId } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    
    await prisma.product.delete({ where: { id: productId } });
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('[deleteProduct Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
