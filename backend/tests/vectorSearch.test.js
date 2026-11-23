import mongoose from 'mongoose';
import { generateEmbedding, cosineSimilarity } from '../services/geminiEmbeddingService.js';
import { searchSimilarChunks } from '../services/vectorSearchService.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';

async function runVectorSearchTests() {
  console.log('--- Starting Gemini Embeddings & Vector Search Tests ---');

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyundai_ai_db');
    console.log('[Test Setup] Connected to DB');

    // 1. Test Embedding Generation
    console.log('1. Testing Embedding Generation (768 dimensions)...');
    const embedding1 = await generateEmbedding('Hyundai Alcazar 1.5 Turbo GDi Petrol engine specifications');
    if (!Array.isArray(embedding1) || embedding1.length !== 768) {
      throw new Error(`Expected 768-dim array, got ${embedding1?.length}`);
    }
    console.log(`   ✓ Successfully generated ${embedding1.length}-dimensional embedding vector`);

    // 2. Test Cosine Similarity Math
    console.log('2. Testing Cosine Similarity computation...');
    const embedding2 = await generateEmbedding('Alcazar engine power 160 PS and torque 253 Nm');
    const embedding3 = await generateEmbedding('Interior ambient lighting and leather upholstery');

    const simHigh = cosineSimilarity(embedding1, embedding2);
    const simLow = cosineSimilarity(embedding1, embedding3);

    console.log(`   Similarity (engine query vs engine spec): ${simHigh.toFixed(4)}`);
    console.log(`   Similarity (engine query vs interior spec): ${simLow.toFixed(4)}`);

    if (simHigh <= simLow) {
      throw new Error(`Expected higher similarity for semantically related text (${simHigh} <= ${simLow})`);
    }
    console.log('   ✓ Semantic similarity discrimination verified');

    // 3. Test Ingesting Chunks with Embeddings & Querying via searchSimilarChunks
    console.log('3. Testing Chunk Vector Ingestion and Retrieval...');
    const testDoc = await Document.create({
      fileName: 'test_alcazar.pdf',
      originalName: 'Hyundai_Alcazar_2024.pdf',
      vehicleModel: 'Hyundai Alcazar',
      fileUrl: '/uploads/test.pdf',
      storagePath: '/tmp/test.pdf',
      fileSize: 1024,
      uploadedBy: new mongoose.Types.ObjectId(),
      processingStatus: 'Completed'
    });

    const chunkA = await DocumentChunk.create({
      documentId: testDoc._id,
      vehicleModel: 'Hyundai Alcazar',
      content: 'The Hyundai Alcazar features a 1.5 l Turbo GDi Petrol engine delivering 160 PS power and 253 Nm torque with 7-speed DCT.',
      pageNumber: 1,
      chunkIndex: 0,
      embedding: embedding1,
      metadata: { fileName: 'Hyundai_Alcazar_2024.pdf' }
    });

    const chunkB = await DocumentChunk.create({
      documentId: testDoc._id,
      vehicleModel: 'Hyundai Alcazar',
      content: 'Standard safety features in Hyundai Alcazar include 6 airbags, all 4 disc brakes, ESC, VSM, and Tyre Pressure Monitoring System.',
      pageNumber: 2,
      chunkIndex: 1,
      embedding: await generateEmbedding('Hyundai Alcazar 6 airbags standard and safety systems'),
      metadata: { fileName: 'Hyundai_Alcazar_2024.pdf' }
    });

    // Test Search
    const searchResults = await searchSimilarChunks({
      query: 'What is the power and engine capacity of Hyundai Alcazar?',
      vehicleModels: ['Hyundai Alcazar'],
      limit: 2,
      minScore: 0.1
    });

    if (searchResults.length === 0 || searchResults[0].vehicleModel !== 'Hyundai Alcazar') {
      throw new Error(`Vector search failed to retrieve Alcazar chunk: ${JSON.stringify(searchResults)}`);
    }
    console.log(`   ✓ Retrieved top relevant chunk (score: ${searchResults[0].score}): "${searchResults[0].content.substring(0, 70)}..."`);

    // Clean up
    await Document.findByIdAndDelete(testDoc._id);
    await DocumentChunk.deleteMany({ documentId: testDoc._id });
    console.log('   ✓ Test documents and chunks cleaned up');

    console.log('\n--- ALL VECTOR SEARCH TESTS PASSED (3/3) ---');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    setTimeout(() => process.exit(process.exitCode || 0), 100);
  }
}

runVectorSearchTests();
