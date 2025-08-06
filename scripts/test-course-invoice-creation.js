const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test course invoice creation step by step
async function testCourseInvoiceCreation() {
  try {
    console.log('🔍 Testing Course Invoice Creation Step by Step...\n');
    
    // Check environment variables
    console.log('Environment Variables:');
    console.log('QPAY_COURSE_CLIENT_ID:', process.env.QPAY_COURSE_CLIENT_ID || '❌ Not set');
    console.log('QPAY_COURSE_CLIENT_SECRET:', process.env.QPAY_COURSE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('QPAY_COURSE_INVOICE_CODE:', process.env.QPAY_COURSE_INVOICE_CODE || '❌ Not set');
    console.log('QPAY_CLIENT_ID:', process.env.QPAY_CLIENT_ID || '❌ Not set');
    console.log('QPAY_CLIENT_SECRET:', process.env.QPAY_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('QPAY_INVOICE_CODE:', process.env.QPAY_INVOICE_CODE || '❌ Not set');
    
    // Determine which credentials to use
    const isUsingRegularCredentials = !process.env.QPAY_COURSE_CLIENT_ID || !process.env.QPAY_COURSE_CLIENT_SECRET;
    const invoiceCode = isUsingRegularCredentials 
      ? (process.env.QPAY_INVOICE_CODE || 'PSYCHOMETRICS_INVOICE')
      : (process.env.QPAY_COURSE_INVOICE_CODE || process.env.QPAY_INVOICE_CODE || 'PSYCHOMETRICS_INVOICE');
    
    console.log('\n🔍 Credential Analysis:');
    console.log('Using regular credentials:', isUsingRegularCredentials);
    console.log('Invoice code to use:', invoiceCode);
    
    // Test regular invoice creation first
    console.log('\n🔍 Test 1: Testing Regular Invoice Creation...');
    try {
      const regularInvoiceData = {
        amount: 1000,
        description: 'Test Regular Payment',
        receiverCode: 'TEST_USER',
        invoiceCode: process.env.QPAY_INVOICE_CODE || 'PSYCHOMETRICS_INVOICE'
      };
      
      const regularResponse = await axios.post('http://localhost:3001/api/public/create-invoice', regularInvoiceData);
      console.log('✅ Regular invoice created successfully');
      console.log('Regular invoice ID:', regularResponse.data.invoice_id);
      
    } catch (error) {
      console.error('❌ Regular invoice creation failed:', error.response?.data || error.message);
    }
    
    // Test course invoice creation
    console.log('\n🔍 Test 2: Testing Course Invoice Creation...');
    try {
      const courseInvoiceData = {
        amount: 5000,
        description: 'Test Course Payment',
        receiverCode: 'TEST_USER'
      };
      
      const courseResponse = await axios.post('http://localhost:3001/api/public/create-course-invoice', courseInvoiceData);
      console.log('✅ Course invoice created successfully');
      console.log('Course invoice ID:', courseResponse.data.invoice_id);
      console.log('Service type:', courseResponse.data.serviceType);
      
    } catch (error) {
      console.error('❌ Course invoice creation failed:', error.response?.data || error.message);
    }
    
    // Test course QPay service directly
    console.log('\n🔍 Test 3: Testing Course QPay Service Directly...');
    try {
      const { getQPayCourseService } = require('./lib/qpay-course');
      const courseService = getQPayCourseService();
      
      // Test authentication
      const token = await courseService['getAccessToken']();
      console.log('✅ Course QPay authentication successful');
      
      // Test invoice creation
      const testInvoiceData = {
        invoice_code: invoiceCode,
        sender_invoice_no: `TEST_COURSE_INV${Date.now()}`,
        invoice_receiver_code: 'TEST_USER',
        invoice_description: 'Test Course Direct',
        amount: 5000,
        callback_url: 'http://localhost:3001/api/qpay-course-callback',
        calculate_vat: false,
        enable_expiry: false,
      };
      
      console.log('Creating test invoice with data:', testInvoiceData);
      const invoice = await courseService.createInvoice(testInvoiceData);
      console.log('✅ Direct course invoice creation successful');
      console.log('Invoice ID:', invoice.invoice_id);
      
    } catch (error) {
      console.error('❌ Direct course QPay service test failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCourseInvoiceCreation().catch(console.error); 