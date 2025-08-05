require('dotenv').config({ path: '.env.local' });

async function testCoursePaymentFlow() {
  console.log('🧪 Testing Complete Course Payment Flow');
  console.log('==========================================');

  const baseUrl = 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app';

  try {
    // Step 1: Create a course invoice
    console.log('\n📋 Step 1: Creating Course Invoice...');
    
    const invoiceResponse = await fetch(`${baseUrl}/api/public/create-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 3000,
        description: 'Test Course Payment Flow',
        receiverCode: 'TEST',
        itemType: 'course'
      })
    });

    const invoiceData = await invoiceResponse.json();
    
    if (!invoiceResponse.ok) {
      throw new Error(`Course invoice creation failed: ${invoiceData.error || 'Unknown error'}`);
    }

    console.log('✅ Course invoice created successfully');
    console.log('Invoice ID:', invoiceData.invoice_id);

    // Step 2: Check course payment status (should be empty initially)
    console.log('\n📋 Step 2: Checking Initial Course Payment Status...');
    
    const initialCheckResponse = await fetch(`${baseUrl}/api/public/payment/course-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: invoiceData.invoice_id })
    });

    const initialCheckData = await initialCheckResponse.json();
    
    if (initialCheckData.payment.count === 0) {
      console.log('✅ Correctly shows no course payment initially');
    } else {
      console.log('❌ Unexpectedly found course payment data initially');
    }

    // Step 3: Simulate QPay course callback (POST to course callback URL)
    console.log('\n📋 Step 3: Simulating QPay Course Callback...');
    
    const callbackData = {
      payment_id: `COURSE_PAY_${Date.now()}`,
      payment_status: 'PAID',
      payment_amount: 3000,
      payment_date: new Date().toISOString(),
      object_id: invoiceData.invoice_id,
      payment_currency: 'MNT',
      payment_wallet: 'QPay Course',
      paid_by: 'P2P'
    };

    console.log('Course callback data:', callbackData);

    const callbackResponse = await fetch(`${baseUrl}/api/qpay-course-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(callbackData)
    });

    const callbackResult = await callbackResponse.json();
    
    if (callbackResponse.ok) {
      console.log('✅ QPay course callback processed successfully');
    } else {
      console.log('❌ QPay course callback failed:', callbackResult.error);
    }

    // Step 4: Check course payment status again (should now show payment)
    console.log('\n📋 Step 4: Checking Course Payment Status After Callback...');
    
    // Wait a moment for the callback to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const finalCheckResponse = await fetch(`${baseUrl}/api/public/payment/course-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: invoiceData.invoice_id })
    });

    const finalCheckData = await finalCheckResponse.json();
    
    if (finalCheckData.payment.count > 0) {
      console.log('✅ Course payment detected after callback!');
      console.log('Course payment details:', finalCheckData.payment.rows[0]);
    } else {
      console.log('❌ Course payment not detected after callback');
      console.log('Response:', finalCheckData);
    }

    console.log('\n🎉 Course payment flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCoursePaymentFlow(); 