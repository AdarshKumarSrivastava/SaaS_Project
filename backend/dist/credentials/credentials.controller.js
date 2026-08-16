"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPin = exports.forgotPin = exports.verifyPin = exports.setupPin = exports.getPinStatus = exports.testCredential = exports.listCredentials = exports.saveCredentials = void 0;
const prisma_1 = require("../lib/prisma");
const encryption_1 = require("../lib/encryption");
// POST /api/sites/:siteId/credentials
const saveCredentials = async (req, res) => {
    try {
        const siteId = req.params.siteId;
        const { keys } = req.body; // Array of { keyName, keyValue }
        if (!Array.isArray(keys)) {
            return res.status(400).json({ error: 'Keys array is required' });
        }
        const existingCreds = await prisma_1.prisma.siteCredential.findMany({ where: { siteId } });
        const operations = keys.map(k => {
            const existing = existingCreds.find(ec => ec.keyType === k.keyName);
            const encryptedValue = (0, encryption_1.encrypt)(k.keyValue);
            const maskedPreview = (0, encryption_1.maskKey)(k.keyValue);
            if (existing) {
                return prisma_1.prisma.siteCredential.update({
                    where: { id: existing.id },
                    data: { encryptedValue, maskedPreview }
                });
            }
            else {
                return prisma_1.prisma.siteCredential.create({
                    data: {
                        siteId,
                        keyType: k.keyName,
                        encryptedValue,
                        maskedPreview
                    }
                });
            }
        });
        await prisma_1.prisma.$transaction(operations);
        res.json({ message: 'Credentials securely saved' });
    }
    catch (error) {
        console.error('Save credentials error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.saveCredentials = saveCredentials;
// GET /api/sites/:siteId/credentials
const listCredentials = async (req, res) => {
    try {
        const siteId = req.params.siteId;
        const credentials = await prisma_1.prisma.siteCredential.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.listCredentials = listCredentials;
// POST /api/sites/:siteId/credentials/test
const testCredential = async (req, res) => {
    try {
        const { keyName, keyValue } = req.body;
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!keyValue) {
            return res.status(400).json({ valid: false, message: 'Key value is required' });
        }
        if (keyName === 'ai_api_key') {
            try {
                const aiRes = await fetch('https://api.openai.com/v1/models', {
                    headers: { Authorization: `Bearer ${keyValue}` }
                });
                if (!aiRes.ok)
                    return res.status(400).json({ valid: false, message: 'Invalid OpenAI API Key' });
            }
            catch (e) {
                return res.status(400).json({ valid: false, message: 'Failed to verify OpenAI API Key' });
            }
        }
        else if (keyName === 'payment_secret_key') {
            if (!keyValue.startsWith('sk_')) {
                return res.status(400).json({ valid: false, message: 'Secret keys typically start with sk_' });
            }
            try {
                const stripeRes = await fetch('https://api.stripe.com/v1/charges', {
                    headers: { Authorization: `Bearer ${keyValue}` }
                });
                if (stripeRes.status === 401)
                    return res.status(400).json({ valid: false, message: 'Invalid Stripe Secret Key' });
            }
            catch (e) {
                return res.status(400).json({ valid: false, message: 'Failed to verify Stripe Key' });
            }
        }
        else if (keyName === 'payment_publishable_key' && !keyValue.startsWith('pk_')) {
            return res.status(400).json({ valid: false, message: 'Publishable keys typically start with pk_' });
        }
        else if (keyName.includes('jwt') && keyValue.length < 32) {
            return res.status(400).json({ valid: false, message: 'JWT Secret must be at least 32 characters' });
        }
        else if (keyName === 'imagekit_public' && !keyValue.startsWith('public_')) {
            return res.status(400).json({ valid: false, message: 'ImageKit public key should start with public_' });
        }
        else if (keyName === 'imagekit_private' && !keyValue.startsWith('private_')) {
            return res.status(400).json({ valid: false, message: 'ImageKit private key should start with private_' });
        }
        else if (keyName === 'imagekit_url_endpoint' && !keyValue.startsWith('http')) {
            return res.status(400).json({ valid: false, message: 'ImageKit endpoint must be a valid URL' });
        }
        else if (keyValue.length < 5) {
            return res.status(400).json({ valid: false, message: 'Key length must be at least 5 characters' });
        }
        res.json({ valid: true, message: 'Verification passed' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.testCredential = testCredential;
const bcrypt_1 = __importDefault(require("bcrypt"));
const byokOtpStore = new Map();
const getPinStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        res.json({ hasPin: !!user?.byokPinHash });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPinStatus = getPinStatus;
const setupPin = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pin } = req.body;
        if (!pin || pin.length < 4 || pin.length > 8) {
            return res.status(400).json({ error: 'PIN must be 4-8 characters' });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hash = await bcrypt_1.default.hash(pin, salt);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { byokPinHash: hash }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.setupPin = setupPin;
const verifyPin = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pin } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.byokPinHash) {
            return res.status(400).json({ error: 'PIN not set up' });
        }
        const isValid = await bcrypt_1.default.compare(pin, user.byokPinHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Incorrect PIN' });
        }
        res.json({ valid: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.verifyPin = verifyPin;
const forgotPin = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        byokOtpStore.set(user.email, { otp, expiresAt });
        console.log(`[MOCK EMAIL] BYOK Reset OTP for ${user.email} is: ${otp}`);
        res.json({ message: 'OTP sent to registered email' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.forgotPin = forgotPin;
const resetPin = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { otp, newPin } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
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
        const salt = await bcrypt_1.default.genSalt(10);
        const hash = await bcrypt_1.default.hash(newPin, salt);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { byokPinHash: hash }
        });
        byokOtpStore.delete(user.email);
        res.json({ success: true, message: 'PIN reset successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.resetPin = resetPin;
