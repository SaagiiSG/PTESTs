const mongoose = require('mongoose');
require('dotenv').config();
const { createPurchase, hasPurchased, cleanupDuplicatePurchases } = require('../lib/purchaseUtils');

async function testDuplicateProtection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define schemas inline for testing
    const UserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      phoneNumber: { type: String, required: false, unique: true, sparse: true },
      password: { type: String, required: false },
      email: { type: String, required: false, unique: true, sparse: true },
      age: { type: Number },
      gender: { type: String },
      verificationCode: { type: String },
      isPhoneVerified: { type: Boolean, default: false },
      verificationCodeExpires: { type: Date },
      isAdmin: { type: Boolean, default: false },
      purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
      purchasedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
    }, { timestamps: true });

    const PurchaseSchema = new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
      purchasedAt: { type: Date, default: Date.now },
    });

    // Get or create models
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);

    console.log('\n=== Testing Duplicate Purchase Protection ===\n');

    // Get a test user
    const testUser = await User.findOne().lean();
    if (!testUser) {
      console.log('No users found for testing');
      return;
    }

    const userId = testUser._id;
    const testCourseId = new mongoose.Types.ObjectId();
    const testTestId = new mongoose.Types.ObjectId();

    console.log(`Testing with user: ${userId}`);

    // Test 1: First purchase (should succeed)
    console.log('\n1. Testing first purchase...');
    const result1 = await createPurchase(userId, testCourseId, null, {
      amount: 29.99,
      paymentMethod: 'credit_card'
    });
    console.log('Result:', result1);

    // Test 2: Duplicate purchase attempt (should fail)
    console.log('\n2. Testing duplicate purchase attempt...');
    const result2 = await createPurchase(userId, testCourseId, null, {
      amount: 29.99,
      paymentMethod: 'credit_card'
    });
    console.log('Result:', result2);

    // Test 3: Check ownership
    console.log('\n3. Checking ownership...');
    const hasCourse = await hasPurchased(userId, testCourseId);
    console.log(`User has purchased course: ${hasCourse}`);

    // Test 4: Test purchase (should succeed)
    console.log('\n4. Testing test purchase...');
    const result3 = await createPurchase(userId, null, testTestId, {
      amount: 9.99,
      paymentMethod: 'paypal'
    });
    console.log('Result:', result3);

    // Test 5: Duplicate test purchase attempt (should fail)
    console.log('\n5. Testing duplicate test purchase attempt...');
    const result4 = await createPurchase(userId, null, testTestId, {
      amount: 9.99,
      paymentMethod: 'paypal'
    });
    console.log('Result:', result4);

    // Test 6: Check final ownership
    console.log('\n6. Checking final ownership...');
    const hasCourseFinal = await hasPurchased(userId, testCourseId);
    const hasTestFinal = await hasPurchased(userId, null, testTestId);
    console.log(`User has purchased course: ${hasCourseFinal}`);
    console.log(`User has purchased test: ${hasTestFinal}`);

    // Test 7: Verify purchase count
    console.log('\n7. Verifying purchase count...');
    const userFinal = await User.findById(userId).select('purchasedCourses purchasedTests');
    const purchaseCount = await Purchase.countDocuments({ user: userId });
    
    console.log(`User model - Courses: ${userFinal.purchasedCourses.length}, Tests: ${userFinal.purchasedTests.length}`);
    console.log(`Purchase collection count: ${purchaseCount}`);

    // Test 8: Simulate rapid double-click scenario
    console.log('\n8. Simulating rapid double-click scenario...');
    const rapidCourseId = new mongoose.Types.ObjectId();
    
    // Simulate two rapid purchase attempts
    const rapidAttempts = await Promise.all([
      createPurchase(userId, rapidCourseId, null, { amount: 19.99 }),
      createPurchase(userId, rapidCourseId, null, { amount: 19.99 })
    ]);
    
    console.log('Rapid attempt 1 result:', rapidAttempts[0]);
    console.log('Rapid attempt 2 result:', rapidAttempts[1]);

    // Test 9: Check if any duplicates were created
    console.log('\n9. Checking for duplicates...');
    const rapidPurchases = await Purchase.find({ user: userId, course: rapidCourseId });
    console.log(`Rapid purchases found: ${rapidPurchases.length}`);

    // Test 10: Clean up test data
    console.log('\n10. Cleaning up test data...');
    const cleanupResult = await cleanupDuplicatePurchases(userId);
    console.log('Cleanup result:', cleanupResult);

    console.log('\n✅ Duplicate protection testing completed!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testDuplicateProtection(); 