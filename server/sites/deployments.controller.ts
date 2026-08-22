import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// POST /api/sites/:siteId/deploy
export const triggerDeployment = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    
    // 1. Fetch site and its schema
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    if (!site.schema) {
       return res.status(400).json({ error: 'Cannot deploy empty site schema. Please build the site first.' });
    }

    // 2. We take a snapshot of the current configuration. 
    // We do NOT snapshot products here because products are managed by Admin Panel and should be live.
    // The schema alone dictates the template, layout, and static text.
    const snapshotSchema = site.schema;

    // 3. Create the deployment record
    const deployment = await prisma.deployment.create({
      data: {
        siteId,
        status: 'PUBLISHING', // Frontend will animate and then PATCH to LIVE
        schema: snapshotSchema || {},
      }
    });

    res.status(201).json(deployment);
  } catch (error) {
    console.error('Trigger deployment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/sites/:siteId/deployments/:deploymentId/status
export const updateDeploymentStatus = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const deploymentId = req.params.deploymentId as string;
    const { status, errorLogs } = req.body;

    if (!status || !['LIVE', 'FAILED'].includes(status)) {
       return res.status(400).json({ error: 'Invalid status' });
    }

    // 1. Check deployment belongs to site
    const deployment = await prisma.deployment.findFirst({
       where: { id: deploymentId, siteId }
    });

    if (!deployment) {
       return res.status(404).json({ error: 'Deployment not found' });
    }

    // 2. If transitioning to LIVE, we should archive previous LIVE deployments for cleanliness, 
    // though querying by `orderBy createdAt desc` also works. We'll archive them.
    if (status === 'LIVE') {
       await prisma.deployment.updateMany({
          where: { siteId, status: 'LIVE', id: { not: deploymentId } },
          data: { status: 'ARCHIVED' }
       });
       
       // Update site status to 'published'
       await prisma.site.update({
          where: { id: siteId },
          data: { status: 'published' }
       });
    }

    // 3. Update the target deployment
    const updated = await prisma.deployment.update({
       where: { id: deploymentId },
       data: { 
          status,
          errorLogs: errorLogs || null,
          completedAt: new Date()
       }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update deployment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/sites/live/:subdomain
export const getLiveSite = async (req: Request, res: Response) => {
  try {
    const subdomain = req.params.subdomain as string;
    
    // 1. Find site by subdomain
    const site = await prisma.site.findUnique({
       where: { subdomain }
    });

    if (!site) {
       return res.status(404).json({ error: 'Site not found' });
    }

    // 2. Fetch the latest LIVE deployment
    const deployment = await prisma.deployment.findFirst({
       where: { siteId: site.id, status: 'LIVE' },
       orderBy: { createdAt: 'desc' }
    });

    // 3. Fetch LIVE products directly from the database 
    // This satisfies the requirement: Admin updates to products reflect instantly on the live site
    const products = await prisma.product.findMany({
       where: { siteId: site.id, status: 'ACTIVE' },
       include: { variants: true }
    });

    res.json({
       site: {
          id: site.id,
          name: site.name,
          subdomain: site.subdomain,
          customDomain: site.customDomain
       },
       deployment,
       products
    });
  } catch (error) {
    console.error('Get live site error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/sites/:siteId/live
export const getLiveSiteById = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    
    // 1. Find site by ID
    const site = await prisma.site.findUnique({
       where: { id: siteId }
    });

    if (!site) {
       return res.status(404).json({ error: 'Site not found' });
    }

    // 2. Fetch the latest LIVE deployment
    const deployment = await prisma.deployment.findFirst({
       where: { siteId: site.id, status: 'LIVE' },
       orderBy: { createdAt: 'desc' }
    });

    // 3. Fetch LIVE products directly from the database 
    const products = await prisma.product.findMany({
       where: { siteId: site.id, status: 'ACTIVE' },
       include: { variants: true }
    });

    res.json({
       site: {
          id: site.id,
          name: site.name,
          subdomain: site.subdomain,
          customDomain: site.customDomain
       },
       deployment,
       products
    });
  } catch (error) {
    console.error('Get live site by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
