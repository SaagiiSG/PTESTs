require('dotenv').config({ path: '.env.local' });

async function testQPayCourse() {
  console.log('🧪 Testing QPay Course API Directly');
  console.log('============================');
  
  try {
    // Check environment variables
    console.log('\n📋 Course Environment Variables:');
    console.log('QPAY_COURSE_CLIENT_ID:', process.env.QPAY_COURSE_CLIENT_ID || '❌ Not set');
    console.log('QPAY_COURSE_CLIENT_SECRET:', process.env.QPAY_COURSE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('QPAY_COURSE_BASE_URL:', process.env.QPAY_COURSE_BASE_URL || '❌ Not set');
    console.log('QPAY_COURSE_INVOICE_CODE:', process.env.QPAY_COURSE_INVOICE_CODE || '❌ Not set');
    
    if (!process.env.QPAY_COURSE_CLIENT_ID || !process.env.QPAY_COURSE_CLIENT_SECRET) {
      console.error('\n❌ Missing required QPay Course credentials!');
      console.log('\n💡 To set up course-specific QPay credentials:');
      console.log('1. Contact QPay to get separate credentials for course payments');
      console.log('2. Update QPAY_COURSE_CLIENT_ID and QPAY_COURSE_CLIENT_SECRET in .env.local');
      console.log('3. Run this test again');
      return;
    }
    
    const baseUrl = process.env.QPAY_COURSE_BASE_URL || 'https://merchant.qpay.mn/v2';
    
    console.log('\n🔐 Testing QPay Course Authentication...');
    
    // Test authentication with Basic Auth
    const basicAuth = Buffer.from(`${process.env.QPAY_COURSE_CLIENT_ID}:${process.env.QPAY_COURSE_CLIENT_SECRET}`).toString('base64');
    
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
    
    console.log('Course auth response status:', authResponse.status);
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('❌ Course authentication failed:', errorText);
      return;
    }
    
    const authData = await authResponse.json();
    console.log('✅ Course authentication successful!');
    console.log('Access token obtained:', authData.access_token ? '✅' : '❌');
    console.log('Token expires in:', authData.expires_in, 'seconds');
    
    // Test creating a course invoice
    console.log('\n🧾 Testing Course Invoice Creation...');
    const testCourseInvoiceData = {
      invoice_code: process.env.QPAY_COURSE_INVOICE_CODE,
      sender_invoice_no: `COURSE_TEST_INV_${Date.now()}`,
      invoice_receiver_code: 'TEST_COURSE_CUSTOMER',
      invoice_description: 'Test course payment for credential verification',
      amount: 1000,
      callback_url: process.env.QPAY_CALLBACK_URL
    };
    
    console.log('Creating test course invoice with data:', testCourseInvoiceData);
    
    const courseInvoiceResponse = await fetch(`${baseUrl}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify(testCourseInvoiceData),
    });
    
    console.log('Course invoice response status:', courseInvoiceResponse.status);
    
    if (!courseInvoiceResponse.ok) {
      const errorText = await courseInvoiceResponse.text();
      console.error('❌ Course invoice creation failed:', errorText);
      return;
    }
    
    const courseInvoiceData = await courseInvoiceResponse.json();
    console.log('✅ Course invoice created successfully!');
    console.log('Course Invoice ID:', courseInvoiceData.invoice_id);
    console.log('QR Image URL:', courseInvoiceData.qr_image ? '✅ Available' : '❌ Not available');
    
    // Test course payment list check
    console.log('\n🔍 Testing Course Payment List Check...');
    const coursePaymentListData = {
      object_type: 'INVOICE',
      object_id: courseInvoiceData.invoice_id,
      offset: {
        page_number: 1,
        page_limit: 100
      }
    };
    
    const coursePaymentListResponse = await fetch(`${baseUrl}/payment/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify(coursePaymentListData),
    });
    
    console.log('Course payment list response status:', coursePaymentListResponse.status);
    
    if (!coursePaymentListResponse.ok) {
      const errorText = await coursePaymentListResponse.text();
      console.error('❌ Course payment list check failed:', errorText);
      return;
    }
    
    const coursePaymentListResult = await coursePaymentListResponse.json();
    console.log('✅ Course payment list check successful!');
    console.log('Course payment count:', coursePaymentListResult.rows?.length || 0);
    
    console.log('\n🎉 All QPay Course tests passed!');
    console.log('Your course-specific credentials are working correctly.');
    
  } catch (error) {
    console.error('\n❌ QPay Course test failed:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if your QPAY_COURSE_CLIENT_ID and QPAY_COURSE_CLIENT_SECRET are correct');
      console.log('2. Verify that you\'re using the production URL (https://merchant.qpay.mn/v2)');
      console.log('3. Make sure your course account is activated with QPay');
    }
  }
}

testQPayCourse(); 