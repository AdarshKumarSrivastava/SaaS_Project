import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// eslint-disable-next-line @typescript-eslint/no-require-imports
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

function setTokenCookies(res: Response, tokens: { accessToken: string, refreshToken: string }) {
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.cookie('accessToken', tokens.accessToken, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000
  });
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
    
    if (process.env.SMTP_EMAIL && process.env.SMTP_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
        port: parseInt(process.env.SMTP_PORT || "2525"),
        auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_APP_PASSWORD },
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
      // In development/mock mode, return the OTP to the client so they can easily test it
      return res.status(201).json({ 
        message: 'OTP sent. Please verify to complete registration.',
        development_otp: otp 
      });
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

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const pending = await prisma.pendingSignup.findUnique({ where: { email } });
    if (!pending) {
      return res.status(400).json({ error: 'No pending signup found for this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.pendingSignup.update({
      where: { email },
      data: { otp, expiresAt }
    });

    if (process.env.SMTP_EMAIL && process.env.SMTP_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
        port: parseInt(process.env.SMTP_PORT || "2525"),
        auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_APP_PASSWORD },
      });

      await transporter.sendMail({
        from: `"BuildSpace" <${process.env.SMTP_FROM || 'noreply@buildspace.com'}>`,
        to: email,
        subject: 'Your BuildSpace Verification Code (Resent)',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to BuildSpace!</h2>
          <p>Your new authentication code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #d946ef;">${otp}</h1>
          <p>Enter this code to complete your registration. This code will expire soon.</p>
        </div>`,
      });
      console.log(`[EMAIL RESENT] OTP sent to ${email}`);
    } else {
      console.log(`[MOCK EMAIL RESENT] OTP for ${email} is: ${otp}`);
      return res.status(200).json({ 
        message: 'OTP resent successfully.',
        development_otp: otp
      });
    }

    res.status(200).json({ message: 'OTP resent successfully.' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log('[LOGIN REQUEST] body:', req.body, 'headers:', req.headers);
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid credentials format' });
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
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
    setTokenCookies(res, tokens);
    res.json({ 
      ...tokens, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name
      } 
    });
  } catch (error: any) {
    console.error('[AUTH LOGIN ERROR]', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
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
    setTokenCookies(res, tokens);
    res.json({ ...tokens, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refresh = (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const decoded: any = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== 'refresh') throw new Error('Invalid token type');

    const tokens = generateTokens(decoded.userId);
    setTokenCookies(res, tokens);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
  res.json({ message: 'Logged out successfully' });
};

export const oauthGoogle = async (req: Request, res: Response) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/google/callback';
  const clientId = process.env.GOOGLE_CLIENT_ID || 'stub_google_client_id';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
  res.json({ url });
};

export const oauthGoogleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=OAuthFailed`);
    return;
  }
  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/google/callback';
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('Failed to get Google access token');

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    if (!userData.email) throw new Error('No email returned from Google');

    const email = userData.email;
    const googleId = String(userData.id);
    const name = userData.name || 'Google User';

    let user = await prisma.user.findFirst({ where: { OR: [{ googleId }, { email }] } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name, googleId, emailVerified: true, passwordHash: '' }
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId } });
    }

    const tokens = generateTokens(user.id);
    setTokenCookies(res, tokens);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=OAuthFailed`);
  }
};

export const oauthGithub = async (req: Request, res: Response) => {
  const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/github/callback';
  const clientId = process.env.GITHUB_CLIENT_ID || 'stub_github_client_id';
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  res.json({ url });
};

export const oauthGithubCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=OAuthFailed`);
    return;
  }
  try {
    const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/github/callback';
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('Failed to get GitHub access token');

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    const githubId = String(userData.id);
    const name = userData.name || userData.login || 'GitHub User';

    let email = userData.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const emails = await emailRes.json();
      const primary = emails.find((e: any) => e.primary) || emails[0];
      if (primary) email = primary.email;
    }

    if (!email) throw new Error('No email associated with GitHub account');

    let user = await prisma.user.findFirst({ where: { OR: [{ githubId }, { email }] } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name, githubId, emailVerified: true, passwordHash: '' }
      });
    } else if (!user.githubId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { githubId } });
    }

    const tokens = generateTokens(user.id);
    setTokenCookies(res, tokens);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=OAuthFailed`);
  }
};
