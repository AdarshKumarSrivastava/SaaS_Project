import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

// In-memory store for Hire Me OTPs and temporary data
const hireOtpStore = new Map<string, string>();
const hirePendingData = new Map<string, any>();

// Nodemailer transporter (will only work if env vars are set)
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email, role, stipend, message } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    hireOtpStore.set(email, otp);
    hirePendingData.set(email, { role, stipend, message, email });

    console.log(`[HIRE OTP GENERATED] For ${email}: ${otp}`);

    // Try to send email if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Verify your email to contact Adarsh Srivastava',
        text: `Your verification code is: ${otp}\n\nUse this code to verify your identity and send your job offer to Adarsh.`,
      });
    }

    res.json({ message: 'OTP sent successfully. Please check your email (or server logs).' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitOffer = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    
    const storedOtp = hireOtpStore.get(email);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const pendingData = hirePendingData.get(email);
    if (!pendingData) {
      return res.status(400).json({ error: 'No pending data found for this email' });
    }

    const receivingEmail = process.env.RECEIVING_EMAIL || 'adarshsrivastava1524@gmail.com';

    // Send the final offer email to Adarsh
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: receivingEmail,
        subject: `New Job Offer: ${pendingData.role}`,
        html: `
          <h2>New Job Offer / Message</h2>
          <p><strong>From:</strong> ${pendingData.email}</p>
          <p><strong>Role:</strong> ${pendingData.role}</p>
          <p><strong>Stipend/Salary:</strong> ${pendingData.stipend || 'Not specified'}</p>
          <hr/>
          <p><strong>Message:</strong></p>
          <p>${pendingData.message || 'No additional message.'}</p>
        `,
      });
      console.log(`[SUCCESS] Offer email sent to ${receivingEmail}`);
    } else {
      console.log(`[MOCK SUCCESS] Offer would have been sent to ${receivingEmail}`);
      console.log(pendingData);
    }

    // Clean up
    hireOtpStore.delete(email);
    hirePendingData.delete(email);

    res.json({ message: 'Offer sent successfully! Adarsh will get back to you soon.' });
  } catch (error) {
    console.error('Error submitting offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
