const axios = require('axios');

// Test QPay payment check using the correct API endpoint
async function testQPayPaymentCheck() {
  try {
    console.log('🧪 Testing QPay Payment Check API...');
    
    // Test with a sample invoice ID (replace with a real one for testing)
    const testInvoiceId = '071f45e6-b6e6-4562-a470-8457269d251a'; // Example from QPay docs
    
    console.log(`📋 Testing with invoice ID: ${testInvoiceId}`);
    
    // Test the local API endpoint
    console.log('\n🔍 Testing local API endpoint...');
    const localResponse = await axios.post('http://localhost:3000/api/qpay/payment/check', {
      invoiceId: testInvoiceId
    });
    
    console.log('✅ Local API Response:', JSON.stringify(localResponse.data, null, 2));
    
    // Test the public API endpoint
    console.log('\n🔍 Testing public API endpoint...');
    const publicResponse = await axios.post('http://localhost:3000/api/public/payment/check', {
      invoiceId: testInvoiceId
    });
    
    console.log('✅ Public API Response:', JSON.stringify(publicResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Test with a real QPay API call (requires proper credentials)
async function testDirectQPayAPI() {
  try {
    console.log('\n🧪 Testing direct QPay API call...');
    
    // This would require proper QPay credentials
    const qpayResponse = await axios.post('https://merchant-sandbox.qpay.mn/v2/payment/check', {
      object_type: 'INVOICE',
      object_id: '071f45e6-b6e6-4562-a470-8457269d251a',
      offset: {
        page_number: 1,
        page_limit: 100
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // Replace with actual token
      }
    });
    
    console.log('✅ Direct QPay API Response:', JSON.stringify(qpayResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Direct QPay API test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting QPay Payment Check Tests...\n');
  
  await testQPayPaymentCheck();
  
  // Uncomment to test direct QPay API (requires credentials)
  // await testDirectQPayAPI();
  
  console.log('\n✅ Tests completed!');
}

runTests().catch(console.error); 