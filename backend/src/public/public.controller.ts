import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// GET /api/public/sites/:siteId
export const getPublicSite = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    
    // We strictly use select to ensure we do not leak the ownerId or internal metrics
    const site = await prisma.site.findUnique({ 
      where: { id: siteId },
      select: {
        id: true,
        name: true,
        subdomain: true,
        customDomain: true,
        schema: true,
      }
    });

    if (!site) return res.status(404).json({ error: 'Site not found' });
    
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/public/domains/lookup?host=xxx
export const lookupDomain = async (req: Request, res: Response) => {
  try {
    const host = req.query.host as string;
    if (!host) return res.status(400).json({ error: 'Host is required' });

    // 1. Try to find by exact custom domain match
    let site = await prisma.site.findUnique({
      where: { customDomain: host },
      select: { id: true }
    });

    // 2. If not found, check if it's a subdomain (e.g. janesbakery.localhost:3000)
    if (!site) {
      const parts = host.split('.');
      if (parts.length > 1) {
        const subdomain = parts[0];
        site = await prisma.site.findUnique({
          where: { subdomain },
          select: { id: true }
        });
      }
    }

    if (!site) return res.status(404).json({ error: 'Domain mapping not found' });

    res.json(site);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
