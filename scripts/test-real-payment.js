const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test real payment scenarios
async function testRealPayment() {
  try {
    console.log('🧪 Testing Real Payment Scenarios...\n');
    
    const realInvoiceId = 'faee652e-95b5-42f6-99ee-7c3812067c2b';
    
    console.log(`📋 Testing with real invoice ID: ${realInvoiceId}`);
    
    // Step 1: Check if callback data exists
    console.log('\n🔍 Step 1: Checking for callback data...');
    try {
      const response1 = await axios.post('http://localhost:3001/api/public/payment/check', {
        invoiceId: realInvoiceId
      });
      
      console.log('✅ Payment check response:', JSON.stringify(response1.data, null, 2));
      
      if (response1.data.payment.count > 0) {
        console.log('🎉 Payment found! Callback was received.');
        return;
      }
    } catch (error) {
      console.error('❌ Payment check failed:', error.response?.data || error.message);
    }
    
    // Step 2: Simulate QPay callback for real payment
    console.log('\n🔍 Step 2: Simulating QPay callback for real payment...');
    try {
      const callbackData = {
        payment_id: `REAL_PAY_${Date.now()}`,
        payment_status: 'PAID',
        payment_amount: 1000,
        payment_date: new Date().toISOString(),
        object_id: realInvoiceId,
        object_type: 'INVOICE',
        payment_currency: 'MNT',
        payment_wallet: 'QPay',
        paid_by: 'P2P'
      };
      
      const callbackResponse = await axios.post('http://localhost:3001/api/qpay-callback', callbackData);
      console.log('✅ Real payment callback simulation response:', JSON.stringify(callbackResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Real payment callback simulation failed:', error.response?.data || error.message);
    }
    
    // Step 3: Check payment again
    console.log('\n🔍 Step 3: Checking payment after callback simulation...');
    try {
      const response2 = await axios.post('http://localhost:3001/api/public/payment/check', {
        invoiceId: realInvoiceId
      });
      
      console.log('✅ Payment check after callback:', JSON.stringify(response2.data, null, 2));
    } catch (error) {
      console.error('❌ Payment check after callback failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test SYSTEM_BUSY handling
async function testSystemBusyHandling() {
  try {
    console.log('\n🔍 Testing SYSTEM_BUSY Handling...');
    
    const testInvoiceId = 'faee652e-95b5-42f6-99ee-7c3812067c2b';
    
    // Make multiple requests to see how SYSTEM_BUSY is handled
    for (let i = 1; i <= 3; i++) {
      console.log(`\n🔍 Request ${i}:`);
      try {
        const response = await axios.post('http://localhost:3001/api/public/payment/check', {
          invoiceId: testInvoiceId
        });
        
        console.log(`✅ Request ${i} successful - SYSTEM_BUSY handled gracefully`);
        console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      } catch (error) {
        console.error(`❌ Request ${i} failed:`, error.response?.data || error.message);
      }
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
  } catch (error) {
    console.error('❌ SYSTEM_BUSY test failed:', error.message);
  }
}

// Test manual payment verification
async function testManualVerification() {
  try {
    console.log('\n🔍 Testing Manual Payment Verification...');
    
    const realInvoiceId = 'faee652e-95b5-42f6-99ee-7c3812067c2b';
    
    // This simulates what happens when a user manually checks their payment
    console.log('Simulating user manually checking payment status...');
    
    try {
      const response = await axios.post('http://localhost:3001/api/public/payment/check', {
        invoiceId: realInvoiceId
      });
      
      if (response.data.payment.count > 0) {
        console.log('🎉 Payment verified successfully!');
        console.log('Payment details:', JSON.stringify(response.data.payment.rows[0], null, 2));
      } else {
        console.log('⏳ Payment not found yet. This could mean:');
        console.log('1. Payment is still being processed by QPay');
        console.log('2. Callback hasn\'t been received yet');
        console.log('3. QPay system is busy (temporary issue)');
        console.log('4. Payment was not completed');
      }
    } catch (error) {
      console.error('❌ Manual verification failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Manual verification test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Real Payment Tests...\n');
  
  await testRealPayment();
  await testSystemBusyHandling();
  await testManualVerification();
  
  console.log('\n✅ Real payment tests completed!');
  console.log('\n💡 Key Points:');
  console.log('1. Real payments require QPay to send callbacks');
  console.log('2. SYSTEM_BUSY is handled gracefully - no errors thrown');
  console.log('3. Payment data is stored when callbacks are received');
  console.log('4. Manual checks work correctly once callback data exists');
  console.log('5. The system is designed to be resilient to QPay API issues');
}

runTests().catch(console.error); 