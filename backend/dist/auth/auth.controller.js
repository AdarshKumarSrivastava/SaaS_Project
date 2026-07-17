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
// In-memory store for OTPs (for MVP)
const otpStore = new Map();
const JWT_SECRET = process.env.JWT_PLATFORM_SECRET || 'fallback_secret';
function generateTokens(userId) {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}
const signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password required' });
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ error: 'User already exists' });
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        await prisma_1.prisma.user.create({
            data: { email, passwordHash }
        });
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, otp);
        // Mock email send
        console.log(`[MOCK EMAIL] OTP for ${email} is: ${otp}`);
        res.status(201).json({ message: 'User created. Please verify OTP.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.signup = signup;
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const storedOtp = otpStore.get(email);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        await prisma_1.prisma.user.update({
            where: { email },
            data: { emailVerified: true }
        });
        otpStore.delete(email);
        res.json({ message: 'Email verified successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.verifyOtp = verifyOtp;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (!user.emailVerified) {
            return res.status(403).json({ error: 'Please verify your email first' });
        }
        if (user.mfaSecret) {
            // Issue a temporary token for MFA verification
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
        const userId = req.user.userId; // Set by authenticate middleware
        const secret = authenticator.generateSecret();
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const otpauthUrl = authenticator.keyuri(user.email, 'BuildSpace', secret);
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(otpauthUrl);
        // Save temporarily or directly? We'll just save it directly for MVP
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { mfaSecret: secret }
        });
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
// Mocks for OAuth
const oauthGoogle = async (req, res) => { res.status(501).json({ message: 'Not implemented' }); };
exports.oauthGoogle = oauthGoogle;
const oauthGithub = async (req, res) => { res.status(501).json({ message: 'Not implemented' }); };
exports.oauthGithub = oauthGithub;
