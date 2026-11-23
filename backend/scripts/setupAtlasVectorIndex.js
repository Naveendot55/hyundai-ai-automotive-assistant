import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MongoDB Atlas Vector Search Index Definition
 * Collection: documentchunks
 * Index Name: vector_index
 */
const VECTOR_INDEX_DEFINITION = {
  name: process.env.ATLAS_VECTOR_INDEX_NAME || 'vector_index',
  type: 'vectorSearch',
  definition: {
    fields: [
      {
        type: 'vector',
        path: 'embedding',
        numDimensions: parseInt(process.env.EMBEDDING_DIMENSIONS, 10) || 768,
        similarity: 'cosine'
      },
      {
        type: 'filter',
        path: 'vehicleModel'
      }
    ]
  }
};

async function setupAtlasVectorIndex() {
  console.log('====================================================');
  console.log('  MongoDB Atlas Vector Index Configuration & Check');
  console.log('====================================================');

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment or backend/.env');
    process.exit(1);
  }

  console.log(`Target URI: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

  try {
    const conn = await mongoose.connect(uri);
    const db = conn.connection.db;
    const isAtlas = conn.connection.host.includes('mongodb.net');
    console.log(`Connected to: ${conn.connection.host}/${conn.connection.name}`);
    console.log(`Is Atlas Cluster: ${isAtlas}\n`);

    const collection = db.collection('documentchunks');

    console.log('Checking existing search indexes on "documentchunks"...');
    try {
      const searchIndexes = await collection.listSearchIndexes().toArray();
      console.log(`Existing Search Indexes: ${searchIndexes.length}`);
      searchIndexes.forEach(idx => {
        console.log(`  • ${idx.name} (type: ${idx.type || 'search'}, status: ${idx.status || 'READY'})`);
      });

      const existingVectorIndex = searchIndexes.find(idx => idx.name === VECTOR_INDEX_DEFINITION.name);
      if (existingVectorIndex) {
        console.log(`\n✓ Vector search index "${VECTOR_INDEX_DEFINITION.name}" already exists on Atlas.`);
        console.log(`  Status: ${existingVectorIndex.status}`);
      } else if (isAtlas) {
        console.log(`\nCreating vector search index "${VECTOR_INDEX_DEFINITION.name}" on MongoDB Atlas...`);
        const indexName = await collection.createSearchIndex(VECTOR_INDEX_DEFINITION);
        console.log(`✓ Search index creation submitted: "${indexName}". (Atlas typically takes 1-2 minutes to build the index).`);
      } else {
        console.log('\n[Notice] Local MongoDB does not run Atlas Search Indexes natively without Atlas CLI local deployment.');
      }
    } catch (listErr) {
      console.log(`Search Index command notice: ${listErr.message}`);
      if (!isAtlas) {
        console.log('\n[Local Development Mode]: Utilizing exact cosine similarity engine over stored chunks.');
      }
    }

    console.log('\n--- Atlas Vector Search Index Schema Definition (for Atlas UI / CLI) ---');
    console.log(JSON.stringify(VECTOR_INDEX_DEFINITION, null, 2));
    console.log('------------------------------------------------------------------------\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Atlas connection failed:', err.message);
    process.exit(1);
  }
}

setupAtlasVectorIndex().catch(console.error);
