import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { decrypt } from '../lib/encryption';
import { TEMPLATE_REGISTRY, normalizeTemplateKey, getTemplateConfig } from '../../lib/template-registry';
import { extractOverrides } from '../../lib/schema';

// GET /api/sites
export const listSites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const siteRoles = await prisma.siteRole.findMany({
      where: { userId },
      include: { 
        site: {
          include: {
            deployments: {
              where: { status: 'LIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        } 
      },
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

    // Canonical template slug resolution
    const templateSlug = normalizeTemplateKey(category, name);
    const templateConfig = getTemplateConfig(templateSlug, name);
    
    // Seed initial schema
    const initialSchema = { global: { templateSlug } };

    const site = await prisma.site.create({
      data: {
        ownerId: userId,
        name,
        category,
        subdomain,
        schema: initialSchema,
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
    console.error('Error creating site:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/sites/:siteId
export const getSite = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const site = await prisma.site.findUnique({ 
      where: { id: siteId },
      include: {
        publishedDeployment: true
      }
    });
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
    const { schema } = req.body; // Remove products from body parsing to prevent unintentional deletion

    const updateData: any = {};
    if (schema !== undefined) {
      // Always store only the overrides relative to the canonical template
      const site = await prisma.site.findUnique({ where: { id: siteId } });
      const currentName = site?.name || 'My Site';
      const templateSlug = normalizeTemplateKey(schema?.global?.templateSlug, schema || site);
      const templateConfig = getTemplateConfig(templateSlug, site || currentName);
      const defaultSchema = templateConfig.defaultSchema(currentName);
      
      updateData.schema = extractOverrides(defaultSchema, schema);
    }

    const site = await prisma.site.update({
      where: { id: siteId },
      data: updateData
    });

    res.json(site);
  } catch (error) {
    console.error('Error updating schema:', error);
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
    const userId = (req as any).user.userId;
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

// POST /api/sites/:siteId/admin/login
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const cred = await prisma.siteCredential.findFirst({
      where: { siteId, keyType: 'admin_password' }
    });

    let isValid = false;
    if (cred) {
      const decrypted = decrypt(cred.encryptedValue);
      isValid = decrypted === password;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { siteId, role: 'admin' },
      process.env.JWT_PLATFORM_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
