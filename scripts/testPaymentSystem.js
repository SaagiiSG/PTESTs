const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Test payment storage and retrieval
async function testPaymentSystem() {
  try {
    await connectToMongoDB();
    
    // Import the Payment model
    const Payment = require('../app/models/payment').default;
    
    // Test data
    const testInvoiceId = 'test-invoice-' + Date.now();
    const testPayment = {
      payment_id: 'test-payment-' + Date.now(),
      payment_date: new Date().toISOString(),
      payment_status: 'PAID',
      payment_amount: 1000,
      payment_currency: 'MNT',
      payment_wallet: 'QPay',
      payment_name: 'Test Payment',
      payment_description: 'Test payment for system verification',
      qr_code: 'test-qr-code',
      paid_by: 'P2P',
      object_type: 'INVOICE',
      object_id: testInvoiceId
    };
    
    console.log('Testing payment storage...');
    
    // Store payment
    const storedPayment = await Payment.create(testPayment);
    console.log('Payment stored successfully:', storedPayment._id);
    
    // Retrieve payment
    const retrievedPayment = await Payment.findOne({ object_id: testInvoiceId });
    console.log('Payment retrieved successfully:', retrievedPayment ? 'YES' : 'NO');
    
    if (retrievedPayment) {
      console.log('Payment details:', {
        payment_id: retrievedPayment.payment_id,
        status: retrievedPayment.payment_status,
        amount: retrievedPayment.payment_amount,
        object_id: retrievedPayment.object_id
      });
    }
    
    // Test API endpoint
    console.log('\nTesting API endpoint...');
    const response = await fetch('http://localhost:3000/api/qpay/payment/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: testInvoiceId })
    });
    
    const data = await response.json();
    console.log('API Response:', data);
    
    // Cleanup
    await Payment.deleteOne({ object_id: testInvoiceId });
    console.log('Test payment cleaned up');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testPaymentSystem(); 