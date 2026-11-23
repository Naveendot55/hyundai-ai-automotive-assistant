import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { generateEmbedding, EMBEDDING_CONFIG } from '../services/geminiEmbeddingService.js';

dotenv.config();

async function reembedAllChunks() {
  console.log('====================================================');
  console.log('  Hyundai AI — Re-Embedding Pipeline');
  console.log('====================================================');
  console.log(`Model: ${EMBEDDING_CONFIG.model}`);
  console.log(`Dimensions: ${EMBEDDING_CONFIG.dimensions}`);
  console.log(`Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/hyundai_ai_db'}`);
  console.log(`Gemini API Key configured: ${Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY')}`);

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyundai_ai_db');
  console.log('[DB] Connected successfully.\n');

  const chunks = await DocumentChunk.find().populate('documentId', 'originalName vehicleModel');
  console.log(`Total chunks to re-embed: ${chunks.length}`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const docName = chunk.documentId?.originalName || chunk.metadata?.fileName || 'Brochure';
    process.stdout.write(`[${i + 1}/${chunks.length}] Embedding ${chunk.vehicleModel} - ${docName} (P.${chunk.pageNumber}, Chunk ${chunk.chunkIndex})... `);

    try {
      const embedding = await generateEmbedding(chunk.content, {
        isQuery: false,
        title: `${chunk.vehicleModel} Brochure Spec`
      });

      if (!embedding || embedding.length !== EMBEDDING_CONFIG.dimensions) {
        throw new Error(`Dimension mismatch: expected ${EMBEDDING_CONFIG.dimensions}, got ${embedding?.length}`);
      }

      chunk.embedding = embedding;
      chunk.metadata = {
        ...chunk.metadata,
        embeddingModel: EMBEDDING_CONFIG.model,
        embeddingDimensions: EMBEDDING_CONFIG.dimensions,
        reembeddedAt: new Date()
      };
      await chunk.save();

      console.log(`✓ OK (${embedding.length}-dim)`);
      successCount++;
    } catch (err) {
      console.log(`❌ ERROR: ${err.message}`);
      errorCount++;
    }

    // Small delay to respect rate limits if calling Gemini API
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log('\n====================================================');
  console.log(`Re-embedding Complete! Success: ${successCount}, Errors: ${errorCount}`);
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(errorCount > 0 ? 1 : 0);
}

reembedAllChunks().catch(err => {
  console.error('Fatal re-embedding error:', err);
  process.exit(1);
});
