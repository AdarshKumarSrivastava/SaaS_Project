import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import crypto from 'crypto';

// Reusable Transporter setup based on existing auth logic
function getTransporter() {
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.SMTP_APP_PASSWORD;
  
  if (user && pass) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      auth: { user, pass },
    });
  }
  return null;
}

const submitSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email format').trim(),
  message: z.string().min(2, 'Message is too short').max(5000, 'Message is too long').trim(),
  siteId: z.string().optional(),
});

export const submitEnquiry = async (req: Request, res: Response) => {
  try {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessage = parsed.error.issues[0]?.message || 'Invalid input';
      return res.status(400).json({ error: errorMessage });
    }

    const { name, email, message, siteId } = parsed.data;

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const existingOTP = await prisma.enquiryOTP.findUnique({
      where: { email_siteId: { email, siteId: siteId || '' } },
    });

    if (existingOTP) {
      const timeSinceLast = Date.now() - existingOTP.createdAt.getTime();
      if (timeSinceLast < 60 * 1000) {
        return res.status(429).json({ error: 'Please wait a minute before requesting another verification code.' });
      }
    }

    await prisma.enquiryOTP.upsert({
      where: { email_siteId: { email, siteId: siteId || '' } },
      create: { email, otp, siteId: siteId || '', name, message, expiresAt },
      update: { otp, name, message, expiresAt, attempts: 0, createdAt: new Date() },
    });

    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"BuildSpace" <${process.env.SMTP_FROM || 'noreply@buildspace.com'}>`,
        to: email,
        subject: 'Verify your Enquiry - BuildSpace',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="font-weight: normal; margin-bottom: 24px;">Verify your email</h2>
          <p>Please use the following 6-digit code to verify your email and send your enquiry.</p>
          <div style="background-color: #f4f4f4; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0; color: #111;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
        </div>`,
      });
      console.log(`[ENQUIRY] OTP sent to ${email}`);
    } else {
      console.log(`[MOCK ENQUIRY EMAIL] OTP for ${email} is: ${otp}`);
    }

    res.status(200).json({ message: 'OTP sent. Please verify your email.' });
  } catch (error) {
    console.error('[submitEnquiry Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  siteId: z.string().optional(),
});

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessage = parsed.error.issues[0]?.message || 'Invalid input';
      return res.status(400).json({ error: errorMessage });
    }
    const { email, otp, siteId } = parsed.data;

    const pending = await prisma.enquiryOTP.findUnique({
      where: { email_siteId: { email, siteId: siteId || '' } },
    });

    if (!pending) {
      return res.status(400).json({ error: 'No pending enquiry found for this email' });
    }

    if (pending.attempts >= 5) {
      await prisma.enquiryOTP.delete({
        where: { email_siteId: { email, siteId: siteId || '' } },
      });
      return res.status(429).json({ error: 'Too many failed attempts. Please request a new verification code.' });
    }

    if (pending.expiresAt < new Date()) {
      return res.status(400).json({ error: 'This verification code has expired.' });
    }

    if (pending.otp !== otp) {
      await prisma.enquiryOTP.update({
        where: { email_siteId: { email, siteId: siteId || '' } },
        data: { attempts: pending.attempts + 1 },
      });
      return res.status(400).json({ error: 'Incorrect verification code. Try again.' });
    }

    // OTP Verified! Create the Enquiry.
    const enquiry = await prisma.enquiry.create({
      data: {
        name: pending.name,
        email: pending.email,
        message: pending.message,
        siteId: siteId || null,
        status: 'NEW',
        verifiedAt: new Date(),
      }
    });

    // Delete the OTP record to prevent reuse
    await prisma.enquiryOTP.delete({
      where: { email_siteId: { email, siteId: siteId || '' } },
    });

    // Send notification to Admin (adarshsrivastava1524@gmail.com)
    const adminEmail = process.env.ENQUIRY_RECIPIENT_EMAIL || 'adarshsrivastava1524@gmail.com';
    const transporter = getTransporter();
    
    if (transporter) {
      await transporter.sendMail({
        from: `"BuildSpace Enquiries" <${process.env.SMTP_FROM || 'noreply@buildspace.com'}>`,
        to: adminEmail,
        replyTo: pending.email,
        subject: `New Website Enquiry from ${pending.name}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <h2 style="border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 24px;">NEW WEBSITE ENQUIRY</h2>
          <p><strong>Name:</strong> ${pending.name}</p>
          <p><strong>Verified Email:</strong> <a href="mailto:${pending.email}">${pending.email}</a></p>
          <p><strong>Website ID:</strong> ${siteId || 'Platform / Global'}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <div style="background-color: #f9f9f9; padding: 16px; border-left: 4px solid #333; margin: 24px 0; white-space: pre-wrap;">${pending.message}</div>
          <p style="font-size: 12px; color: #999;">Reply directly to this email to contact the user.</p>
        </div>`,
      });
      console.log(`[ENQUIRY] Notification sent to admin for ${email}`);
    } else {
      console.log(`[MOCK NOTIFICATION] Enquiry created. Admin email skipped.`);
    }

    res.status(200).json({ message: 'Enquiry verified and sent successfully.', enquiryId: enquiry.id });
  } catch (error) {
    console.error('[verifyOtp Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const resendSchema = z.object({
  email: z.string().email(),
  siteId: z.string().optional(),
});

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const parsed = resendSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessage = parsed.error.issues[0]?.message || 'Invalid input';
      return res.status(400).json({ error: errorMessage });
    }
    const { email, siteId } = parsed.data;

    const pending = await prisma.enquiryOTP.findUnique({
      where: { email_siteId: { email, siteId: siteId || '' } },
    });

    if (!pending) {
      return res.status(400).json({ error: 'No pending enquiry found for this email' });
    }

    const timeSinceLast = Date.now() - pending.createdAt.getTime();
    if (timeSinceLast < 60 * 1000) {
      return res.status(429).json({ error: 'Please wait a minute before requesting another verification code.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.enquiryOTP.update({
      where: { email_siteId: { email, siteId: siteId || '' } },
      data: { otp, expiresAt, attempts: 0, createdAt: new Date() },
    });

    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"BuildSpace" <${process.env.SMTP_FROM || 'noreply@buildspace.com'}>`,
        to: email,
        subject: 'Your new verification code - BuildSpace',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="font-weight: normal; margin-bottom: 24px;">Verify your email</h2>
          <p>Please use your new 6-digit code to verify your email and send your enquiry.</p>
          <div style="background-color: #f4f4f4; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0; color: #111;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
        </div>`,
      });
      console.log(`[ENQUIRY RESEND] OTP resent to ${email}`);
    } else {
      console.log(`[MOCK ENQUIRY EMAIL RESEND] OTP for ${email} is: ${otp}`);
    }

    res.status(200).json({ message: 'OTP resent successfully.' });
  } catch (error) {
    console.error('[resendOtp Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEnquiries = async (req: Request, res: Response) => {
  try {
    const { siteId } = req.query;
    if (!siteId || typeof siteId !== 'string') {
      return res.status(400).json({ error: 'siteId is required' });
    }

    const enquiries = await prisma.enquiry.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ enquiries });
  } catch (error) {
    console.error('[getEnquiries Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
