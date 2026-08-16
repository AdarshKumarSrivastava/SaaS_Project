"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCompletion = exports.generateEmbedding = void 0;
const openai_1 = __importDefault(require("openai"));
// Use the existing PLATFORM_AI_API_KEY from .env
const openai = new openai_1.default({
    apiKey: process.env.PLATFORM_AI_API_KEY,
});
const generateEmbedding = async (text) => {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
};
exports.generateEmbedding = generateEmbedding;
const generateCompletion = async (prompt, context, stream = false) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        stream: stream,
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
    return stream ? response : response.choices[0].message.content;
};
exports.generateCompletion = generateCompletion;
