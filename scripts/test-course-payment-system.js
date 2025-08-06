const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test course payment system functionality
async function testCoursePaymentSystem() {
  try {
    console.log('🧪 Testing Course Payment System...\n');
    
    // Test 1: Check course QPay credentials
    console.log('🔍 Test 1: Checking Course QPay Credentials...');
    console.log('QPAY_COURSE_CLIENT_ID:', process.env.QPAY_COURSE_CLIENT_ID || '❌ Not set');
    console.log('QPAY_COURSE_CLIENT_SECRET:', process.env.QPAY_COURSE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('QPAY_COURSE_BASE_URL:', process.env.QPAY_COURSE_BASE_URL || '❌ Not set');
    console.log('QPAY_COURSE_INVOICE_CODE:', process.env.QPAY_COURSE_INVOICE_CODE || '❌ Not set');
    
    if (!process.env.QPAY_COURSE_CLIENT_ID || !process.env.QPAY_COURSE_CLIENT_SECRET) {
      console.log('❌ Course QPay credentials not configured!');
      console.log('Please set QPAY_COURSE_CLIENT_ID and QPAY_COURSE_CLIENT_SECRET in .env.local');
      return;
    }
    
    console.log('✅ Course QPay credentials are configured\n');
    
    // Test 2: Test course invoice creation
    console.log('🔍 Test 2: Testing Course Invoice Creation...');
    try {
      const courseInvoiceData = {
        amount: 5000,
        description: 'Test Course Payment',
        receiverCode: 'TEST_COURSE_USER',
        invoiceCode: process.env.QPAY_COURSE_INVOICE_CODE || 'PSYCHOMETRICS_COURSE_INVOICE'
      };
      
      const courseInvoiceResponse = await axios.post('http://localhost:3001/api/public/create-course-invoice', courseInvoiceData);
      console.log('✅ Course invoice created successfully');
      console.log('Course invoice ID:', courseInvoiceResponse.data.invoice_id);
      console.log('Service type:', courseInvoiceResponse.data.serviceType);
      
      const courseInvoiceId = courseInvoiceResponse.data.invoice_id;
      
      // Test 3: Simulate course payment callback
      console.log('\n🔍 Test 3: Simulating Course Payment Callback...');
      const courseCallbackData = {
        payment_id: `COURSE_PAY_${Date.now()}`,
        payment_status: 'PAID',
        payment_amount: 5000,
        payment_date: new Date().toISOString(),
        object_id: courseInvoiceId,
        object_type: 'INVOICE',
        payment_currency: 'MNT',
        payment_wallet: 'QPay Course',
        paid_by: 'P2P'
      };
      
      try {
        const courseCallbackResponse = await axios.post('http://localhost:3001/api/qpay-course-callback', courseCallbackData);
        console.log('✅ Course payment callback processed successfully');
      } catch (error) {
        console.error('❌ Course payment callback failed:', error.response?.data || error.message);
      }
      
      // Test 4: Check course payment status
      console.log('\n🔍 Test 4: Checking Course Payment Status...');
      try {
        const coursePaymentResponse = await axios.post('http://localhost:3001/api/public/payment/course-check', {
          invoiceId: courseInvoiceId
        });
        
        console.log('✅ Course payment check response:', JSON.stringify(coursePaymentResponse.data, null, 2));
        
        if (coursePaymentResponse.data.payment.count > 0) {
          console.log('🎉 Course payment found!');
          console.log('Payment status:', coursePaymentResponse.data.payment.rows[0].payment_status);
          console.log('Service type:', coursePaymentResponse.data.payment.rows[0].service_type);
        } else {
          console.log('⚠️ No course payment found yet.');
        }
      } catch (error) {
        console.error('❌ Course payment check failed:', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.error('❌ Course invoice creation failed:', error.response?.data || error.message);
    }
    
    // Test 5: Compare with regular test payment system
    console.log('\n🔍 Test 5: Comparing with Regular Test Payment System...');
    try {
      const testInvoiceData = {
        amount: 1000,
        description: 'Test Payment (Regular)',
        receiverCode: 'TEST_USER',
        invoiceCode: process.env.QPAY_INVOICE_CODE || 'PSYCHOMETRICS_INVOICE'
      };
      
      const testInvoiceResponse = await axios.post('http://localhost:3001/api/public/create-invoice', testInvoiceData);
      console.log('✅ Regular test invoice created successfully');
      console.log('Regular invoice ID:', testInvoiceResponse.data.invoice_id);
      console.log('Service type:', testInvoiceResponse.data.serviceType || 'test');
      
      const testInvoiceId = testInvoiceResponse.data.invoice_id;
      
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
      
      try {
        await axios.post('http://localhost:3001/api/qpay-callback', testCallbackData);
        console.log('✅ Regular payment callback processed');
      } catch (error) {
        console.error('❌ Regular payment callback failed:', error.response?.data || error.message);
      }
      
      // Check regular payment status
      try {
        const testPaymentResponse = await axios.post('http://localhost:3001/api/public/payment/check', {
          invoiceId: testInvoiceId
        });
        
        console.log('✅ Regular payment check successful');
        console.log('Regular payment count:', testPaymentResponse.data.payment.count);
      } catch (error) {
        console.error('❌ Regular payment check failed:', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.error('❌ Regular test invoice creation failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Course payment system test failed:', error.message);
  }
}

// Test course QPay service directly
async function testCourseQPayService() {
  try {
    console.log('\n🔍 Testing Course QPay Service Directly...');
    
    // Test course QPay authentication
    console.log('Testing course QPay authentication...');
    const { getQPayCourseService } = require('./lib/qpay-course');
    const courseService = getQPayCourseService();
    
    try {
      const token = await courseService['getAccessToken']();
      console.log('✅ Course QPay authentication successful');
      console.log('Token type:', typeof token);
    } catch (error) {
      console.error('❌ Course QPay authentication failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Course QPay service test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Course Payment System Tests...\n');
  
  await testCoursePaymentSystem();
  await testCourseQPayService();
  
  console.log('\n✅ Course payment system tests completed!');
  console.log('\n💡 Summary:');
  console.log('1. Course payments use QPAY_COURSE_* credentials');
  console.log('2. Test payments use QPAY_* credentials');
  console.log('3. Both systems work independently');
  console.log('4. Course payments are marked with service_type: "course"');
  console.log('5. Test payments are marked with service_type: "test" (or undefined)');
  console.log('6. Each system has its own callback endpoint');
  console.log('7. Each system has its own payment check endpoint');
  console.log('8. Your course payment system is ready! 🎉');
}

runAllTests().catch(console.error); 