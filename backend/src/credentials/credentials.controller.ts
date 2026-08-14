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
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!keyValue) {
      return res.status(400).json({ valid: false, message: 'Key value is required' });
    }

    if (keyName === 'payment_publishable_key' && !keyValue.startsWith('pk_')) {
      return res.status(400).json({ valid: false, message: 'Publishable keys typically start with pk_' });
    }
    if (keyName === 'payment_secret_key' && !keyValue.startsWith('sk_')) {
      return res.status(400).json({ valid: false, message: 'Secret keys typically start with sk_' });
    }
    if (keyName.includes('jwt') && keyValue.length < 32) {
      return res.status(400).json({ valid: false, message: 'JWT Secret must be at least 32 characters' });
    }
    if (keyName === 'imagekit_public' && !keyValue.startsWith('public_')) {
      return res.status(400).json({ valid: false, message: 'ImageKit public key should start with public_' });
    }
    if (keyName === 'imagekit_private' && !keyValue.startsWith('private_')) {
      return res.status(400).json({ valid: false, message: 'ImageKit private key should start with private_' });
    }
    if (keyName === 'imagekit_url_endpoint' && !keyValue.startsWith('http')) {
      return res.status(400).json({ valid: false, message: 'ImageKit endpoint must be a valid URL' });
    }
    if (keyValue.length < 5) {
      return res.status(400).json({ valid: false, message: 'Key length must be at least 5 characters' });
    }

    res.json({ valid: true, message: 'Verification passed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

import bcrypt from 'bcrypt';

const byokOtpStore = new Map<string, { otp: string, expiresAt: number }>();

export const getPinStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.json({ hasPin: !!user?.byokPinHash });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setupPin = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { pin } = req.body;
    
    if (!pin || pin.length < 4 || pin.length > 8) {
      return res.status(400).json({ error: 'PIN must be 4-8 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pin, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { byokPinHash: hash }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyPin = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { pin } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.byokPinHash) {
      return res.status(400).json({ error: 'PIN not set up' });
    }

    const isValid = await bcrypt.compare(pin, user.byokPinHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect PIN' });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPin = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    byokOtpStore.set(user.email, { otp, expiresAt });
    console.log(`[MOCK EMAIL] BYOK Reset OTP for ${user.email} is: ${otp}`);
    
    res.json({ message: 'OTP sent to registered email' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPin = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { otp, newPin } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const storeData = byokOtpStore.get(user.email);
    if (!storeData) {
      return res.status(400).json({ error: 'No OTP requested or expired' });
    }

    if (Date.now() > storeData.expiresAt) {
      byokOtpStore.delete(user.email);
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (storeData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (!newPin || newPin.length < 4 || newPin.length > 8) {
      return res.status(400).json({ error: 'New PIN must be 4-8 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPin, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { byokPinHash: hash }
    });

    byokOtpStore.delete(user.email);
    res.json({ success: true, message: 'PIN reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
