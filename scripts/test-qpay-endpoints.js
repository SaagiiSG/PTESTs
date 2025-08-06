const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test different QPay endpoints to find the correct one
async function testQPayEndpoints() {
  try {
    console.log('🧪 Testing Different QPay Endpoints...\n');
    
    if (!process.env.QPAY_CLIENT_ID || !process.env.QPAY_CLIENT_SECRET) {
      console.log('❌ QPay credentials not found');
      return;
    }
    
    const baseUrl = process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2';
    const username = process.env.QPAY_CLIENT_ID;
    const password = process.env.QPAY_CLIENT_SECRET;
    
    // Get access token
    console.log('🔍 Getting access token...');
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    const authResponse = await axios.post(`${baseUrl}/auth/token`, {
      grant_type: 'client_credentials'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      }
    });
    
    const token = authResponse.data.access_token;
    console.log('✅ Authentication successful\n');
    
    const testInvoiceId = '071f45e6-b6e6-4562-a470-8457269d251a';
    const paymentCheckData = {
      object_type: 'INVOICE',
      object_id: testInvoiceId,
      offset: {
        page_number: 1,
        page_limit: 100
      }
    };
    
    // Test different endpoints
    const endpoints = [
      '/v2/payment/check',
      '/payment/check',
      '/v2/payment/list',
      '/payment/list',
      '/payment/status',
      '/v2/payment/status',
      '/invoice/payment/check',
      '/v2/invoice/payment/check'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`🔍 Testing endpoint: ${endpoint}`);
      try {
        const response = await axios.post(`${baseUrl}${endpoint}`, paymentCheckData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        });
        
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);
        
        if (response.headers['content-type']?.includes('application/json')) {
          console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
        } else {
          console.log(`Response: ${response.data.substring(0, 200)}...`);
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint} - Status: ${error.response?.status || 'Network Error'}`);
        if (error.response?.data) {
          console.log(`Error: ${JSON.stringify(error.response.data)}`);
        }
      }
      console.log('');
    }
    
    // Test GET endpoints
    console.log('🔍 Testing GET endpoints...');
    const getEndpoints = [
      `/invoice/${testInvoiceId}`,
      `/v2/invoice/${testInvoiceId}`,
      `/payment/invoice/${testInvoiceId}`,
      `/v2/payment/invoice/${testInvoiceId}`
    ];
    
    for (const endpoint of getEndpoints) {
      console.log(`🔍 Testing GET endpoint: ${endpoint}`);
      try {
        const response = await axios.get(`${baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        });
        
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);
        
        if (response.headers['content-type']?.includes('application/json')) {
          console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
        } else {
          console.log(`Response: ${response.data.substring(0, 200)}...`);
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint} - Status: ${error.response?.status || 'Network Error'}`);
        if (error.response?.data) {
          console.log(`Error: ${JSON.stringify(error.response.data)}`);
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test with a real invoice ID
async function testWithRealInvoice() {
  try {
    console.log('\n🔍 Testing with Real Invoice...');
    
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
  console.log('🚀 Starting QPay Endpoint Discovery...\n');
  
  await testQPayEndpoints();
  
  // Uncomment to test with a real invoice
  // await testWithRealInvoice();
  
  console.log('\n✅ Endpoint discovery completed!');
}

runTests().catch(console.error); 