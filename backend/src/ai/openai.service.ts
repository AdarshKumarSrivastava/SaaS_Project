import OpenAI from 'openai';

// Use the existing PLATFORM_AI_API_KEY from .env
const openai = new OpenAI({
  apiKey: process.env.PLATFORM_AI_API_KEY,
});

export const generateEmbedding = async (text: string) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
};

export const generateCompletion = async (prompt: string, context: string[]) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful AI assistant for a specific site built on BuildSpace. Use the provided context documents from the site's database to answer the user's query accurately. If the context does not contain the answer, say you don't know based on the provided documents.\n\nContext Documents:\n${context.join('\n\n---\n\n')}`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
  });
  return response.choices[0].message.content;
};
