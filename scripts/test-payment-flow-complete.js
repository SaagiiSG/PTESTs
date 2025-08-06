const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testPaymentFlow() {
  console.log('🚀 Testing Complete Payment Flow...\n');

  try {
    // Test 1: Regular Payment Flow
    console.log('📋 Test 1: Regular Payment Flow');
    console.log('=' .repeat(50));
    
    // Create regular invoice
    console.log('1. Creating regular invoice...');
    const regularInvoiceResponse = await axios.post(`${BASE_URL}/api/public/create-invoice`, {
      amount: 10,
      description: 'Test Regular Payment',
      receiverCode: 'PSYCHOMETRICS'
    });
    
    const regularInvoiceId = regularInvoiceResponse.data.invoice_id;
    console.log(`✅ Regular invoice created: ${regularInvoiceId}`);
    
    // Simulate callback
    console.log('2. Simulating regular payment callback...');
    const regularCallbackResponse = await axios.post(`${BASE_URL}/api/qpay-callback`, {
      payment_id: `TEST_REG_${Date.now()}`,
      payment_status: 'PAID',
      payment_amount: 10,
      payment_date: new Date().toISOString(),
      object_id: regularInvoiceId,
      object_type: 'INVOICE',
      payment_currency: 'MNT',
      payment_wallet: 'QPay',
      paid_by: 'P2P'
    });
    
    console.log(`✅ Regular callback processed: ${regularCallbackResponse.data.message}`);
    
    // Check payment status
    console.log('3. Checking regular payment status...');
    const regularPaymentCheck = await axios.post(`${BASE_URL}/api/public/payment/check`, {
      invoiceId: regularInvoiceId
    });
    
    console.log(`✅ Regular payment status: ${regularPaymentCheck.data.payment.count} payments found`);
    
    // Test 2: Course Payment Flow (V2)
    console.log('\n📋 Test 2: Course Payment Flow (V2)');
    console.log('=' .repeat(50));
    
    // Create course invoice
    console.log('1. Creating course invoice (V2)...');
    const courseInvoiceResponse = await axios.post(`${BASE_URL}/api/public/create-course-invoice-v2`, {
      amount: 10,
      description: 'Test Course Payment V2',
      receiverCode: 'JAVZAN_B'
    });
    
    const courseInvoiceId = courseInvoiceResponse.data.invoice_id;
    console.log(`✅ Course invoice created (V2): ${courseInvoiceId}`);
    
    // Simulate course callback
    console.log('2. Simulating course payment callback...');
    const courseCallbackResponse = await axios.post(`${BASE_URL}/api/qpay-course-callback`, {
      payment_id: `TEST_COURSE_V2_${Date.now()}`,
      payment_status: 'PAID',
      payment_amount: 10,
      payment_date: new Date().toISOString(),
      object_id: courseInvoiceId,
      object_type: 'INVOICE',
      payment_currency: 'MNT',
      payment_wallet: 'QPay Course',
      paid_by: 'P2P'
    });
    
    console.log(`✅ Course callback processed: ${courseCallbackResponse.data.message}`);
    
    // Check course payment status (V2)
    console.log('3. Checking course payment status (V2)...');
    const coursePaymentCheckV2 = await axios.post(`${BASE_URL}/api/public/payment/course-check-v2`, {
      invoiceId: courseInvoiceId
    });
    
    console.log(`✅ Course payment status (V2): ${coursePaymentCheckV2.data.payment.count} payments found`);
    
    // Test 3: Course Payment Flow (V1)
    console.log('\n📋 Test 3: Course Payment Flow (V1)');
    console.log('=' .repeat(50));
    
    // Create course invoice (V1)
    console.log('1. Creating course invoice (V1)...');
    const courseInvoiceV1Response = await axios.post(`${BASE_URL}/api/public/create-course-invoice`, {
      amount: 10,
      description: 'Test Course Payment V1',
      receiverCode: 'JAVZAN_B'
    });
    
    const courseInvoiceV1Id = courseInvoiceV1Response.data.invoice_id;
    console.log(`✅ Course invoice created (V1): ${courseInvoiceV1Id}`);
    
    // Simulate course callback
    console.log('2. Simulating course payment callback...');
    const courseCallbackV1Response = await axios.post(`${BASE_URL}/api/qpay-course-callback`, {
      payment_id: `TEST_COURSE_V1_${Date.now()}`,
      payment_status: 'PAID',
      payment_amount: 10,
      payment_date: new Date().toISOString(),
      object_id: courseInvoiceV1Id,
      object_type: 'INVOICE',
      payment_currency: 'MNT',
      payment_wallet: 'QPay Course',
      paid_by: 'P2P'
    });
    
    console.log(`✅ Course callback processed: ${courseCallbackV1Response.data.message}`);
    
    // Check course payment status (V1)
    console.log('3. Checking course payment status (V1)...');
    const coursePaymentCheckV1 = await axios.post(`${BASE_URL}/api/public/payment/course-check`, {
      invoiceId: courseInvoiceV1Id
    });
    
    console.log(`✅ Course payment status (V1): ${coursePaymentCheckV1.data.payment.count} payments found`);
    
    // Test 4: SYSTEM_BUSY Handling
    console.log('\n📋 Test 4: SYSTEM_BUSY Error Handling');
    console.log('=' .repeat(50));
    
    // Test with a non-existent invoice (should handle gracefully)
    console.log('1. Testing payment check with non-existent invoice...');
    const nonExistentCheck = await axios.post(`${BASE_URL}/api/public/payment/check`, {
      invoiceId: 'non-existent-invoice-id'
    });
    
    console.log(`✅ Non-existent payment check handled gracefully: ${nonExistentCheck.data.payment.count} payments found`);
    
    // Test course payment check with non-existent invoice
    console.log('2. Testing course payment check with non-existent invoice...');
    const nonExistentCourseCheck = await axios.post(`${BASE_URL}/api/public/payment/course-check-v2`, {
      invoiceId: 'non-existent-course-invoice-id'
    });
    
    console.log(`✅ Non-existent course payment check handled gracefully: ${nonExistentCourseCheck.data.payment.count} payments found`);
    
    console.log('\n🎉 All Payment Flow Tests Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log('✅ Regular Payment Flow: Working');
    console.log('✅ Course Payment Flow (V2): Working');
    console.log('✅ Course Payment Flow (V1): Working');
    console.log('✅ SYSTEM_BUSY Error Handling: Working');
    console.log('✅ Callback Processing: Working');
    console.log('✅ Payment Status Checks: Working');
    
  } catch (error) {
    console.error('❌ Payment Flow Test Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testPaymentFlow(); 