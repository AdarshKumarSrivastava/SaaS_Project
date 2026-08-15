import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateEmbedding, generateCompletion } from './openai.service';

export const chat = async (req: Request, res: Response) => {
  const { query, siteId, conversationId, sessionId } = req.body;
  if (!query || !siteId) {
    return res.status(400).json({ error: 'Query and siteId are required' });
  }

  try {
    const embedding = await generateEmbedding(query);
    const vectorStr = `[${embedding.join(',')}]`;

    // Perform vector similarity search
    const documents: any[] = await prisma.$queryRaw`
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
       const newConv = await prisma.conversation.create({
         data: {
           siteId,
           sessionId: sessionId || 'anonymous',
           userId: (req as any).user?.userId || null
         }
       });
       currentConversationId = newConv.id;
    }

    // Persist user message
    await prisma.message.create({
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

    const stream: any = await generateCompletion(query, context, true);
    
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
    await prisma.message.create({
      data: {
        conversationId: currentConversationId,
        role: 'assistant',
        content: fullContent
      }
    });

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('AI Chat Error:', error);
    // If headers are not sent, send JSON error. Else end stream.
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process AI chat request' });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to process AI chat request' })}\n\n`);
      res.end();
    }
  }
};

export const ingest = async (req: Request, res: Response) => {
  const { content, siteId } = req.body;
  if (!content || !siteId) {
    return res.status(400).json({ error: 'Content and siteId are required' });
  }

  try {
    const embedding = await generateEmbedding(content);
    const vectorStr = `[${embedding.join(',')}]`;

    await prisma.$executeRaw`
      INSERT INTO "SiteDocument" ("id", "siteId", "content", "embedding", "createdAt")
      VALUES (gen_random_uuid(), ${siteId}, ${content}, ${vectorStr}::vector, now())
    `;

    res.json({ message: 'Content successfully ingested into vector store.' });
  } catch (error) {
    console.error('AI Ingest Error:', error);
    res.status(500).json({ error: 'Failed to ingest content' });
  }
};
