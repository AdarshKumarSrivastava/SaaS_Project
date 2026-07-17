import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { encrypt, maskKey, decrypt } from '../lib/encryption';

// POST /api/sites/:siteId/credentials
export const saveCredentials = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const { keys } = req.body; // Array of { keyName, keyValue }

    if (!Array.isArray(keys)) {
      return res.status(400).json({ error: 'Keys array is required' });
    }

    const existingCreds = await prisma.siteCredential.findMany({ where: { siteId } });

    const operations = keys.map(k => {
      const existing = existingCreds.find(ec => ec.keyType === k.keyName);
      const encryptedValue = encrypt(k.keyValue);
      const maskedPreview = maskKey(k.keyValue);
      
      if (existing) {
        return prisma.siteCredential.update({
          where: { id: existing.id },
          data: { encryptedValue, maskedPreview }
        });
      } else {
        return prisma.siteCredential.create({
          data: {
            siteId,
            keyType: k.keyName,
            encryptedValue,
            maskedPreview
          }
        });
      }
    });

    await prisma.$transaction(operations);

    res.json({ message: 'Credentials securely saved' });
  } catch (error) {
    console.error('Save credentials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/sites/:siteId/credentials
export const listCredentials = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId as string;
    const credentials = await prisma.siteCredential.findMany({
      where: { siteId }
    });

    // We MUST NEVER send the raw encrypted string to the frontend, nor the decrypted one.
    // We send the stored masked preview.
    const maskedPreviews = credentials.map(c => {
      return {
        keyName: c.keyType,
        preview: c.maskedPreview
      };
    });

    res.json(maskedPreviews);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/sites/:siteId/credentials/test
export const testCredential = async (req: Request, res: Response) => {
  try {
    const { keyName, keyValue } = req.body;
    
    // In a full production environment, this would physically instantiate the external SDKs
    // e.g. new Stripe(keyValue) and call stripe.paymentIntents.list()
    // For MVP, we mock the network verification.
    
    // Fake 500ms delay to simulate network call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (keyValue.length < 10) {
      return res.status(400).json({ valid: false, message: 'Key length must be at least 10 characters' });
    }

    res.json({ valid: true, message: 'Verification passed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
