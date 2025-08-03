const axios = require('axios');

async function testManualVerification(invoiceId, amount = 1000) {
  try {
    console.log(`🧪 Testing Manual Payment Verification for invoice: ${invoiceId}`);
    
    // Step 1: Manually verify payment
    console.log('\n1. Manually verifying payment...');
    const verifyResponse = await axios.post('http://localhost:3000/api/manual-payment-verify', {
      invoice_id: invoiceId,
      payment_status: 'PAID',
      payment_amount: amount
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (verifyResponse.data.success) {
      console.log('✅ Payment manually verified successfully');
      console.log('Payment details:', verifyResponse.data.payment);
    } else {
      throw new Error('Failed to verify payment manually');
    }

    // Step 2: Check payment status
    console.log('\n2. Checking payment status...');
    const checkResponse = await axios.post('http://localhost:3000/api/qpay/payment/check', {
      payment_id: invoiceId
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (checkResponse.data.success && checkResponse.data.payment.count > 0) {
      console.log('✅ Payment found and verified');
      console.log('Payment details:', checkResponse.data.payment.rows[0]);
    } else {
      console.log('❌ Payment not found after verification');
    }

    console.log('\n🎉 Manual verification test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to your payment page in the browser');
    console.log('2. Click the "✅ Simulate Payment Completion" button');
    console.log('3. Your payment should be marked as successful');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Get invoice ID from command line argument
const invoiceId = process.argv[2];
const amount = process.argv[3] || 1000;

if (!invoiceId) {
  console.log('Usage: node scripts/test-manual-verification.js <invoice_id> [amount]');
  console.log('Example: node scripts/test-manual-verification.js f5cfdc70-ba75-461c-b81d-08fedb1c25f6 1000');
  process.exit(1);
}

testManualVerification(invoiceId, amount); 