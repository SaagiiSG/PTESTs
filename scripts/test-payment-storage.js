require('dotenv').config({ path: '.env.local' });

async function testPaymentStorage() {
  console.log('🧪 Testing Payment Storage System');
  console.log('=====================================');

  try {
    // Test 1: Simulate a QPay callback
    console.log('\n📋 Test 1: Simulating QPay Callback...');
    
    const testInvoiceId = `TEST_INV_${Date.now()}`;
    const testPaymentData = {
      payment_id: `TEST_PAY_${Date.now()}`,
      payment_status: 'PAID',
      payment_amount: 5000,
      payment_date: new Date().toISOString(),
      object_id: testInvoiceId,
      object_type: 'INVOICE',
      payment_currency: 'MNT',
      payment_wallet: 'QPay',
      paid_by: 'P2P',
      service_type: 'test'
    };

    console.log('Test payment data:', testPaymentData);

    // Simulate storing payment data (like QPay callback would do)
    const { storePaymentStatus, getPaymentStatus } = await import('../lib/payment-storage.js');
    
    console.log('Storing payment data...');
    await storePaymentStatus(testInvoiceId, testPaymentData);
    console.log('✅ Payment data stored');

    // Test 2: Retrieve payment data
    console.log('\n📋 Test 2: Retrieving Payment Data...');
    
    const retrievedPayment = await getPaymentStatus(testInvoiceId);
    
    if (retrievedPayment) {
      console.log('✅ Payment data retrieved successfully:');
      console.log('Payment ID:', retrievedPayment.payment_id);
      console.log('Status:', retrievedPayment.payment_status);
      console.log('Amount:', retrievedPayment.payment_amount);
      console.log('Service Type:', retrievedPayment.service_type);
    } else {
      console.log('❌ Failed to retrieve payment data');
    }

    // Test 3: Test non-existent payment
    console.log('\n📋 Test 3: Testing Non-existent Payment...');
    
    const nonExistentPayment = await getPaymentStatus('NON_EXISTENT_INVOICE');
    
    if (!nonExistentPayment) {
      console.log('✅ Correctly returned null for non-existent payment');
    } else {
      console.log('❌ Unexpectedly found payment data for non-existent invoice');
    }

    console.log('\n🎉 Payment storage system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPaymentStorage(); 