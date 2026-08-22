import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  message: z.string().optional(),
});

export const listOrders = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const orders = await prisma.order.findMany({
      where: { siteId },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('[listOrders Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const orderId = req.params.orderId as string;
    const order = await prisma.order.findFirst({
      where: { id: orderId, siteId },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        },
        timeline: {
          orderBy: { createdAt: 'desc' }
        },
        invoices: true,
        returnRequests: true,
      }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error('[getOrder Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const orderId = req.params.orderId as string;
    
    const parsed = updateOrderStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid status data', details: parsed.error.issues });
    }

    const order = await prisma.order.findFirst({ where: { id: orderId, siteId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Transaction to update order and create timeline event
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: parsed.data.status }
      });

      await tx.orderTimeline.create({
        data: {
          orderId,
          status: parsed.data.status,
          message: parsed.data.message || `Order status updated to ${parsed.data.status}`
        }
      });

      return updated;
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('[updateOrderStatus Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTracking = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const orderId = req.params.orderId as string;
    const { trackingNumber, trackingUrl } = req.body;

    const existingOrder = await prisma.order.findFirst({ where: { id: orderId, siteId } });
    if (!existingOrder) return res.status(404).json({ error: 'Order not found' });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { trackingNumber, trackingUrl }
    });

    // Optionally add to timeline
    await prisma.orderTimeline.create({
      data: {
        orderId,
        status: order.status,
        message: `Tracking info updated: ${trackingNumber}`
      }
    });

    res.json(order);
  } catch (error) {
    console.error('[updateTracking Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
