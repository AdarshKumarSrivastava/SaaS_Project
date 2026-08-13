import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const { authenticator } = require('otplib');
import qrcode from 'qrcode';
import { prisma } from '../lib/prisma';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_PLATFORM_SECRET || 'fallback_secret';

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

// Zod schemas
const signupSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6)
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    
    await prisma.pendingSignup.upsert({
      where: { email },
      create: { email, name, passwordHash, otp, expiresAt },
      update: { name, passwordHash, otp, expiresAt, createdAt: new Date() }
    });
    
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
        port: parseInt(process.env.SMTP_PORT || "2525"),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: `"BuildSpace" <${process.env.SMTP_FROM || 'noreply@buildspace.com'}>`,
        to: email,
        subject: 'Your BuildSpace Verification Code',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to BuildSpace!</h2>
          <p>Your authentication code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #d946ef;">${otp}</h1>
          <p>Enter this code to complete your registration. This code will expire soon.</p>
        </div>`,
      });
      console.log(`[EMAIL SENT] OTP sent to ${email}`);
    } else {
      console.log(`[MOCK EMAIL] OTP for ${email} is: ${otp}`);
    }

    res.status(201).json({ message: 'OTP sent. Please verify to complete registration.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const { email, otp } = parsed.data;

    const pending = await prisma.pendingSignup.findUnique({ where: { email } });
    
    if (!pending || pending.otp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    if (pending.expiresAt < new Date()) {
      await prisma.pendingSignup.delete({ where: { email } });
      return res.status(400).json({ error: 'OTP has expired. Please sign up again.' });
    }

    await prisma.user.upsert({
      where: { email },
      create: { name: pending.name, email: pending.email, passwordHash: pending.passwordHash, emailVerified: true },
      update: { emailVerified: true }
    });

    await prisma.pendingSignup.delete({ where: { email } });
    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid credentials format' });
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    if (user.mfaSecret) {
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
    const userId = (req as any).user.userId;
    const secret = authenticator.generateSecret();
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otpauthUrl = authenticator.keyuri(user.email, 'BuildSpace', secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    await prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret } });
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

export const oauthGoogle = async (req: Request, res: Response) => { res.status(501).json({ message: 'Not implemented' }); };
export const oauthGithub = async (req: Request, res: Response) => { res.status(501).json({ message: 'Not implemented' }); };
