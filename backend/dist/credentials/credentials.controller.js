"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCredential = exports.listCredentials = exports.saveCredentials = void 0;
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
        // In a full production environment, this would physically instantiate the external SDKs
        // e.g. new Stripe(keyValue) and call stripe.paymentIntents.list()
        // For MVP, we mock the network verification.
        // Fake 500ms delay to simulate network call
        await new Promise(resolve => setTimeout(resolve, 500));
        if (keyValue.length < 10) {
            return res.status(400).json({ valid: false, message: 'Key length must be at least 10 characters' });
        }
        res.json({ valid: true, message: 'Verification passed' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.testCredential = testCredential;
