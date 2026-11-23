import DocumentChunk from '../models/DocumentChunk.js';
import { generateEmbedding, cosineSimilarity } from './geminiEmbeddingService.js';

/**
 * Perform vector search over DocumentChunk collection.
 * 
 * In Production:
 * - Requires MongoDB Atlas Vector Search ($vectorSearch).
 * - Fails if Atlas Vector Search is not configured or fails.
 * 
 * In Development/Testing:
 * - Tries MongoDB Atlas $vectorSearch first.
 * - Falls back to in-memory Cosine Similarity search over candidate chunks if Atlas is not reachable.
 */
export const searchSimilarChunks = async ({
  query,
  vehicleModels = null, // e.g. ['Hyundai Alcazar'] or ['Hyundai Alcazar', 'Hyundai Creta']
  limit = 5,
  minScore = 0.15
}) => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Generate embedding for user query (flagged as isQuery: true for RETRIEVAL_QUERY task type)
  const queryEmbedding = await generateEmbedding(query, { isQuery: true });
  if (!queryEmbedding || queryEmbedding.length === 0) {
    if (isProduction) {
      throw new Error('[VectorSearch Production Error] Failed to generate query embedding for vector search.');
    }
    return [];
  }

  // Normalize vehicleModels to array if single string passed
  const modelFilter = vehicleModels
    ? (Array.isArray(vehicleModels) ? vehicleModels : [vehicleModels])
    : null;

  // 2. Try Atlas Vector Search ($vectorSearch aggregation stage)
  try {
    const pipeline = [
      {
        $vectorSearch: {
          index: process.env.ATLAS_VECTOR_INDEX_NAME || 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: limit * 15,
          limit: limit,
          ...(modelFilter && modelFilter.length > 0 && {
            filter: {
              vehicleModel: { $in: modelFilter }
            }
          })
        }
      },
      {
        $lookup: {
          from: 'documents',
          localField: 'documentId',
          foreignField: '_id',
          as: 'documentDetails'
        }
      },
      {
        $addFields: {
          documentName: {
            $ifNull: [
              { $arrayElemAt: ['$documentDetails.originalName', 0] },
              { $arrayElemAt: ['$documentDetails.fileName', 0] }
            ]
          }
        }
      },
      {
        $project: {
          documentId: 1,
          documentName: 1,
          vehicleModel: 1,
          content: 1,
          pageNumber: 1,
          chunkIndex: 1,
          metadata: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ];

    const atlasResults = await DocumentChunk.aggregate(pipeline);
    if (atlasResults && atlasResults.length > 0) {
      console.log(`[VectorSearch] Retrieved ${atlasResults.length} chunks via MongoDB Atlas $vectorSearch`);
      return atlasResults.filter(r => r.score >= minScore);
    }
  } catch (atlasErr) {
    if (isProduction) {
      throw new Error(
        `[VectorSearch Production Error] MongoDB Atlas $vectorSearch failed: ${atlasErr.message}. Local similarity search fallback is strictly disabled in production.`
      );
    }
    console.log(`[VectorSearch] Atlas $vectorSearch notice: (${atlasErr.message}). Utilizing Cosine Similarity engine for dev/test.`);
  }

  // 3. Development / Test Fallback: Exact Cosine Similarity Retrieval over candidate chunks
  const queryCriteria = {};
  if (modelFilter && modelFilter.length > 0) {
    queryCriteria.vehicleModel = { $in: modelFilter };
  }

  const candidateChunks = await DocumentChunk.find(queryCriteria)
    .populate('documentId', 'originalName fileName')
    .lean();

  if (!candidateChunks || candidateChunks.length === 0) {
    return [];
  }

  // Compute cosine similarity for each chunk
  const scoredChunks = candidateChunks
    .map(chunk => {
      const score = chunk.embedding && chunk.embedding.length > 0
        ? cosineSimilarity(queryEmbedding, chunk.embedding)
        : 0;
      return {
        ...chunk,
        documentName: chunk.documentId?.originalName || chunk.documentName || chunk.metadata?.fileName || 'Official Hyundai Brochure',
        score
      };
    })
    .filter(chunk => chunk.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  console.log(`[VectorSearch] Retrieved ${scoredChunks.length} relevant chunks via vector similarity engine.`);
  return scoredChunks;
};
