const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Debug QPay payment check issues
async function debugQPayPaymentCheck() {
  try {
    console.log('🔍 Debugging QPay Payment Check Issues...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables Check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('QPAY_BASE_URL:', process.env.QPAY_BASE_URL);
    console.log('QPAY_CLIENT_ID:', process.env.QPAY_CLIENT_ID ? 'SET' : 'NOT_SET');
    console.log('QPAY_CLIENT_SECRET:', process.env.QPAY_CLIENT_SECRET ? 'SET' : 'NOT_SET');
    console.log('');
    
    // Test with a real invoice ID (you should replace this with an actual invoice ID from your system)
    const testInvoiceId = '071f45e6-b6e6-4562-a470-8457269d251a'; // Example from QPay docs
    
    console.log(`📋 Testing with invoice ID: ${testInvoiceId}`);
    
    // Test 1: Direct QPay API call (if credentials are available)
    if (process.env.QPAY_CLIENT_ID && process.env.QPAY_CLIENT_SECRET) {
      console.log('\n🔍 Test 1: Direct QPay API Authentication...');
      try {
        const baseUrl = process.env.QPAY_BASE_URL || 'https://merchant-sandbox.qpay.mn/v2';
        const username = process.env.QPAY_CLIENT_ID;
        const password = process.env.QPAY_CLIENT_SECRET;
        
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
        
        // Test payment check
        console.log('\n🔍 Test 1.1: Direct QPay Payment Check...');
        const paymentCheckResponse = await axios.post(`${baseUrl}/v2/payment/check`, {
          object_type: 'INVOICE',
          object_id: testInvoiceId,
          offset: {
            page_number: 1,
            page_limit: 100
          }
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authResponse.data.access_token}`
          }
        });
        
        console.log('✅ Direct QPay API Response:', JSON.stringify(paymentCheckResponse.data, null, 2));
        
      } catch (error) {
        console.error('❌ Direct QPay API test failed:', error.response?.data || error.message);
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Headers:', error.response.headers);
        }
      }
    } else {
      console.log('\n⚠️ Skipping direct QPay API test - credentials not available');
    }
    
    // Test 2: Local API endpoints
    console.log('\n🔍 Test 2: Local API Endpoints...');
    
    try {
      console.log('\n🔍 Test 2.1: Local QPay Payment Check API...');
      const localResponse = await axios.post('http://localhost:3000/api/qpay/payment/check', {
        invoiceId: testInvoiceId
      });
      
      console.log('✅ Local API Response:', JSON.stringify(localResponse.data, null, 2));
      
    } catch (error) {
      console.error('❌ Local API test failed:', error.response?.data || error.message);
    }
    
    try {
      console.log('\n🔍 Test 2.2: Public Payment Check API...');
      const publicResponse = await axios.post('http://localhost:3000/api/public/payment/check', {
        invoiceId: testInvoiceId
      });
      
      console.log('✅ Public API Response:', JSON.stringify(publicResponse.data, null, 2));
      
    } catch (error) {
      console.error('❌ Public API test failed:', error.response?.data || error.message);
    }
    
    // Test 3: Test with a known test invoice
    console.log('\n🔍 Test 3: Test Invoice Check...');
    const testInvoiceId2 = `TEST_INV_${Date.now()}`;
    
    try {
      const testResponse = await axios.post('http://localhost:3000/api/qpay/payment/check', {
        invoiceId: testInvoiceId2
      });
      
      console.log('✅ Test Invoice Response:', JSON.stringify(testResponse.data, null, 2));
      
    } catch (error) {
      console.error('❌ Test invoice check failed:', error.response?.data || error.message);
    }
    
    // Test 4: Check if server is running
    console.log('\n🔍 Test 4: Server Health Check...');
    try {
      const healthResponse = await axios.get('http://localhost:3000/api/debug-env');
      console.log('✅ Server is running');
      console.log('Health check response:', healthResponse.data);
    } catch (error) {
      console.error('❌ Server health check failed:', error.message);
      console.log('💡 Make sure your Next.js server is running on localhost:3000');
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

// Test with a real invoice ID from your database
async function testWithRealInvoice() {
  try {
    console.log('\n🔍 Test 5: Real Invoice Check...');
    
    // You should replace this with a real invoice ID from your database
    const realInvoiceId = 'YOUR_REAL_INVOICE_ID_HERE';
    
    if (realInvoiceId === 'YOUR_REAL_INVOICE_ID_HERE') {
      console.log('⚠️ Please replace with a real invoice ID from your database');
      return;
    }
    
    console.log(`📋 Testing with real invoice ID: ${realInvoiceId}`);
    
    const response = await axios.post('http://localhost:3000/api/qpay/payment/check', {
      invoiceId: realInvoiceId
    });
    
    console.log('✅ Real Invoice Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Real invoice test failed:', error.response?.data || error.message);
  }
}

// Run all debug tests
async function runDebugTests() {
  console.log('🚀 Starting QPay Payment Check Debug...\n');
  
  await debugQPayPaymentCheck();
  
  // Uncomment to test with a real invoice ID
  // await testWithRealInvoice();
  
  console.log('\n✅ Debug tests completed!');
  console.log('\n💡 Next steps:');
  console.log('1. Check if QPay credentials are correct');
  console.log('2. Verify the invoice ID exists in QPay system');
  console.log('3. Check if the payment was actually made');
  console.log('4. Verify the QPay API endpoint is accessible');
  console.log('5. Check server logs for detailed error messages');
}

runDebugTests().catch(console.error); 