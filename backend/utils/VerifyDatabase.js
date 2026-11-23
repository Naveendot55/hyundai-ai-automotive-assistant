import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dns from 'dns';

// Ensure DNS SRV lookup on Windows environments
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) { }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('[Error] MONGODB_URI is not set in backend/.env');
    process.exit(1);
}

// Redact credentials from reporting
const sanitizedTarget = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
const isAtlas = uri.includes('mongodb.net') || uri.startsWith('mongodb+srv://');

async function runDatabaseInspection() {
    console.log('====================================================');
    console.log('     Hyundai AI Assistant — Database Inspection     ');
    console.log('====================================================');
    console.log(`Connection Target: ${sanitizedTarget}`);
    console.log(`Cluster Type: ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB Instance'}`);

    try {
        const conn = await mongoose.connect(uri, {
            dbName: 'hyundai_ai_db',
            serverSelectionTimeoutMS: 10000
        });

        const db = conn.connection.db;
        const dbName = conn.connection.name;
        const host = conn.connection.host;

        console.log(`\nConnection Status: [CONNECTED]`);
        console.log(`Connected Host: ${host}`);
        console.log(`Active Database Name: "${dbName}"`);
        console.log(`Target Database Verification: ${dbName === 'hyundai_ai_db' ? '✓ MATCHES intended database "hyundai_ai_db"' : '✗ Database mismatch'}`);

        try {
            const adminDb = conn.connection.db.admin();
            const dbsList = await adminDb.listDatabases();
            console.log(`\nAvailable Databases on Cluster (${dbsList.databases.length}):`);
            dbsList.databases.forEach(d => {
                console.log(`  • ${d.name} (${(d.sizeOnDisk / 1024).toFixed(1)} KB)`);
            });
        } catch (e) {
            console.log(`\n(Notice on listDatabases: ${e.message})`);
        }

        const collections = await db.listCollections().toArray();
        console.log(`\nCollections in "${dbName}" (${collections.length}):`);

        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`  • ${col.name}: ${count} document(s)`);
        }

        console.log('\n----------------------------------------------------');
        console.log(`Documents Collection Inspection ("${dbName}.documents"):`);
        const docCol = db.collection('documents');
        const docCount = await docCol.countDocuments();
        console.log(`Total Brochures Uploaded: ${docCount}`);

        if (docCount > 0) {
            const docs = await docCol.find({}).toArray();
            docs.forEach((doc, idx) => {
                console.log(`  [${idx + 1}] Vehicle: ${doc.vehicleModel} | File: ${doc.originalName || doc.fileName} | Status: ${doc.processingStatus} | Chunks: ${doc.chunkCount} | Pages: ${doc.pageCount || 'N/A'}`);
            });
        }

        console.log('\n----------------------------------------------------');
        console.log(`Document Chunks & Vector Inspection ("${dbName}.documentchunks"):`);
        const chunkCol = db.collection('documentchunks');
        const chunkCount = await chunkCol.countDocuments();
        console.log(`Total Knowledge Chunks: ${chunkCount}`);

        if (chunkCount > 0) {
            const models = await chunkCol.distinct('vehicleModel');
            console.log(`Vehicle Models in Chunks: ${JSON.stringify(models)}`);

            const sampleChunk = await chunkCol.findOne({ embedding: { $exists: true } });

            if (sampleChunk?.embedding) {
                const dim = sampleChunk.embedding.length;
                const is768 = dim === 768;
                const zeroElements = sampleChunk.embedding.filter(v => v === 0).length;

                console.log('\nVector Embedding Sample:');
                console.log(`  • Model: ${sampleChunk.vehicleModel} (Page ${sampleChunk.pageNumber})`);
                console.log(`  • Dimensions: ${dim} ${is768 ? '✓ (768 Dimensions Verified)' : '✗ (Mismatch)'}`);
                console.log(`  • Density: ${dim - zeroElements}/${dim} non-zero floats`);
                console.log(`  • Sample Vector Slice (first 4): [${sampleChunk.embedding.slice(0, 4).map(v => Number(v).toFixed(5)).join(', ')}, ...]`);
                console.log('  • Model Metadata:', sampleChunk.metadata);
            } else {
                console.log('  Notice: Chunks exist, but sample chunk has no embedding field.');
            }
        }

        console.log('\n----------------------------------------------------');
        console.log('Atlas Search Indexes on "documentchunks":');

        try {
            const searchIndexes = await chunkCol.listSearchIndexes().toArray();
            console.log(`Configured Search Indexes: ${searchIndexes.length}`);

            searchIndexes.forEach(idx => {
                console.log(`  • Index "${idx.name}" | Type: ${idx.type || 'search'} | Status: ${idx.status || 'READY'}`);
            });
        } catch (idxErr) {
            console.log(`  Notice on search index listing: ${idxErr.message}`);
        }

        await mongoose.disconnect();

        console.log('\n====================================================');
        console.log('✓ Inspection finished successfully (Read-only).');
        console.log('====================================================');

    } catch (err) {
        console.error('\n[FAIL] Connection/Inspection Error:');
        console.error(`- Error: ${err.message}`);
        await mongoose.disconnect().catch(() => { });
        process.exitCode = 1;
    }
}

runDatabaseInspection();