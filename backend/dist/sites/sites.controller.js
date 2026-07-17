"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAuth = exports.inviteRole = exports.deleteSite = exports.updateSite = exports.getSite = exports.createSite = exports.listSites = void 0;
const prisma_1 = require("../lib/prisma");
const crypto_1 = __importDefault(require("crypto"));
// GET /api/sites
const listSites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const siteRoles = await prisma_1.prisma.siteRole.findMany({
            where: { userId },
            include: { site: true },
            orderBy: { site: { createdAt: 'desc' } }
        });
        const sites = siteRoles.map((sr) => ({ ...sr.site, myRole: sr.role }));
        res.json(sites);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.listSites = listSites;
// POST /api/sites
const createSite = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, category } = req.body;
        if (!name || !category) {
            return res.status(400).json({ error: 'Name and category are required' });
        }
        const subdomain = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto_1.default.randomBytes(3).toString('hex')}`;
        const site = await prisma_1.prisma.site.create({
            data: {
                ownerId: userId,
                name,
                category,
                subdomain,
                roles: {
                    create: {
                        userId: userId,
                        role: 'owner'
                    }
                }
            }
        });
        res.status(201).json(site);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createSite = createSite;
// GET /api/sites/:siteId
const getSite = async (req, res) => {
    try {
        const siteId = req.params.siteId;
        const site = await prisma_1.prisma.site.findUnique({ where: { id: siteId } });
        if (!site)
            return res.status(404).json({ error: 'Site not found' });
        res.json(site);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getSite = getSite;
// PATCH /api/sites/:siteId
const updateSite = async (req, res) => {
    try {
        const siteId = req.params.siteId;
        const { name, customDomain } = req.body;
        const site = await prisma_1.prisma.site.update({
            where: { id: siteId },
            data: { name, customDomain }
        });
        res.json(site);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateSite = updateSite;
// DELETE /api/sites/:siteId
const deleteSite = async (req, res) => {
    try {
        const siteId = req.params.siteId;
        await prisma_1.prisma.siteRole.deleteMany({ where: { siteId } });
        await prisma_1.prisma.siteCredential.deleteMany({ where: { siteId } });
        await prisma_1.prisma.site.delete({ where: { id: siteId } });
        res.json({ message: 'Site deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteSite = deleteSite;
// POST /api/sites/:siteId/roles
const inviteRole = async (req, res) => {
    res.status(501).json({ message: 'Not implemented for MVP' });
};
exports.inviteRole = inviteRole;
// Test endpoint for verifying authorize middleware (from Phase 3)
const testAuth = async (req, res) => {
    const siteRole = req.siteRole;
    res.json({
        message: 'Authorization successful',
        siteId: req.params.siteId,
        role: siteRole.role
    });
};
exports.testAuth = testAuth;
