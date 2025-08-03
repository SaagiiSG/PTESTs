#!/usr/bin/env node

const https = require('https');

const BASE_URL = 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app';

console.log('🔍 Testing QPay Credentials');
console.log('=' .repeat(50));

// Test 1: Check environment variables endpoint
async function testEnvironmentVariables() {
  console.log('\n1️⃣ Testing environment variables...');
  try {
    const response = await new Promise((resolve, reject) => {
      const url = `${BASE_URL}/api/debug-env`;
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      }).on('error', reject);
    });

    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      console.log('   QPay Environment Variables:');
      console.log(`   - QPAY_CLIENT_ID: ${response.data.QPAY_CLIENT_ID || 'NOT_SET'}`);
      console.log(`   - QPAY_CLIENT_SECRET: ${response.data.QPAY_CLIENT_SECRET || 'NOT_SET'}`);
      console.log(`   - QPAY_BASE_URL: ${response.data.QPAY_BASE_URL || 'NOT_SET'}`);
      console.log(`   - QPAY_INVOICE_CODE: ${response.data.QPAY_INVOICE_CODE || 'NOT_SET'}`);
      
      // Check if credentials look valid
      if (response.data.QPAY_CLIENT_SECRET === 'SET' || response.data.QPAY_CLIENT_SECRET === 'NOT_SET') {
        console.log('   ❌ QPAY_CLIENT_SECRET is not set correctly');
        console.log('   💡 This is why QPay authentication is failing');
      } else {
        console.log('   ✅ QPay credentials appear to be set');
      }
    } else {
      console.log('   ❌ Could not fetch environment variables');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

// Test 2: Test QPay authentication directly
async function testQPayAuthentication() {
  console.log('\n2️⃣ Testing QPay authentication...');
  try {
    const response = await new Promise((resolve, reject) => {
      const url = `${BASE_URL}/api/test-qpay`;
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      }).on('error', reject);
    });

    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      console.log('   ✅ QPay authentication successful');
      console.log('   Response:', response.data);
    } else {
      console.log('   ❌ QPay authentication failed');
      console.log('   Response:', response.data);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

// Test 3: Test invoice creation
async function testInvoiceCreation() {
  console.log('\n3️⃣ Testing invoice creation...');
  try {
    const postData = JSON.stringify({
      amount: 1000,
      description: 'Test payment',
      receiverCode: 'JAVZAN_B',
      invoiceCode: 'TEST_INVOICE'
    });

    const response = await new Promise((resolve, reject) => {
      const url = `${BASE_URL}/api/create-invoice`;
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      console.log('   ✅ Invoice creation successful');
      console.log('   Invoice ID:', response.data.invoice_id);
    } else {
      console.log('   ❌ Invoice creation failed');
      console.log('   Error:', response.data.error || response.data);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

// Main test function
async function runTests() {
  console.log(`🚀 Testing QPay integration for: ${BASE_URL}\n`);
  
  await testEnvironmentVariables();
  await testQPayAuthentication();
  await testInvoiceCreation();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 Summary:');
  console.log('1. Check if environment variables are set correctly');
  console.log('2. Verify QPay authentication works');
  console.log('3. Test invoice creation process');
  
  console.log('\n🔧 If QPAY_CLIENT_SECRET shows "SET":');
  console.log('1. Go to Vercel Dashboard → Settings → Environment Variables');
  console.log('2. Check if QPAY_CLIENT_SECRET is set correctly');
  console.log('3. Make sure it\'s not set to "SET" (placeholder value)');
  console.log('4. Redeploy after updating environment variables');
  
  console.log('\n✅ Testing completed!');
}

runTests().catch(console.error); 