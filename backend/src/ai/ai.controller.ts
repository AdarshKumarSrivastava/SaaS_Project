import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateEmbedding, generateCompletion } from './openai.service';

export const chat = async (req: Request, res: Response) => {
  const { query, siteId } = req.body;
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
    const answer = await generateCompletion(query, context);

    res.json({
      role: 'assistant',
      content: answer
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI chat request' });
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
