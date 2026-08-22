import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listCustomers = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const customers = await prisma.customer.findMany({
      where: { siteId },
      include: {
        _count: {
          select: { orders: true, reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    console.error('[listCustomers Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const customerId = req.params.customerId as string;
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, siteId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        reviews: true
      }
    });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    console.error('[getCustomer Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
