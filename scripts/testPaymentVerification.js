const axios = require('axios');

async function testPaymentVerification() {
  try {
    console.log('Testing payment verification logic...\n');

    // Test 1: Non-existent payment (should return 202 - processing)
    console.log('Test 1: Non-existent payment');
    try {
      const response = await axios.post('http://localhost:3000/api/purchase', {
        itemId: 'test-course-123',
        itemType: 'course',
        amount: 1000,
        paymentId: 'non-existent-invoice-123'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Unexpected success:', response.status, response.data);
    } catch (error) {
      if (error.response?.status === 202) {
        console.log('✅ Correctly returned 202 (processing):', error.response.data);
      } else if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\nTest 2: Existing payment');
    try {
      const response = await axios.post('http://localhost:3000/api/purchase', {
        itemId: 'test-course-456',
        itemType: 'course',
        amount: 1000,
        paymentId: '83ba9270-df64-40cb-b37e-3bf5b1dd0183' // This exists in our test
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Unexpected success:', response.status, response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\nTest 3: Payment check API');
    try {
      const response = await axios.post('http://localhost:3000/api/qpay/payment/check', {
        payment_id: '83ba9270-df64-40cb-b37e-3bf5b1dd0183'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Payment found:', response.data);
    } catch (error) {
      console.log('❌ Payment check failed:', error.response?.data);
    }

    console.log('\nTest 4: Non-existent payment check');
    try {
      const response = await axios.post('http://localhost:3000/api/qpay/payment/check', {
        payment_id: 'non-existent-invoice-123'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Correctly returns no payment:', response.data);
    } catch (error) {
      console.log('❌ Payment check failed:', error.response?.data);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPaymentVerification(); 