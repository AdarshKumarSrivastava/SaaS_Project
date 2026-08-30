import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_PLATFORM_SECRET || 'fallback_secret';

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, siteId } = await req.json();

    if (!email || !password || !siteId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // Check if customer already exists for this site
    const existing = await prisma.customer.findUnique({
      where: {
        siteId_email: {
          siteId,
          email: emailLower,
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Customer already exists for this store' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await prisma.customer.create({
      data: {
        siteId,
        email: emailLower,
        passwordHash,
        firstName,
        lastName,
        lastLoginAt: new Date(),
      }
    });

    // Create session token
    const token = jwt.sign({ customerId: customer.id, siteId: customer.siteId }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({
      message: 'Registration successful',
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName
      }
    });

    // Set cookie
    response.cookies.set('storefront_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[Storefront Register Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
