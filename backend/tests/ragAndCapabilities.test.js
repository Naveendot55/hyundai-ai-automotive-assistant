import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import app from '../server.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import ChatHistory from '../models/ChatHistory.js';
import { createHyundaiSamplePdf } from '../utils/generateSamplePdf.js';
import { processDocument } from '../services/documentProcessor.js';

async function runRAGCapabilityTests() {
  console.log('--- Starting RAG & 4 Core AI Automotive Capabilities Tests ---');
  let server;
  const PORT = 5003;
  const createdFiles = [];

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyundai_ai_db');
    console.log('[Test Setup] Connected to DB');

    server = app.listen(PORT);
    const BASE_URL = `http://localhost:${PORT}/api`;

    // 1. Auth setup
    const testUser = await User.create({
      name: 'RAG Lead Tester',
      email: `rag_tester_${Date.now()}@hyundai.com`,
      password: 'RAGPassword123!'
    });
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'RAGPassword123!' })
    });
    const { token } = await loginRes.json();

    // 2. Ingest Sample Hyundai Brochures (Alcazar, Creta, i20, Aura)
    console.log('1. Ingesting Real Hyundai Brochures for 4 Models...');

    const brochures = [
      {
        model: 'Hyundai Alcazar',
        filename: 'Hyundai_Alcazar_Official.pdf',
        pages: [
          `HYUNDAI ALCAZAR ENGINE & SPECIFICATIONS
1.5 l Turbo GDi Petrol Engine: 1482 cc displacement, Maximum Power of 117.5 kW (160 PS) @ 5 500 r/min and Peak Torque of 253 Nm @ 1 500 - 3 500 r/min.
1.5 l U2 CRDi Diesel Engine: 1493 cc displacement, Maximum Power of 85 kW (116 PS) @ 4 000 r/min and Peak Torque of 250 Nm @ 1 500 - 2 750 r/min.
Transmission Options: 6-speed manual, 7-speed Dual Clutch Transmission (DCT), and 6-speed automatic.
Suspension: Front McPherson strut with coil spring, Rear coupled torsion beam axle.`,
          `HYUNDAI ALCAZAR SAFETY, COMFORT & VARIANTS
Safety Features: 6 Airbags standard across all trims, Electronic Stability Control (ESC), Vehicle Stability Management (VSM), Hill Start Assist Control (HAC).
Interior & Technology: 10.25 inch HD touchscreen with navigation, Bose premium 8-speaker sound system, Voice-enabled Smart Panoramic Sunroof, 2nd row captain seats with console wireless charger.
Variants Lineup: Prestige (entry), Platinum (mid-level with 10.25 display and panoramic sunroof), Signature (top-tier with ADAS, ventilated front seats, and 360-degree camera).`
        ]
      },
      {
        model: 'Hyundai Creta',
        filename: 'Hyundai_Creta_Official.pdf',
        pages: [
          `HYUNDAI CRETA OVERVIEW & SPECIFICATIONS
Hyundai Creta is an iconic 5-seater SUV designed for urban driving and highway cruising.
Powertrains: 1.5 l MPi Petrol (115 PS / 143.8 Nm), 1.5 l U2 CRDi Diesel (116 PS / 250 Nm), and 1.5 l Turbo GDi Petrol (160 PS / 253 Nm).
Safety: Standard 6 Airbags, All-wheel disc brakes, Electronic Stability Control (ESC), Hill Start Assist, ISOFIX child seat anchors.
Dimensions: 5-passenger seating capacity, 4330 mm overall length, 1790 mm width, 1635 mm height, 433 litre luggage boot.`
        ]
      },
      {
        model: 'Hyundai i20',
        filename: 'Hyundai_i20_Official.pdf',
        pages: [
          `HYUNDAI i20 PREMIUM HATCHBACK
Character: Sporty premium hatchback built on a wide track platform with aerodynamic stance.
Engine: 1.2 l Kappa Petrol delivering 83 PS (Manual) / 88 PS (IVT) and 114.7 Nm torque.
Cabin & Tech: 10.25 inch infotainment touchscreen, digital cluster with TFT MID, Bose 7-speaker sound system, ambient lighting.
Strengths: Agile city manoeuvrability, compact parking footprint, youthful styling, refined hatchback cabin.`
        ]
      },
      {
        model: 'Hyundai Aura',
        filename: 'Hyundai_Aura_Official.pdf',
        pages: [
          `HYUNDAI AURA COMPACT SEDAN
Character: Elegant and spacious compact family sedan with a distinct 3-box design and generous trunk.
Engine & Efficiency: 1.2 l Bi-Fuel (Petrol + CNG) and 1.2 l Kappa Petrol engine producing 83 PS power and 113.8 Nm torque.
Practicality: Massive 402 litre dedicated boot space for family luggage, comfortable rear legroom, rear AC vents.
Strengths: Exceptional long-distance highway comfort for 5 family members, superior luggage trunk capacity, high fuel economy.`
        ]
      }
    ];

    const docIds = [];
    for (const b of brochures) {
      const pdfPath = path.join(process.cwd(), `temp_${b.filename}`);
      createdFiles.push(pdfPath);
      await createHyundaiSamplePdf(pdfPath, b.model, b.model, b.pages);

      const doc = await Document.create({
        fileName: b.filename,
        originalName: b.filename,
        vehicleModel: b.model,
        fileUrl: `/uploads/${b.filename}`,
        storagePath: pdfPath,
        fileSize: 2048,
        uploadedBy: testUser._id,
        processingStatus: 'Uploaded'
      });

      await processDocument(doc._id);
      docIds.push(doc._id);
      console.log(`   ✓ Ingested and indexed: ${b.model}`);
    }

    // 3. Test CAPABILITY A: Hyundai Alcazar Features
    console.log('\n2. Testing CAPABILITY A: Hyundai Alcazar Features...');
    const capARes = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'Tell me about Hyundai Alcazar engine specifications, safety features, and comfort features.'
      })
    });
    const capAData = await capARes.json();
    if (capARes.status !== 200 || !capAData.success || capAData.capability !== 'alcazar_features') {
      throw new Error(`Capability A failed: ${JSON.stringify(capAData)}`);
    }
    if (capAData.response.sources.length === 0) {
      throw new Error('Capability A returned no source citations');
    }
    console.log(`   ✓ Capability A response verified (Sources cited: ${capAData.response.sources.length})`);
    console.log(`   Excerpt: ${capAData.response.content.substring(0, 120)}...`);

    // 4. Test CAPABILITY B: Alcazar vs Creta Comparison
    console.log('\n3. Testing CAPABILITY B: Alcazar vs Creta Comparison...');
    const capBRes = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'Compare Hyundai Alcazar vs Hyundai Creta in terms of seating capacity, engine, and safety.'
      })
    });
    const capBData = await capBRes.json();
    if (capBRes.status !== 200 || !capBData.success || capBData.capability !== 'alcazar_creta_compare') {
      throw new Error(`Capability B failed: ${JSON.stringify(capBData)}`);
    }
    console.log(`   ✓ Capability B comparison matrix verified (Sources cited: ${capBData.response.sources.length})`);

    // 5. Test CAPABILITY C: Alcazar Variant Comparison
    console.log('\n4. Testing CAPABILITY C: Alcazar Variant Comparison...');
    const capCRes = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'What are the different variants of Hyundai Alcazar like Prestige, Platinum, and Signature?'
      })
    });
    const capCData = await capCRes.json();
    if (capCRes.status !== 200 || !capCData.success || capCData.capability !== 'alcazar_variants') {
      throw new Error(`Capability C failed: ${JSON.stringify(capCData)}`);
    }
    console.log(`   ✓ Capability C variant comparison verified (Sources cited: ${capCData.response.sources.length})`);

    // 6. Test CAPABILITY D: i20 vs Aura Recommendations
    console.log('\n5. Testing CAPABILITY D: i20 vs Aura Recommendations...');
    const capDRes = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'I need a car for daily city driving and occasional family trips with large luggage. Should I buy Hyundai i20 or Hyundai Aura?'
      })
    });
    const capDData = await capDRes.json();
    if (capDRes.status !== 200 || !capDData.success || capDData.capability !== 'i20_aura_recommend') {
      throw new Error(`Capability D failed: ${JSON.stringify(capDData)}`);
    }
    console.log(`   ✓ Capability D recommendation verified (Sources cited: ${capDData.response.sources.length})`);

    // 7. Test Chat History Persistence
    console.log('\n6. Testing Chat History Persistence...');
    const historyRes = await fetch(`${BASE_URL}/chat/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const historyData = await historyRes.json();
    if (historyRes.status !== 200 || !historyData.conversations || historyData.conversations.length === 0) {
      throw new Error(`Chat history retrieval failed: ${JSON.stringify(historyData)}`);
    }
    console.log(`   ✓ Chat history verified with ${historyData.conversations.length} saved conversations`);

    // Clean up
    for (const dId of docIds) {
      await Document.findByIdAndDelete(dId);
      await DocumentChunk.deleteMany({ documentId: dId });
    }
    await ChatHistory.deleteMany({ userId: testUser._id });
    await User.findByIdAndDelete(testUser._id);
    for (const f of createdFiles) {
      if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch (e) {}
    }
    console.log('   ✓ Test data and files cleaned up');

    console.log('\n--- ALL RAG & 4 AUTOMOTIVE CAPABILITY TESTS PASSED (6/6) ---');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exitCode = 1;
  } finally {
    for (const f of createdFiles) {
      if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch (e) {}
    }
    if (server) server.close();
    await mongoose.disconnect();
    setTimeout(() => process.exit(process.exitCode || 0), 100);
  }
}

runRAGCapabilityTests();
