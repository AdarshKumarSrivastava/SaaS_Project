import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const { authenticator } = require('otplib');
import qrcode from 'qrcode';
import { prisma } from '../lib/prisma';

// In-memory store for OTPs (for MVP)
const otpStore = new Map<string, string>();
const pendingSignups = new Map<string, any>();

const JWT_SECRET = process.env.JWT_PLATFORM_SECRET || 'fallback_secret';

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, otp);
    pendingSignups.set(email, { name, email, passwordHash });
    
    // Mock email send
    console.log(`[MOCK EMAIL] OTP for ${email} is: ${otp}`);

    res.status(201).json({ message: 'OTP sent. Please verify to complete registration.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const storedOtp = otpStore.get(email);
    
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const pending = pendingSignups.get(email);
    if (pending) {
      await prisma.user.create({
        data: {
          name: pending.name,
          email: pending.email,
          passwordHash: pending.passwordHash,
          emailVerified: true
        }
      });
      pendingSignups.delete(email);
    } else {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: true }
      });
    }

    otpStore.delete(email);
    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    if (user.mfaSecret) {
      // Issue a temporary token for MFA verification
      const mfaToken = jwt.sign({ userId: user.id, mfaPending: true }, JWT_SECRET, { expiresIn: '5m' });
      return res.json({ mfaRequired: true, mfaToken });
    }

    const tokens = generateTokens(user.id);
    res.json({ ...tokens, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const enableMfa = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId; // Set by authenticate middleware
    const secret = authenticator.generateSecret();
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otpauthUrl = authenticator.keyuri(user.email, 'BuildSpace', secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    // Save temporarily or directly? We'll just save it directly for MVP
    await prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret }
    });

    res.json({ qrCodeUrl: qrCodeDataUrl, secret });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyMfa = async (req: Request, res: Response) => {
  try {
    const { mfaToken, token } = req.body;
    if (!mfaToken || !token) return res.status(400).json({ error: 'MFA token and code required' });

    let decoded: any;
    try {
      decoded = jwt.verify(mfaToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired MFA token' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.mfaSecret) return res.status(400).json({ error: 'MFA not enabled for user' });

    const isValid = authenticator.verify({ token, secret: user.mfaSecret });
    if (!isValid) return res.status(400).json({ error: 'Invalid MFA code' });

    const tokens = generateTokens(user.id);
    res.json({ ...tokens, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refresh = (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const decoded: any = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== 'refresh') throw new Error('Invalid token type');

    const tokens = generateTokens(decoded.userId);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};

// Mocks for OAuth
export const oauthGoogle = async (req: Request, res: Response) => { res.status(501).json({ message: 'Not implemented' }); };
export const oauthGithub = async (req: Request, res: Response) => { res.status(501).json({ message: 'Not implemented' }); };
