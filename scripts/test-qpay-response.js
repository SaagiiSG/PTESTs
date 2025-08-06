const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test QPay API response parsing
async function testQPayResponse() {
  try {
    console.log('🧪 Testing QPay API Response Parsing...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('QPAY_BASE_URL:', process.env.QPAY_BASE_URL);
    console.log('QPAY_CLIENT_ID:', process.env.QPAY_CLIENT_ID ? 'SET' : 'NOT_SET');
    console.log('QPAY_CLIENT_SECRET:', process.env.QPAY_CLIENT_SECRET ? 'SET' : 'NOT_SET');
    console.log('');
    
    if (!process.env.QPAY_CLIENT_ID || !process.env.QPAY_CLIENT_SECRET) {
      console.log('❌ QPay credentials not found. Please set QPAY_CLIENT_ID and QPAY_CLIENT_SECRET');
      return;
    }
    
    const baseUrl = process.env.QPAY_BASE_URL || 'https://merchant-sandbox.qpay.mn/v2';
    const username = process.env.QPAY_CLIENT_ID;
    const password = process.env.QPAY_CLIENT_SECRET;
    
    console.log('🔍 Step 1: Testing Authentication...');
    
    // Get access token
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    const authResponse = await axios.post(`${baseUrl}/auth/token`, {
      grant_type: 'client_credentials'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      }
    });
    
    console.log('✅ Authentication successful');
    console.log('Access token:', authResponse.data.access_token ? '***' : 'NOT_SET');
    console.log('Token type:', authResponse.data.token_type);
    console.log('Expires in:', authResponse.data.expires_in);
    console.log('');
    
    // Test payment check with a sample invoice
    console.log('🔍 Step 2: Testing Payment Check...');
    const testInvoiceId = '071f45e6-b6e6-4562-a470-8457269d251a'; // Example from QPay docs
    
    const paymentCheckData = {
      object_type: 'INVOICE',
      object_id: testInvoiceId,
      offset: {
        page_number: 1,
        page_limit: 100
      }
    };
    
    console.log('Payment check data:', JSON.stringify(paymentCheckData, null, 2));
    console.log('');
    
    // Test v2 endpoint
    console.log('🔍 Step 2.1: Testing /v2/payment/check endpoint...');
    try {
      const v2Response = await axios.post(`${baseUrl}/v2/payment/check`, paymentCheckData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authResponse.data.access_token}`
        }
      });
      
      console.log('✅ v2/payment/check Response Status:', v2Response.status);
      console.log('Response Headers:', v2Response.headers);
      console.log('Response Data:', JSON.stringify(v2Response.data, null, 2));
      
    } catch (error) {
      console.error('❌ v2/payment/check failed:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Headers:', error.response?.headers);
      console.error('Response Text:', error.response?.data);
    }
    
    console.log('');
    
    // Test original endpoint
    console.log('🔍 Step 2.2: Testing /payment/list endpoint...');
    try {
      const listResponse = await axios.post(`${baseUrl}/payment/list`, paymentCheckData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authResponse.data.access_token}`
        }
      });
      
      console.log('✅ /payment/list Response Status:', listResponse.status);
      console.log('Response Headers:', listResponse.headers);
      console.log('Response Data:', JSON.stringify(listResponse.data, null, 2));
      
    } catch (error) {
      console.error('❌ /payment/list failed:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Headers:', error.response?.headers);
      console.error('Response Text:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test with a real invoice ID
async function testWithRealInvoice() {
  try {
    console.log('\n🔍 Step 3: Testing with Real Invoice...');
    
    // Replace with a real invoice ID from your database
    const realInvoiceId = 'YOUR_REAL_INVOICE_ID_HERE';
    
    if (realInvoiceId === 'YOUR_REAL_INVOICE_ID_HERE') {
      console.log('⚠️ Please replace with a real invoice ID from your database');
      return;
    }
    
    console.log(`Testing with real invoice ID: ${realInvoiceId}`);
    
    // Test your local API
    const localResponse = await axios.post('http://localhost:3000/api/qpay/payment/check', {
      invoiceId: realInvoiceId
    });
    
    console.log('✅ Local API Response:', JSON.stringify(localResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Real invoice test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting QPay Response Test...\n');
  
  await testQPayResponse();
  
  // Uncomment to test with a real invoice
  // await testWithRealInvoice();
  
  console.log('\n✅ Tests completed!');
}

runTests().catch(console.error); 