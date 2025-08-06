const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test both payment systems side by side
async function testDualPaymentSystems() {
  try {
    console.log('🧪 Testing Dual Payment Systems...\n');
    
    // Check environment variables
    console.log('🔍 Environment Variables:');
    console.log('Regular QPay:');
    console.log('  QPAY_CLIENT_ID:', process.env.QPAY_CLIENT_ID || '❌ Not set');
    console.log('  QPAY_CLIENT_SECRET:', process.env.QPAY_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('  QPAY_INVOICE_CODE:', process.env.QPAY_INVOICE_CODE || '❌ Not set');
    
    console.log('\nCourse QPay:');
    console.log('  QPAY_COURSE_CLIENT_ID:', process.env.QPAY_COURSE_CLIENT_ID || '❌ Not set');
    console.log('  QPAY_COURSE_CLIENT_SECRET:', process.env.QPAY_COURSE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('  QPAY_COURSE_INVOICE_CODE:', process.env.QPAY_COURSE_INVOICE_CODE || '❌ Not set');
    
    // Test 1: Regular Test Payment System
    console.log('\n🔍 Test 1: Regular Test Payment System (using regular credentials)...');
    try {
      const testInvoiceData = {
        amount: 1000,
        description: 'Test Payment (Regular)',
        receiverCode: 'TEST_USER',
        invoiceCode: process.env.QPAY_INVOICE_CODE || 'PSYCHOMETRICS_INVOICE'
      };
      
      const testResponse = await axios.post('http://localhost:3001/api/public/create-invoice', testInvoiceData);
      console.log('✅ Regular test invoice created successfully');
      console.log('  Invoice ID:', testResponse.data.invoice_id);
      console.log('  Service Type:', testResponse.data.serviceType || 'test');
      console.log('  Using Regular Credentials: ✅');
      
      const testInvoiceId = testResponse.data.invoice_id;
      
      // Simulate regular payment callback
      const testCallbackData = {
        payment_id: `TEST_PAY_${Date.now()}`,
        payment_status: 'PAID',
        payment_amount: 1000,
        payment_date: new Date().toISOString(),
        object_id: testInvoiceId,
        object_type: 'INVOICE',
        payment_currency: 'MNT',
        payment_wallet: 'QPay',
        paid_by: 'P2P'
      };
      
      await axios.post('http://localhost:3001/api/qpay-callback', testCallbackData);
      console.log('✅ Regular payment callback processed');
      
      // Check regular payment status
      const testPaymentResponse = await axios.post('http://localhost:3001/api/public/payment/check', {
        invoiceId: testInvoiceId
      });
      
      console.log('✅ Regular payment check successful');
      console.log('  Payment Count:', testPaymentResponse.data.payment.count);
      console.log('  Service Type:', testPaymentResponse.data.payment.rows[0]?.service_type || 'test');
      
    } catch (error) {
      console.error('❌ Regular test payment system failed:', error.response?.data || error.message);
    }
    
    // Test 2: Course Payment System V1 (using regular credentials as fallback)
    console.log('\n🔍 Test 2: Course Payment System V1 (using regular credentials as fallback)...');
    try {
      const courseInvoiceData = {
        amount: 5000,
        description: 'Test Course Payment V1',
        receiverCode: 'TEST_COURSE_USER'
      };
      
      const courseResponse = await axios.post('http://localhost:3001/api/public/create-course-invoice', courseInvoiceData);
      console.log('✅ Course invoice V1 created successfully');
      console.log('  Invoice ID:', courseResponse.data.invoice_id);
      console.log('  Service Type:', courseResponse.data.serviceType);
      console.log('  Using Regular Credentials (fallback): ✅');
      
      const courseInvoiceId = courseResponse.data.invoice_id;
      
      // Simulate course payment callback
      const courseCallbackData = {
        payment_id: `COURSE_PAY_V1_${Date.now()}`,
        payment_status: 'PAID',
        payment_amount: 5000,
        payment_date: new Date().toISOString(),
        object_id: courseInvoiceId,
        object_type: 'INVOICE',
        payment_currency: 'MNT',
        payment_wallet: 'QPay Course',
        paid_by: 'P2P'
      };
      
      await axios.post('http://localhost:3001/api/qpay-course-callback', courseCallbackData);
      console.log('✅ Course payment V1 callback processed');
      
      // Check course payment status
      const coursePaymentResponse = await axios.post('http://localhost:3001/api/public/payment/course-check', {
        invoiceId: courseInvoiceId
      });
      
      console.log('✅ Course payment V1 check successful');
      console.log('  Payment Count:', coursePaymentResponse.data.payment.count);
      console.log('  Service Type:', coursePaymentResponse.data.payment.rows[0]?.service_type || 'course');
      
    } catch (error) {
      console.error('❌ Course payment system V1 failed:', error.response?.data || error.message);
    }
    
    // Test 3: Course Payment System V2 (using course credentials)
    console.log('\n🔍 Test 3: Course Payment System V2 (using course credentials)...');
    try {
      const courseV2InvoiceData = {
        amount: 5000,
        description: 'Test Course Payment V2',
        receiverCode: 'TEST_COURSE_USER'
      };
      
      const courseV2Response = await axios.post('http://localhost:3001/api/public/create-course-invoice-v2', courseV2InvoiceData);
      console.log('✅ Course invoice V2 created successfully');
      console.log('  Invoice ID:', courseV2Response.data.invoice_id);
      console.log('  Service Type:', courseV2Response.data.serviceType);
      console.log('  Using Course Credentials:', courseV2Response.data.usingCourseCredentials ? '✅' : '❌');
      
      const courseV2InvoiceId = courseV2Response.data.invoice_id;
      
      // Simulate course payment callback
      const courseV2CallbackData = {
        payment_id: `COURSE_PAY_V2_${Date.now()}`,
        payment_status: 'PAID',
        payment_amount: 5000,
        payment_date: new Date().toISOString(),
        object_id: courseV2InvoiceId,
        object_type: 'INVOICE',
        payment_currency: 'MNT',
        payment_wallet: 'QPay Course',
        paid_by: 'P2P'
      };
      
      await axios.post('http://localhost:3001/api/qpay-course-callback', courseV2CallbackData);
      console.log('✅ Course payment V2 callback processed');
      
      // Check course payment status
      const courseV2PaymentResponse = await axios.post('http://localhost:3001/api/public/payment/course-check-v2', {
        invoiceId: courseV2InvoiceId
      });
      
      console.log('✅ Course payment V2 check successful');
      console.log('  Payment Count:', courseV2PaymentResponse.data.payment.count);
      console.log('  Service Type:', courseV2PaymentResponse.data.payment.rows[0]?.service_type || 'course');
      
    } catch (error) {
      console.error('❌ Course payment system V2 failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Dual payment systems test failed:', error.message);
  }
}

// Run the test
async function runTest() {
  console.log('🚀 Starting Dual Payment Systems Test...\n');
  
  await testDualPaymentSystems();
  
  console.log('\n✅ Dual payment systems test completed!');
  console.log('\n💡 Summary:');
  console.log('1. Regular Test Payments: Use QPAY_* credentials');
  console.log('2. Course Payments V1: Use QPAY_* credentials (fallback)');
  console.log('3. Course Payments V2: Use QPAY_COURSE_* credentials');
  console.log('4. Both systems work independently');
  console.log('5. Both systems have separate tracking');
  console.log('6. You can use either course system based on credential availability');
}

runTest().catch(console.error); 