import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import app from '../server.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { createHyundaiSamplePdf } from '../utils/generateSamplePdf.js';

async function runDocumentTests() {
  console.log('--- Starting Document Management & PDF Pipeline Tests ---');
  let server;
  const PORT = 5002;
  const samplePdfPath = path.join(process.cwd(), 'temp_alcazar_sample.pdf');

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyundai_ai_db');
    console.log('[Test Setup] Connected to DB');

    server = app.listen(PORT);
    const BASE_URL = `http://localhost:${PORT}/api`;

    // 1. Create a test user & token
    const testUser = await User.create({
      name: 'Doc Test User',
      email: `doc_tester_${Date.now()}@hyundai.com`,
      password: 'DocPassword123!'
    });
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'DocPassword123!' })
    });
    const { token } = await loginRes.json();

    // 2. Generate a valid multi-page sample brochure PDF for Hyundai Alcazar
    const alcazarPages = [
      `HYUNDAI ALCAZAR SPECIFICATIONS & OVERVIEW
Engine Specifications:
1.5 l Turbo GDi Petrol: Displacement 1482 cc, Max Power 117.5 kW (160 PS) @ 5500 r/min, Max Torque 253 Nm @ 1500-3500 r/min.
1.5 l U2 CRDi Diesel: Displacement 1493 cc, Max Power 85 kW (116 PS) @ 4000 r/min, Max Torque 250 Nm @ 1500-2750 r/min.
Transmission Options: 6-Speed Manual, 7-Speed Dual Clutch Transmission (DCT), 6-Speed Automatic.`,
      `HYUNDAI ALCAZAR SAFETY & COMFORT
Safety Features:
6 Airbags Standard across all variants.
Electronic Stability Control (ESC), Vehicle Stability Management (VSM), Hill Start Assist Control (HAC).
Front and Rear Parking Sensors, Surround View Monitor (SVM), Blind Spot View Monitor.
All 4 Disc Brakes, Tyre Pressure Monitoring System (Highline TPMS).
Comfort & Interior:
Voice enabled Smart Panoramic Sunroof, 2nd row captain seats with wireless charger.
10.25 inch Multi-Display Digital Cluster, Bose Premium 8 Speaker Sound System.`
    ];

    await createHyundaiSamplePdf(samplePdfPath, 'Hyundai Alcazar Brochure', 'Hyundai Alcazar', alcazarPages);
    console.log('1. Generated test Hyundai Alcazar PDF brochure.');

    // 3. Test PDF Upload via multipart form
    console.log('2. Testing PDF Upload endpoint (POST /api/documents/upload?sync=true)...');
    const pdfBuffer = fs.readFileSync(samplePdfPath);
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const form = new FormData();
    form.append('vehicleModel', 'Hyundai Alcazar');
    form.append('brochure', pdfBlob, 'alcazar_sample.pdf');

    const uploadRes = await fetch(`${BASE_URL}/documents/upload?sync=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });

    const uploadData = await uploadRes.json();
    if (uploadRes.status !== 201 || !uploadData.success || !uploadData.document) {
      throw new Error(`Upload failed: ${JSON.stringify(uploadData)}`);
    }

    const docId = uploadData.document._id;
    console.log(`   ✓ Uploaded and processed. Document ID: ${docId}, Status: ${uploadData.document.processingStatus}`);
    if (uploadData.document.processingStatus !== 'Completed') {
      throw new Error(`Expected status Completed, got ${uploadData.document.processingStatus}`);
    }
    if (uploadData.document.chunkCount <= 0) {
      throw new Error(`Expected chunks > 0, got ${uploadData.document.chunkCount}`);
    }
    console.log(`   ✓ Chunks generated: ${uploadData.document.chunkCount}, Pages: ${uploadData.document.pageCount}`);

    // 4. Test GET /api/documents
    console.log('3. Testing GET /api/documents...');
    const listRes = await fetch(`${BASE_URL}/documents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    if (listRes.status !== 200 || !Array.isArray(listData.documents) || listData.count < 1) {
      throw new Error(`Failed to list documents: ${JSON.stringify(listData)}`);
    }
    console.log(`   ✓ Retrieved ${listData.count} documents successfully`);

    // 5. Test GET /api/documents/:id
    console.log(`4. Testing GET /api/documents/${docId}...`);
    const detailRes = await fetch(`${BASE_URL}/documents/${docId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const detailData = await detailRes.json();
    if (detailRes.status !== 200 || detailData.document._id !== docId || !detailData.chunks) {
      throw new Error(`Failed to get document details: ${JSON.stringify(detailData)}`);
    }
    console.log(`   ✓ Retrieved document details with ${detailData.chunks.length} chunks preview`);

    // Verify chunk integrity in DB
    const dbChunks = await DocumentChunk.find({ documentId: docId });
    if (dbChunks.length === 0) {
      throw new Error('Chunks not found in DocumentChunk collection');
    }
    console.log(`   ✓ Verified chunks in DocumentChunk collection: ${dbChunks.length}`);

    // 6. Test Cascading DELETE /api/documents/:id
    console.log(`5. Testing Cascading DELETE /api/documents/${docId}...`);
    const deleteRes = await fetch(`${BASE_URL}/documents/${docId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const deleteData = await deleteRes.json();
    if (deleteRes.status !== 200 || !deleteData.success) {
      throw new Error(`Failed to delete document: ${JSON.stringify(deleteData)}`);
    }
    console.log(`   ✓ Document delete response: ${deleteData.message}`);

    // Verify cascading deletion of chunks
    const remainingChunks = await DocumentChunk.find({ documentId: docId });
    if (remainingChunks.length !== 0) {
      throw new Error(`Cascading chunk delete failed! ${remainingChunks.length} chunks still exist`);
    }
    console.log('   ✓ Verified 0 orphan chunks remaining in database (cascading delete succeeded)');

    // Cleanup test user and temp pdf
    await User.findByIdAndDelete(testUser._id);
    if (fs.existsSync(samplePdfPath)) fs.unlinkSync(samplePdfPath);

    console.log('\n--- ALL DOCUMENT MANAGEMENT & PDF PIPELINE TESTS PASSED (5/5) ---');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exitCode = 1;
  } finally {
    if (fs.existsSync(samplePdfPath)) {
      try { fs.unlinkSync(samplePdfPath); } catch (e) {}
    }
    if (server) server.close();
    await mongoose.disconnect();
    setTimeout(() => process.exit(0), 100);
  }
}

runDocumentTests();
