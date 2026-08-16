import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listProducts = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const products = await prisma.product.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const { name, price, image, category } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = await prisma.product.create({
      data: {
        siteId,
        name,
        price: parseFloat(price),
        image,
        category
      }
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const siteId = req.params.siteId as string;
    const { name, price, image, category } = req.body;

    const product = await prisma.product.update({
      where: { id: productId, siteId },
      data: {
        name,
        price: price !== undefined ? parseFloat(price) : undefined,
        image,
        category
      }
    });

    res.json(product);
  } catch (error) {
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
    res.status(500).json({ error: 'Internal server error' });
  }
};
