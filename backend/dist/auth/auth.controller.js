"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthGithub = exports.oauthGoogle = exports.logout = exports.refresh = exports.verifyMfa = exports.enableMfa = exports.login = exports.verifyOtp = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { authenticator } = require('otplib');
const qrcode_1 = __importDefault(require("qrcode"));
const prisma_1 = require("../lib/prisma");
const nodemailer_1 = __importDefault(require("nodemailer"));
const zod_1 = require("zod");
const JWT_SECRET = process.env.JWT_PLATFORM_SECRET || 'fallback_secret';
function generateTokens(userId) {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}
// Zod schemas
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
const verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    otp: zod_1.z.string().length(6)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
const signup = async (req, res) => {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        const { name, email, password } = parsed.data;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ error: 'User already exists' });
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await prisma_1.prisma.pendingSignup.upsert({
            where: { email },
            create: { email, name, passwordHash, otp, expiresAt },
            update: { name, passwordHash, otp, expiresAt, createdAt: new Date() }
        });
        if (process.env.SMTP_EMAIL && process.env.SMTP_APP_PASSWORD) {
            const transporter = nodemailer_1.default.createTransport({
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
        }
        else {
            console.log(`[MOCK EMAIL] OTP for ${email} is: ${otp}`);
        }
        res.status(201).json({ message: 'OTP sent. Please verify to complete registration.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.signup = signup;
const verifyOtp = async (req, res) => {
    try {
        const parsed = verifyOtpSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: 'Invalid input' });
        const { email, otp } = parsed.data;
        const pending = await prisma_1.prisma.pendingSignup.findUnique({ where: { email } });
        if (!pending || pending.otp !== otp) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        if (pending.expiresAt < new Date()) {
            await prisma_1.prisma.pendingSignup.delete({ where: { email } });
            return res.status(400).json({ error: 'OTP has expired. Please sign up again.' });
        }
        await prisma_1.prisma.user.upsert({
            where: { email },
            create: { name: pending.name, email: pending.email, passwordHash: pending.passwordHash, emailVerified: true },
            update: { emailVerified: true }
        });
        await prisma_1.prisma.pendingSignup.delete({ where: { email } });
        res.json({ message: 'Email verified successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.verifyOtp = verifyOtp;
const login = async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: 'Invalid credentials format' });
        const { email, password } = parsed.data;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (!user.emailVerified) {
            return res.status(403).json({ error: 'Please verify your email first' });
        }
        if (user.mfaSecret) {
            const mfaToken = jsonwebtoken_1.default.sign({ userId: user.id, mfaPending: true }, JWT_SECRET, { expiresIn: '5m' });
            return res.json({ mfaRequired: true, mfaToken });
        }
        const tokens = generateTokens(user.id);
        res.json({ ...tokens, user: { id: user.id, email: user.email } });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const enableMfa = async (req, res) => {
    try {
        const userId = req.user.userId;
        const secret = authenticator.generateSecret();
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const otpauthUrl = authenticator.keyuri(user.email, 'BuildSpace', secret);
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(otpauthUrl);
        await prisma_1.prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret } });
        res.json({ qrCodeUrl: qrCodeDataUrl, secret });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.enableMfa = enableMfa;
const verifyMfa = async (req, res) => {
    try {
        const { mfaToken, token } = req.body;
        if (!mfaToken || !token)
            return res.status(400).json({ error: 'MFA token and code required' });
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(mfaToken, JWT_SECRET);
        }
        catch (e) {
            return res.status(401).json({ error: 'Invalid or expired MFA token' });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.mfaSecret)
            return res.status(400).json({ error: 'MFA not enabled for user' });
        const isValid = authenticator.verify({ token, secret: user.mfaSecret });
        if (!isValid)
            return res.status(400).json({ error: 'Invalid MFA code' });
        const tokens = generateTokens(user.id);
        res.json({ ...tokens, user: { id: user.id, email: user.email } });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.verifyMfa = verifyMfa;
const refresh = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        return res.status(400).json({ error: 'Refresh token required' });
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET);
        if (decoded.type !== 'refresh')
            throw new Error('Invalid token type');
        const tokens = generateTokens(decoded.userId);
        res.json(tokens);
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};
exports.refresh = refresh;
const logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const oauthGoogle = async (req, res) => { res.status(501).json({ message: 'Not implemented' }); };
exports.oauthGoogle = oauthGoogle;
const oauthGithub = async (req, res) => { res.status(501).json({ message: 'Not implemented' }); };
exports.oauthGithub = oauthGithub;
