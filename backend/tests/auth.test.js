import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';

async function runAuthTests() {
  console.log('--- Starting Authentication Module Tests ---');
  let server;
  const PORT = 5001; // use separate port for test
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyundai_ai_db');
    console.log('[Test Setup] Connected to DB');
    
    server = app.listen(PORT);
    const BASE_URL = `http://localhost:${PORT}/api/auth`;
    
    // Clean up test user if exists
    const testEmail = `test_engineer_${Date.now()}@hyundai-ai.com`;
    const testPassword = 'SecurePassword123!';
    
    // Test 1: Register User
    console.log('1. Testing User Registration...');
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Senior Test Engineer',
        email: testEmail,
        password: testPassword
      })
    });
    const regData = await regRes.json();
    if (regRes.status !== 201 || !regData.token || !regData.user || regData.user.password) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    console.log('   ✓ User registered successfully with JWT token');
    const userToken = regData.token;
    
    // Test 2: Duplicate Registration
    console.log('2. Testing Duplicate Email Detection...');
    const dupRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Engineer',
        email: testEmail,
        password: testPassword
      })
    });
    if (dupRes.status !== 400) {
      throw new Error(`Expected 400 on duplicate email, got ${dupRes.status}`);
    }
    console.log('   ✓ Duplicate email properly rejected with 400');

    // Test 3: Login User with Valid Credentials
    console.log('3. Testing User Login with Valid Credentials...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    console.log('   ✓ User logged in successfully with valid token');

    // Test 4: Login User with Invalid Password
    console.log('4. Testing Login with Invalid Password...');
    const badLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword999!'
      })
    });
    if (badLoginRes.status !== 401) {
      throw new Error(`Expected 401 on bad password, got ${badLoginRes.status}`);
    }
    console.log('   ✓ Invalid credentials rejected with 401');

    // Test 5: Protected Route GET /me with Bearer Token
    console.log('5. Testing Protected Route /me with Token...');
    const meRes = await fetch(`${BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.user.email !== testEmail) {
      throw new Error(`Protected route /me failed: ${JSON.stringify(meData)}`);
    }
    console.log('   ✓ Protected route verified user identity correctly');

    // Test 6: Protected Route GET /me without Token
    console.log('6. Testing Protected Route /me without Token...');
    const noTokenRes = await fetch(`${BASE_URL}/me`);
    if (noTokenRes.status !== 401) {
      throw new Error(`Expected 401 without token, got ${noTokenRes.status}`);
    }
    console.log('   ✓ Unauthorized access blocked with 401');

    // Test 7: Protected Route GET /me with Invalid Token
    console.log('7. Testing Protected Route /me with Invalid Token...');
    const badTokenRes = await fetch(`${BASE_URL}/me`, {
      headers: { 'Authorization': 'Bearer invalid.jwt.signature' }
    });
    if (badTokenRes.status !== 401) {
      throw new Error(`Expected 401 with invalid token, got ${badTokenRes.status}`);
    }
    console.log('   ✓ Tampered/invalid token blocked with 401');

    // Cleanup test user
    await User.deleteOne({ email: testEmail });
    console.log('   ✓ Test user cleaned up');

    console.log('\n--- ALL AUTHENTICATION TESTS PASSED (7/7) ---');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit();
  }
}

runAuthTests();
