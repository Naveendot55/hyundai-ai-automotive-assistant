import mongoose from 'mongoose';
import { generateEmbedding } from '../services/geminiEmbeddingService.js';
import { searchSimilarChunks } from '../services/vectorSearchService.js';
import { executeRagQuery } from '../services/ragService.js';

async function testProductionEnforcement() {
  console.log('--- Testing Production Environment Strictness ---');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyundai_ai_db');

  const originalNodeEnv = process.env.NODE_ENV;
  const originalApiKey = process.env.GEMINI_API_KEY;

  try {
    // Simulate production environment without API key
    process.env.NODE_ENV = 'production';
    delete process.env.GEMINI_API_KEY;

    // Test 1: Embedding generation in production must reject missing key
    console.log('1. Testing generateEmbedding() in production without key...');
    let threwEmbedding = false;
    try {
      await generateEmbedding('Hyundai Alcazar specifications');
    } catch (err) {
      threwEmbedding = true;
      console.log(`   ✓ Correctly threw in production: "${err.message}"`);
    }
    if (!threwEmbedding) {
      throw new Error('generateEmbedding() should have thrown in production without GEMINI_API_KEY');
    }

    // Test 2: Vector search in production must reject missing key / query embedding failure
    console.log('2. Testing searchSimilarChunks() in production without key...');
    let threwVector = false;
    try {
      await searchSimilarChunks({ query: 'Alcazar engine specifications' });
    } catch (err) {
      threwVector = true;
      console.log(`   ✓ Correctly threw in production: "${err.message}"`);
    }
    if (!threwVector) {
      throw new Error('searchSimilarChunks() should have thrown in production without GEMINI_API_KEY');
    }

    // Test 3: RAG Query in production must reject missing key
    console.log('3. Testing executeRagQuery() in production without key...');
    let threwRag = false;
    try {
      await executeRagQuery({ query: 'Provide Alcazar engine specs' });
    } catch (err) {
      threwRag = true;
      console.log(`   ✓ Correctly threw in production: "${err.message}"`);
    }
    if (!threwRag) {
      throw new Error('executeRagQuery() should have thrown in production without GEMINI_API_KEY');
    }

    console.log('\n--- ALL PRODUCTION ENFORCEMENT CHECKS PASSED (3/3) ---');
  } finally {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalApiKey) process.env.GEMINI_API_KEY = originalApiKey;
    await mongoose.disconnect();
  }
}

testProductionEnforcement().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
