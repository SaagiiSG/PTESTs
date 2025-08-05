require('dotenv').config({ path: '.env.local' });

const { getQPayService } = require('../lib/qpay.ts');

async function testQPayCredentials() {
  console.log('🧪 Testing QPay Credentials');
  console.log('============================');
  
  try {
    // Check environment variables
    console.log('\n📋 Environment Variables:');
    console.log('QPAY_CLIENT_ID:', process.env.QPAY_CLIENT_ID || '❌ Not set');
    console.log('QPAY_CLIENT_SECRET:', process.env.QPAY_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('QPAY_BASE_URL:', process.env.QPAY_BASE_URL || '❌ Not set');
    console.log('QPAY_INVOICE_CODE:', process.env.QPAY_INVOICE_CODE || '❌ Not set');
    
    if (!process.env.QPAY_CLIENT_ID || !process.env.QPAY_CLIENT_SECRET) {
      console.error('\n❌ Missing required QPay credentials!');
      return;
    }
    
    console.log('\n🔐 Testing QPay Authentication...');
    const qpayService = getQPayService();
    
    // Test authentication by trying to get an access token
    console.log('Attempting to get access token...');
    const token = await qpayService['getAccessToken']();
    console.log('✅ Authentication successful!');
    console.log('Access token obtained:', token ? '✅' : '❌');
    
    // Test creating a test invoice
    console.log('\n🧾 Testing Invoice Creation...');
    const testInvoiceData = {
      invoice_code: process.env.QPAY_INVOICE_CODE,
      sender_invoice_no: `TEST_INV_${Date.now()}`,
      invoice_receiver_code: 'TEST_CUSTOMER',
      invoice_description: 'Test payment for credential verification',
      amount: 1000,
      callback_url: process.env.QPAY_CALLBACK_URL
    };
    
    console.log('Creating test invoice with data:', testInvoiceData);
    const invoiceResponse = await qpayService.createInvoice(testInvoiceData);
    console.log('✅ Invoice created successfully!');
    console.log('Invoice ID:', invoiceResponse.invoice_id);
    console.log('QR Image URL:', invoiceResponse.qr_image ? '✅ Available' : '❌ Not available');
    
    // Test payment checking
    console.log('\n🔍 Testing Payment Check...');
    const paymentCheck = await qpayService.checkPayment(invoiceResponse.invoice_id);
    console.log('✅ Payment check successful!');
    console.log('Payment count:', paymentCheck.rows?.length || 0);
    
    console.log('\n🎉 All QPay tests passed!');
    console.log('Your credentials are working correctly.');
    
  } catch (error) {
    console.error('\n❌ QPay test failed:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if your QPAY_CLIENT_ID and QPAY_CLIENT_SECRET are correct');
      console.log('2. Verify that you\'re using the production URL (https://merchant.qpay.mn/v2)');
      console.log('3. Make sure your account is activated with QPay');
    }
  }
}

testQPayCredentials(); 