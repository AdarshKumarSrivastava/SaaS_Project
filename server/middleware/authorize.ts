import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const authorize = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user || !user.userId) {
        return res.status(401).json({ error: 'Unauthorized: No user session found.' });
      }

      const siteId = req.params.siteId as string;
      if (!siteId) {
        return res.status(400).json({ error: 'Bad Request: siteId is missing from parameters.' });
      }

      const siteRole = await prisma.siteRole.findFirst({
        where: {
          siteId: siteId,
          userId: user.userId,
        }
      });

      if (!siteRole) {
        return res.status(403).json({ error: 'Forbidden: You do not have access to this site.' });
      }

      if (!allowedRoles.includes(siteRole.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions for this action.' });
      }

      // Attach the role context for downstream controllers
      (req as any).siteRole = siteRole;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Internal server error during authorization.' });
    }
  };
};
