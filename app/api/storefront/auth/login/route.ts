import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_PLATFORM_SECRET || 'fallback_secret';

export async function POST(req: NextRequest) {
  try {
    const { email, password, siteId } = await req.json();

    if (!email || !password || !siteId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    const customer = await prisma.customer.findUnique({
      where: {
        siteId_email: {
          siteId,
          email: emailLower,
        }
      }
    });

    if (!customer || !customer.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, customer.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() }
    });

    const token = jwt.sign({ customerId: customer.id, siteId: customer.siteId }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({
      message: 'Login successful',
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName
      }
    });

    response.cookies.set('storefront_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[Storefront Login Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
