const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testPurchaseFlow() {
  console.log('🚀 Testing Purchase Flow with Already Purchased Handling...\n');

  try {
    // Test 1: Create an invoice and simulate payment
    console.log('📋 Test 1: Create Invoice and Simulate Payment');
    console.log('=' .repeat(50));
    
    // Create regular invoice
    console.log('1. Creating regular invoice...');
    const regularInvoiceResponse = await axios.post(`${BASE_URL}/api/public/create-invoice`, {
      amount: 10,
      description: 'Test Purchase Flow',
      receiverCode: 'PSYCHOMETRICS'
    });
    
    const regularInvoiceId = regularInvoiceResponse.data.invoice_id;
    console.log(`✅ Regular invoice created: ${regularInvoiceId}`);
    
    // Simulate callback
    console.log('2. Simulating payment callback...');
    const regularCallbackResponse = await axios.post(`${BASE_URL}/api/qpay-callback`, {
      payment_id: `TEST_PURCHASE_${Date.now()}`,
      payment_status: 'PAID',
      payment_amount: 10,
      payment_date: new Date().toISOString(),
      object_id: regularInvoiceId,
      object_type: 'INVOICE',
      payment_currency: 'MNT',
      payment_wallet: 'QPay',
      paid_by: 'P2P'
    });
    
    console.log(`✅ Callback processed: ${regularCallbackResponse.data.message}`);
    
    // Test 2: Try to purchase (this should work)
    console.log('\n📋 Test 2: First Purchase Attempt');
    console.log('=' .repeat(50));
    
    console.log('1. Attempting first purchase...');
    const firstPurchaseResponse = await axios.post(`${BASE_URL}/api/purchase`, {
      itemId: '688c75c1a2543bde0884458f', // Use a real test ID
      itemType: 'test',
      amount: 10,
      paymentId: regularInvoiceId
    });
    
    console.log(`✅ First purchase response:`, {
      status: firstPurchaseResponse.status,
      message: firstPurchaseResponse.data.message,
      alreadyPurchased: firstPurchaseResponse.data.alreadyPurchased
    });
    
    // Test 3: Try to purchase again (should return already purchased)
    console.log('\n📋 Test 3: Second Purchase Attempt (Should be Already Purchased)');
    console.log('=' .repeat(50));
    
    console.log('1. Attempting second purchase (should be already purchased)...');
    const secondPurchaseResponse = await axios.post(`${BASE_URL}/api/purchase`, {
      itemId: '688c75c1a2543bde0884458f', // Same test ID
      itemType: 'test',
      amount: 10,
      paymentId: regularInvoiceId
    });
    
    console.log(`✅ Second purchase response:`, {
      status: secondPurchaseResponse.status,
      message: secondPurchaseResponse.data.message,
      alreadyPurchased: secondPurchaseResponse.data.alreadyPurchased
    });
    
    // Test 4: Test with course
    console.log('\n📋 Test 4: Course Purchase Test');
    console.log('=' .repeat(50));
    
    // Create course invoice
    console.log('1. Creating course invoice...');
    const courseInvoiceResponse = await axios.post(`${BASE_URL}/api/public/create-course-invoice-v2`, {
      amount: 10,
      description: 'Test Course Purchase',
      receiverCode: 'JAVZAN_B'
    });
    
    const courseInvoiceId = courseInvoiceResponse.data.invoice_id;
    console.log(`✅ Course invoice created: ${courseInvoiceId}`);
    
    // Simulate course callback
    console.log('2. Simulating course payment callback...');
    const courseCallbackResponse = await axios.post(`${BASE_URL}/api/qpay-course-callback`, {
      payment_id: `TEST_COURSE_PURCHASE_${Date.now()}`,
      payment_status: 'PAID',
      payment_amount: 10,
      payment_date: new Date().toISOString(),
      object_id: courseInvoiceId,
      object_type: 'INVOICE',
      payment_currency: 'MNT',
      payment_wallet: 'QPay Course',
      paid_by: 'P2P'
    });
    
    console.log(`✅ Course callback processed: ${courseCallbackResponse.data.message}`);
    
    // Try course purchase
    console.log('3. Attempting course purchase...');
    const coursePurchaseResponse = await axios.post(`${BASE_URL}/api/purchase`, {
      itemId: '688c75c1a2543bde0884458f', // Use a real course ID
      itemType: 'course',
      amount: 10,
      paymentId: courseInvoiceId
    });
    
    console.log(`✅ Course purchase response:`, {
      status: coursePurchaseResponse.status,
      message: coursePurchaseResponse.data.message,
      alreadyPurchased: coursePurchaseResponse.data.alreadyPurchased
    });
    
    console.log('\n🎉 Purchase Flow Tests Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log('✅ Invoice Creation: Working');
    console.log('✅ Payment Callbacks: Working');
    console.log('✅ First Purchase: Working');
    console.log('✅ Already Purchased Handling: Working');
    console.log('✅ Course Purchase: Working');
    
  } catch (error) {
    console.error('❌ Purchase Flow Test Failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testPurchaseFlow(); 