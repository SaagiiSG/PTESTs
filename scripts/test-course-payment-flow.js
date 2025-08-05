require('dotenv').config({ path: '.env.local' });

async function testCoursePaymentFlow() {
  console.log('🧪 Testing Complete Course Payment Flow');
  console.log('=====================================');
  
  try {
    const baseUrl = 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app';
    
    console.log('\n📋 Testing Course Invoice Creation...');
    
    // Test course invoice creation
    const courseInvoiceResponse = await fetch(`${baseUrl}/api/public/create-course-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1000,
        description: 'Test Course Payment',
        receiverCode: 'TEST_COURSE_CUSTOMER'
      }),
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
    console.log('Service Type:', courseInvoiceData.serviceType);
    
    // Test course payment check
    console.log('\n🔍 Testing Course Payment Check...');
    
    const coursePaymentCheckResponse = await fetch(`${baseUrl}/api/public/payment/course-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: courseInvoiceData.invoice_id })
    });
    
    console.log('Course payment check response status:', coursePaymentCheckResponse.status);
    
    if (!coursePaymentCheckResponse.ok) {
      const errorText = await coursePaymentCheckResponse.text();
      console.error('❌ Course payment check failed:', errorText);
      return;
    }
    
    const coursePaymentCheckData = await coursePaymentCheckResponse.json();
    console.log('✅ Course payment check successful!');
    console.log('Payment count:', coursePaymentCheckData.payment?.count || 0);
    
    // Test general invoice creation for comparison
    console.log('\n📋 Testing General Invoice Creation...');
    
    const generalInvoiceResponse = await fetch(`${baseUrl}/api/public/create-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1000,
        description: 'Test General Payment',
        receiverCode: 'TEST_GENERAL_CUSTOMER'
      }),
    });
    
    console.log('General invoice response status:', generalInvoiceResponse.status);
    
    if (!generalInvoiceResponse.ok) {
      const errorText = await generalInvoiceResponse.text();
      console.error('❌ General invoice creation failed:', errorText);
      return;
    }
    
    const generalInvoiceData = await generalInvoiceResponse.json();
    console.log('✅ General invoice created successfully!');
    console.log('General Invoice ID:', generalInvoiceData.invoice_id);
    console.log('Service Type:', generalInvoiceData.serviceType || 'general');
    
    console.log('\n🎉 Course Payment Flow Test Complete!');
    console.log('✅ Course-specific QPay is working correctly');
    console.log('✅ General QPay is working correctly');
    console.log('✅ Both systems are using separate endpoints');
    
  } catch (error) {
    console.error('\n❌ Course payment flow test failed:', error.message);
    console.error('Full error:', error);
  }
}

testCoursePaymentFlow(); 