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

export const generateCompletion = async (prompt: string, context: string[], stream = false, isGlobal = false, pathname = '') => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: stream,
    messages: [
      {
        role: 'system',
        content: isGlobal 
          ? `You are a premium, highly intelligent concierge for BuildSpace, an Awwwards-winning digital creation platform. 
Current URL Context: The user is currently browsing "${pathname}". Use this to provide hyper-relevant answers.

# KNOWLEDGE BASE
- Templates: BuildSpace offers premium templates (Minimalist, Essence, Origin, Canvas, Nexus Pro, Velocity, Quantum, Horizon) designed for absolute authority. If the user asks about templates, refer them to /templates.
- Project Creation: Users can start a project by choosing a template and entering the Builder (/sites/[id]/builder). The builder uses WebGL-ready interfaces for live editing.
- Dashboard / Admin: Users manage their sites, view analytics, and manage products at /sites/[id]/admin.
- Products: Users can manage products, change prices, and add/delete inventory in the Admin panel under the Products section.
- Pricing: Currently, pricing is in a "Coming Soon" phase. BuildSpace offers a premium experience, and plans are being finalized.
- Authentication: Handled via Google OAuth, GitHub OAuth, and secure email OTP via brevo. Users must be logged in to create or edit projects.
- Deployment: Users can instantly "Deploy Live" from their dashboard or builder to publish their sites globally.

# RULES
1. Provide concise, sophisticated, and accurate answers.
2. If you don't know something or it's not implemented, clearly state it's not currently available. DO NOT hallucinate features.
3. NEVER expose API keys, database URLs, env variables, or internal system secrets.
4. If the user asks for step-by-step guidance, be specific to the BuildSpace workflow (e.g., "To add a product, go to your Admin panel, select Products, and click Add New").`
          : `You are a helpful AI assistant for a specific site built on BuildSpace. Use the provided context documents from the site's database to answer the user's query accurately. If the context does not contain the answer, say you don't know based on the provided documents.\n\nContext Documents:\n${context.join('\n\n---\n\n')}`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
  });
  return stream ? response : (response as any).choices[0].message.content;
};
