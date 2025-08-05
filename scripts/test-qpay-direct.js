require('dotenv').config({ path: '.env.local' });

async function testQPayDirect() {
  console.log('🧪 Testing QPay API Directly');
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
    
    const baseUrl = process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2';
    
    console.log('\n🔐 Testing QPay Authentication...');
    
    // Test authentication with Basic Auth
    const basicAuth = Buffer.from(`${process.env.QPAY_CLIENT_ID}:${process.env.QPAY_CLIENT_SECRET}`).toString('base64');
    
    const authResponse = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
      }),
    });
    
    console.log('Auth response status:', authResponse.status);
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('❌ Authentication failed:', errorText);
      return;
    }
    
    const authData = await authResponse.json();
    console.log('✅ Authentication successful!');
    console.log('Access token obtained:', authData.access_token ? '✅' : '❌');
    console.log('Token expires in:', authData.expires_in, 'seconds');
    
    // Test creating an invoice
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
    
    const invoiceResponse = await fetch(`${baseUrl}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify(testInvoiceData),
    });
    
    console.log('Invoice response status:', invoiceResponse.status);
    
    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      console.error('❌ Invoice creation failed:', errorText);
      return;
    }
    
    const invoiceData = await invoiceResponse.json();
    console.log('✅ Invoice created successfully!');
    console.log('Invoice ID:', invoiceData.invoice_id);
    console.log('QR Image URL:', invoiceData.qr_image ? '✅ Available' : '❌ Not available');
    
    // Test payment list check
    console.log('\n🔍 Testing Payment List Check...');
    const paymentListData = {
      object_type: 'INVOICE',
      object_id: invoiceData.invoice_id,
      offset: {
        page_number: 1,
        page_limit: 100
      }
    };
    
    const paymentListResponse = await fetch(`${baseUrl}/payment/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify(paymentListData),
    });
    
    console.log('Payment list response status:', paymentListResponse.status);
    
    if (!paymentListResponse.ok) {
      const errorText = await paymentListResponse.text();
      console.error('❌ Payment list check failed:', errorText);
      return;
    }
    
    const paymentListResult = await paymentListResponse.json();
    console.log('✅ Payment list check successful!');
    console.log('Payment count:', paymentListResult.rows?.length || 0);
    
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

testQPayDirect(); 