require('dotenv').config({ path: '.env.local' });

async function testPaymentFlow() {
  console.log('🧪 Testing Complete Payment Flow');
  console.log('=====================================');

  const baseUrl = 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app';

  try {
    // Step 1: Create an invoice
    console.log('\n📋 Step 1: Creating Invoice...');
    
    const invoiceResponse = await fetch(`${baseUrl}/api/public/create-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 2000,
        description: 'Test Payment Flow',
        receiverCode: 'TEST',
        itemType: 'test'
      })
    });

    const invoiceData = await invoiceResponse.json();
    
    if (!invoiceResponse.ok) {
      throw new Error(`Invoice creation failed: ${invoiceData.error || 'Unknown error'}`);
    }

    console.log('✅ Invoice created successfully');
    console.log('Invoice ID:', invoiceData.invoice_id);

    // Step 2: Check payment status (should be empty initially)
    console.log('\n📋 Step 2: Checking Initial Payment Status...');
    
    const initialCheckResponse = await fetch(`${baseUrl}/api/public/payment/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: invoiceData.invoice_id })
    });

    const initialCheckData = await initialCheckResponse.json();
    
    if (initialCheckData.payment.count === 0) {
      console.log('✅ Correctly shows no payment initially');
    } else {
      console.log('❌ Unexpectedly found payment data initially');
    }

    // Step 3: Simulate QPay callback (POST to callback URL)
    console.log('\n📋 Step 3: Simulating QPay Callback...');
    
    const callbackData = {
      payment_id: `PAY_${Date.now()}`,
      payment_status: 'PAID',
      payment_amount: 2000,
      payment_date: new Date().toISOString(),
      object_id: invoiceData.invoice_id,
      payment_currency: 'MNT',
      payment_wallet: 'QPay',
      paid_by: 'P2P'
    };

    console.log('Callback data:', callbackData);

    const callbackResponse = await fetch(`${baseUrl}/api/qpay-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(callbackData)
    });

    const callbackResult = await callbackResponse.json();
    
    if (callbackResponse.ok) {
      console.log('✅ QPay callback processed successfully');
    } else {
      console.log('❌ QPay callback failed:', callbackResult.error);
    }

    // Step 4: Check payment status again (should now show payment)
    console.log('\n📋 Step 4: Checking Payment Status After Callback...');
    
    // Wait a moment for the callback to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const finalCheckResponse = await fetch(`${baseUrl}/api/public/payment/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: invoiceData.invoice_id })
    });

    const finalCheckData = await finalCheckResponse.json();
    
    if (finalCheckData.payment.count > 0) {
      console.log('✅ Payment detected after callback!');
      console.log('Payment details:', finalCheckData.payment.rows[0]);
    } else {
      console.log('❌ Payment not detected after callback');
      console.log('Response:', finalCheckData);
    }

    console.log('\n🎉 Payment flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPaymentFlow(); 