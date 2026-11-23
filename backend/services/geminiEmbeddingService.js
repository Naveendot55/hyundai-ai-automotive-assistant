import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';

let genAI = null;

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * Default Embedding Configuration
 * gemini-embedding-001 supports Matryoshka Representation Learning (MRL).
 * We default outputDimensionality to 768 for high retrieval accuracy and compatibility with Atlas vector indexes.
 */
export const EMBEDDING_CONFIG = {
  model: process.env.EMBEDDING_MODEL || 'gemini-embedding-001',
  dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS, 10) || 768
};

/**
 * Generate embedding vector using Gemini gemini-embedding-001
 * 
 * @param {string} text - Text to embed
 * @param {Object} options - Options: isQuery (boolean), taskType (TaskType), title (string)
 * @returns {Promise<number[]>} - Embedding vector array
 */
export const generateEmbedding = async (text, options = {}) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const apiKey = process.env.GEMINI_API_KEY;
  const isQuery = options.isQuery ?? false;

  // Enforce real Gemini API key in production
  if (isProduction && (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY')) {
    throw new Error(
      '[Production Configuration Error] GEMINI_API_KEY is required in production environment. Deterministic fallback vectors are strictly disabled.'
    );
  }

  const ai = getGenAI();

  if (ai) {
    try {
      const modelName = process.env.EMBEDDING_MODEL || 'gemini-embedding-001';
      const model = ai.getGenerativeModel({ model: modelName }, { timeout: 15000 });
      
      const taskType = options.taskType || (isQuery ? TaskType.RETRIEVAL_QUERY : TaskType.RETRIEVAL_DOCUMENT);
      
      const embedPayload = {
        content: {
          parts: [{ text: text.trim() }]
        },
        taskType,
        ...(options.title && { title: options.title }),
        outputDimensionality: EMBEDDING_CONFIG.dimensions
      };

      const result = await model.embedContent(embedPayload);
      
      if (result && result.embedding && result.embedding.values) {
        return result.embedding.values;
      }
    } catch (error) {
      if (isProduction) {
        throw new Error(`[GeminiEmbedding Production Error]: ${error.message}`);
      }
      console.warn(`[GeminiEmbedding] API call error (${error.message}). Falling back to deterministic embedding for test/dev.`);
    }
  }

  // Development/Test fallback only
  return generateDeterministicEmbedding(text, EMBEDDING_CONFIG.dimensions);
};

/**
 * Deterministic pseudo-embedding for local testing / offline verification
 * Guaranteed unit-length vector with dimension matching EMBEDDING_CONFIG.dimensions
 */
export const generateDeterministicEmbedding = (text, dimensions = EMBEDDING_CONFIG.dimensions) => {
  const vec = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase();
  
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    const index = (code * 31 + i * 17) % dimensions;
    vec[index] += 1;
  }

  // Normalize to unit vector
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vec[i] = vec[i] / norm;
    }
  }
  return vec;
};

/**
 * Calculate Cosine Similarity between two numeric vectors
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(vecA.length, vecB.length);

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
