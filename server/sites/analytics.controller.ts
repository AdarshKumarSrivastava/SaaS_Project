import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;

    // Aggregate basic metrics
    const [
      totalOrders,
      totalRevenueAggr,
      totalCustomers,
      totalProducts
    ] = await Promise.all([
      prisma.order.count({ where: { siteId } }),
      prisma.order.aggregate({
        where: { siteId, status: { not: 'CANCELLED' } },
        _sum: { total: true }
      }),
      prisma.customer.count({ where: { siteId } }),
      prisma.product.count({ where: { siteId } })
    ]);

    // Simple revenue over time (last 30 days mock data for now since raw SQL grouping by day is complex across dialects)
    const revenueOverTime = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 1000) // Mocking history for now, implement real grouping later
      };
    });

    res.json({
      metrics: {
        revenue: totalRevenueAggr._sum.total || 0,
        orders: totalOrders,
        customers: totalCustomers,
        products: totalProducts
      },
      revenueOverTime
    });

  } catch (error) {
    console.error('[getAnalytics Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
