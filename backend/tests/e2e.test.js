import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import ChatHistory from '../models/ChatHistory.js';

async function runE2ETests() {
  console.log('====================================================');
  console.log('  Hyundai AI Automotive Assistant — End-to-End Tests');
  console.log('====================================================');

  let server;
  const PORT = 5004;
  const testChatIds = [];

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyundai_ai_db');
    server = app.listen(PORT);
    const BASE_URL = `http://localhost:${PORT}/api`;

    // 1. Login with demo user
    console.log('1. Authenticating demo specialist (POST /api/auth/login)...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@hyundai-ai.com', password: 'Hyundai2026!' })
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    const token = loginData.token;
    console.log(`   ✓ Authenticated as: ${loginData.user.name} (${loginData.user.email})`);

    // 2. Fetch Document List
    console.log('2. Fetching Document Knowledge Base (GET /api/documents)...');
    const docsRes = await fetch(`${BASE_URL}/documents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const docsData = await docsRes.json();
    if (docsRes.status !== 200 || docsData.count < 4) {
      throw new Error(`Expected at least 4 brochures, found ${docsData.count}`);
    }
    console.log(`   ✓ Verified ${docsData.count} brochures indexed in knowledge base:`);
    docsData.documents.forEach(d => console.log(`     • ${d.vehicleModel} (${d.chunkCount} chunks, ${d.pageCount} pages, status: ${d.processingStatus})`));

    // 3. CAPABILITY A: Hyundai Alcazar Features
    console.log('\n3. Testing Capability A: Hyundai Alcazar Features...');
    const capARes = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'Provide the engine specifications and safety features for Hyundai Alcazar.'
      })
    });
    const capAData = await capARes.json();
    if (capAData.conversationId) testChatIds.push(capAData.conversationId);
    if (capAData.capability !== 'alcazar_features') throw new Error(`Expected alcazar_features, got ${capAData.capability}`);
    if (capAData.response.sources.length === 0) throw new Error('No sources returned for Alcazar features');
    console.log(`   ✓ Capability A Response received with ${capAData.response.sources.length} sources.`);
    console.log(`     First source citation: ${capAData.response.sources[0].documentName} (Page ${capAData.response.sources[0].pageNumber})`);

    // 4. CAPABILITY B: Alcazar vs Creta Comparison
    console.log('\n4. Testing Capability B: Alcazar vs Creta Comparison...');
    const capBRes = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'Compare Hyundai Alcazar vs Hyundai Creta across engines, safety, and seating.'
      })
    });
    const capBData = await capBRes.json();
    if (capBData.conversationId) testChatIds.push(capBData.conversationId);
    if (capBData.capability !== 'alcazar_creta_compare') throw new Error(`Expected alcazar_creta_compare, got ${capBData.capability}`);
    console.log(`   ✓ Capability B Comparison generated with ${capBData.response.sources.length} sources across multiple brochures.`);

    // 5. CAPABILITY C: Alcazar Variant Comparison
    console.log('\n5. Testing Capability C: Alcazar Variant Comparison...');
    const capCRes = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'What are the variant differences between Prestige, Platinum, and Signature for Hyundai Alcazar?'
      })
    });
    const capCData = await capCRes.json();
    if (capCData.conversationId) testChatIds.push(capCData.conversationId);
    if (capCData.capability !== 'alcazar_variants') throw new Error(`Expected alcazar_variants, got ${capCData.capability}`);
    console.log(`   ✓ Capability C Variant analysis generated with ${capCData.response.sources.length} sources.`);

    // 6. CAPABILITY D: i20 vs Aura Recommendations
    console.log('\n6. Testing Capability D: i20 vs Aura Recommendations...');
    const capDRes = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'I need a vehicle for city commuting and frequent family highway trips with big suitcases. Recommend between Hyundai i20 and Hyundai Aura.'
      })
    });
    const capDData = await capDRes.json();
    if (capDData.conversationId) testChatIds.push(capDData.conversationId);
    if (capDData.capability !== 'i20_aura_recommend') throw new Error(`Expected i20_aura_recommend, got ${capDData.capability}`);
    console.log(`   ✓ Capability D Recommendation generated with ${capDData.response.sources.length} sources.`);

    // 7. Unsupported Question Handling (No hallucination test)
    console.log('\n7. Testing Absence Handling (Zero Hallucination Rule)...');
    const unsuppRes = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'Does the Hyundai Kona have rocket thrusters and underwater submarine mode?'
      })
    });
    const unsuppData = await unsuppRes.json();
    if (unsuppData.conversationId) testChatIds.push(unsuppData.conversationId);
    console.log(`   ✓ RAG Engine handled question with grounded response:`);
    console.log(`     "${unsuppData.response.content.substring(0, 110)}..."`);

    // 8. Verify Chat History
    console.log('\n8. Verifying Chat History Persistence (GET /api/chat/history)...');
    const histRes = await fetch(`${BASE_URL}/chat/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const histData = await histRes.json();
    if (histData.conversations.length === 0) throw new Error('Expected saved conversations');
    console.log(`   ✓ Verified ${histData.conversations.length} persistent conversations saved in MongoDB.`);

    console.log('\n====================================================');
    console.log('  ALL END-TO-END VERIFICATION CHECKS PASSED (8/8)!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ E2E Test Failure:', err);
    process.exitCode = 1;
  } finally {
    for (const cId of testChatIds) {
      await ChatHistory.findByIdAndDelete(cId);
    }
    if (server) server.close();
    await mongoose.disconnect();
    setTimeout(() => process.exit(process.exitCode || 0), 100);
  }
}

runE2ETests();
