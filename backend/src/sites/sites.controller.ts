import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

// GET /api/sites
export const listSites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const siteRoles = await prisma.siteRole.findMany({
      where: { userId },
      include: { site: true },
      orderBy: { site: { createdAt: 'desc' } }
    });
    const sites = siteRoles.map((sr: any) => ({ ...sr.site, myRole: sr.role }));
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/sites
export const createSite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, category } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const subdomain = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;

    const site = await prisma.site.create({
      data: {
        ownerId: userId,
        name,
        category,
        subdomain,
        roles: {
          create: {
            userId: userId,
            role: 'owner'
          }
        }
      }
    });

    res.status(201).json(site);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/sites/:siteId
export const getSite = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) return res.status(404).json({ error: 'Site not found' });
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/sites/:siteId
export const updateSite = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const { name, customDomain } = req.body;
    const site = await prisma.site.update({
      where: { id: siteId },
      data: { name, customDomain }
    });
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/sites/:siteId
export const deleteSite = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    
    await prisma.siteRole.deleteMany({ where: { siteId } });
    await prisma.siteCredential.deleteMany({ where: { siteId } });
    await prisma.site.delete({ where: { id: siteId } });
    
    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/sites/:siteId/roles
export const inviteRole = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented for MVP' });
};

// PATCH /api/sites/:siteId/schema
export const updateSchema = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const { schema } = req.body;
    const site = await prisma.site.update({
      where: { id: siteId },
      data: { schema }
    });
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/sites/:siteId/domain
export const updateDomain = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const { customDomain } = req.body;

    if (!customDomain) {
      return res.status(400).json({ error: 'Custom domain is required' });
    }

    // Check if domain is already claimed by someone else
    const existing = await prisma.site.findUnique({
      where: { customDomain }
    });

    if (existing && existing.id !== siteId) {
      return res.status(409).json({ error: 'Domain is already in use by another site' });
    }

    const site = await prisma.site.update({
      where: { id: siteId },
      data: { customDomain }
    });

    res.json(site);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/sites/search?q=xyz
export const searchSites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const query = req.query.q as string;
    
    if (!query || query.trim() === '') return res.json([]);

    const sites = await prisma.site.findMany({
      where: {
        AND: [
          {
            roles: {
              some: { userId }
            }
          },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { subdomain: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      take: 5 // Limit to top 5 results for speed
    });

    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Test endpoint for verifying authorize middleware (from Phase 3)
export const testAuth = async (req: Request, res: Response) => {
  const siteRole = (req as any).siteRole;
  res.json({ 
    message: 'Authorization successful', 
    siteId: req.params.siteId as string,
    role: siteRole.role 
  });
};
