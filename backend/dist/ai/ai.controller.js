"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingest = exports.chat = void 0;
const prisma_1 = require("../lib/prisma");
const openai_service_1 = require("./openai.service");
const chat = async (req, res) => {
    const { query, siteId } = req.body;
    if (!query || !siteId) {
        return res.status(400).json({ error: 'Query and siteId are required' });
    }
    try {
        const embedding = await (0, openai_service_1.generateEmbedding)(query);
        const vectorStr = `[${embedding.join(',')}]`;
        // Perform vector similarity search
        const documents = await prisma_1.prisma.$queryRaw `
      SELECT content, 1 - (embedding <=> ${vectorStr}::vector) AS similarity
      FROM "SiteDocument"
      WHERE "siteId" = ${siteId}
      ORDER BY similarity DESC
      LIMIT 5
    `;
        const context = documents.map(d => d.content);
        const answer = await (0, openai_service_1.generateCompletion)(query, context);
        res.json({
            role: 'assistant',
            content: answer
        });
    }
    catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to process AI chat request' });
    }
};
exports.chat = chat;
const ingest = async (req, res) => {
    const { content, siteId } = req.body;
    if (!content || !siteId) {
        return res.status(400).json({ error: 'Content and siteId are required' });
    }
    try {
        const embedding = await (0, openai_service_1.generateEmbedding)(content);
        const vectorStr = `[${embedding.join(',')}]`;
        await prisma_1.prisma.$executeRaw `
      INSERT INTO "SiteDocument" ("id", "siteId", "content", "embedding", "createdAt")
      VALUES (gen_random_uuid(), ${siteId}, ${content}, ${vectorStr}::vector, now())
    `;
        res.json({ message: 'Content successfully ingested into vector store.' });
    }
    catch (error) {
        console.error('AI Ingest Error:', error);
        res.status(500).json({ error: 'Failed to ingest content' });
    }
};
exports.ingest = ingest;
