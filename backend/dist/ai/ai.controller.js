"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingest = exports.chat = void 0;
const prisma_1 = require("../lib/prisma");
const openai_service_1 = require("./openai.service");
const chat = async (req, res) => {
    const { query, siteId, conversationId, sessionId } = req.body;
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
        // Conversation management
        let currentConversationId = conversationId;
        if (!currentConversationId) {
            const newConv = await prisma_1.prisma.conversation.create({
                data: {
                    siteId,
                    sessionId: sessionId || 'anonymous',
                    userId: req.user?.userId || null
                }
            });
            currentConversationId = newConv.id;
        }
        // Persist user message
        await prisma_1.prisma.message.create({
            data: {
                conversationId: currentConversationId,
                role: 'user',
                content: query
            }
        });
        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        // Stream initial data with conversation ID
        res.write(`data: ${JSON.stringify({ type: 'init', conversationId: currentConversationId })}\n\n`);
        const stream = await (0, openai_service_1.generateCompletion)(query, context, true);
        let fullContent = '';
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullContent += content;
                // Send chunk to client
                res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
            }
        }
        // Persist assistant message
        await prisma_1.prisma.message.create({
            data: {
                conversationId: currentConversationId,
                role: 'assistant',
                content: fullContent
            }
        });
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
    }
    catch (error) {
        console.error('AI Chat Error:', error);
        // If headers are not sent, send JSON error. Else end stream.
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process AI chat request' });
        }
        else {
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to process AI chat request' })}\n\n`);
            res.end();
        }
    }
};
exports.chat = chat;
const ingest = async (req, res) => {
    const { content, siteId } = req.body;
    const userId = req.user?.userId || req.user?.id;
    if (!content || !siteId) {
        return res.status(400).json({ error: 'Content and siteId are required' });
    }
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const siteRole = await prisma_1.prisma.siteRole.findFirst({
            where: { siteId, userId, role: { in: ['owner', 'editor'] } }
        });
        if (!siteRole) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to ingest content for this site' });
        }
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
