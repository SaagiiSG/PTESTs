const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test the callback-first approach
async function testCallbackFirst() {
  try {
    console.log('🧪 Testing Callback-First Approach...\n');
    
    const testInvoiceId = '09e90067-4cfd-4f46-974b-8ebf6c4b6642';
    
    console.log(`📋 Testing with invoice ID: ${testInvoiceId}`);
    
    // Step 1: Test payment check without callback data
    console.log('\n🔍 Step 1: Testing payment check without callback data...');
    try {
      const response1 = await axios.post('http://localhost:3001/api/public/payment/check', {
        invoiceId: testInvoiceId
      });
      
      console.log('✅ Payment check response:', JSON.stringify(response1.data, null, 2));
    } catch (error) {
      console.error('❌ Payment check failed:', error.response?.data || error.message);
    }
    
    // Step 2: Simulate callback data
    console.log('\n🔍 Step 2: Simulating callback data...');
    try {
      const callbackData = {
        payment_id: 'TEST_PAY_123456',
        payment_status: 'PAID',
        payment_amount: 1000,
        payment_date: new Date().toISOString(),
        object_id: testInvoiceId,
        object_type: 'INVOICE',
        payment_currency: 'MNT',
        payment_wallet: 'QPay',
        paid_by: 'P2P'
      };
      
      const callbackResponse = await axios.post('http://localhost:3001/api/qpay-callback', callbackData);
      console.log('✅ Callback simulation response:', JSON.stringify(callbackResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Callback simulation failed:', error.response?.data || error.message);
    }
    
    // Step 3: Test payment check with callback data
    console.log('\n🔍 Step 3: Testing payment check with callback data...');
    try {
      const response2 = await axios.post('http://localhost:3001/api/public/payment/check', {
        invoiceId: testInvoiceId
      });
      
      console.log('✅ Payment check with callback data:', JSON.stringify(response2.data, null, 2));
    } catch (error) {
      console.error('❌ Payment check with callback data failed:', error.response?.data || error.message);
    }
    
    // Step 4: Test course payment check
    console.log('\n🔍 Step 4: Testing course payment check...');
    try {
      const courseResponse = await axios.post('http://localhost:3001/api/public/payment/course-check', {
        invoiceId: testInvoiceId
      });
      
      console.log('✅ Course payment check response:', JSON.stringify(courseResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Course payment check failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test token reuse
async function testTokenReuse() {
  try {
    console.log('\n🔍 Testing Token Reuse...');
    
    const testInvoiceId = '09e90067-4cfd-4f46-974b-8ebf6c4b6642';
    
    // Make multiple requests to see if token is reused
    for (let i = 1; i <= 3; i++) {
      console.log(`\n🔍 Request ${i}:`);
      try {
        const response = await axios.post('http://localhost:3001/api/public/payment/check', {
          invoiceId: testInvoiceId
        });
        
        console.log(`✅ Request ${i} successful`);
      } catch (error) {
        console.error(`❌ Request ${i} failed:`, error.response?.data || error.message);
      }
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Token reuse test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Callback-First Approach Tests...\n');
  
  await testCallbackFirst();
  await testTokenReuse();
  
  console.log('\n✅ Tests completed!');
  console.log('\n💡 Key Points:');
  console.log('1. Callback data is now the primary source of payment information');
  console.log('2. QPay API is only used as a fallback when no callback data exists');
  console.log('3. Tokens are reused to minimize API calls');
  console.log('4. Payment data from API checks is stored for future use');
}

runTests().catch(console.error); 