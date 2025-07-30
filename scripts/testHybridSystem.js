const mongoose = require('mongoose');
require('dotenv').config();
const { createPurchase, hasPurchased, getPurchaseHistory, getPurchaseAnalytics } = require('../lib/purchaseUtils');

async function testHybridSystem() {
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

    console.log('\n=== Testing Hybrid Purchase System ===\n');

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

    // Test 1: Create a course purchase
    console.log('\n1. Testing course purchase creation...');
    await createPurchase(userId, testCourseId, null, {
      amount: 29.99,
      paymentMethod: 'credit_card'
    });

    // Verify it's in user model
    const userAfterCourse = await User.findById(userId).select('purchasedCourses purchasedTests');
    console.log('User purchasedCourses after course purchase:', userAfterCourse.purchasedCourses);
    console.log('User purchasedTests after course purchase:', userAfterCourse.purchasedTests);

    // Verify it's in purchase collection
    const coursePurchase = await Purchase.findOne({ user: userId, course: testCourseId });
    console.log('Purchase record for course:', coursePurchase);

    // Test 2: Create a test purchase
    console.log('\n2. Testing test purchase creation...');
    await createPurchase(userId, null, testTestId, {
      amount: 9.99,
      paymentMethod: 'paypal'
    });

    // Verify it's in user model
    const userAfterTest = await User.findById(userId).select('purchasedCourses purchasedTests');
    console.log('User purchasedCourses after test purchase:', userAfterTest.purchasedCourses);
    console.log('User purchasedTests after test purchase:', userAfterTest.purchasedTests);

    // Verify it's in purchase collection
    const testPurchase = await Purchase.findOne({ user: userId, test: testTestId });
    console.log('Purchase record for test:', testPurchase);

    // Test 3: Check hasPurchased function
    console.log('\n3. Testing hasPurchased function...');
    const hasCourse = await hasPurchased(userId, testCourseId);
    const hasTest = await hasPurchased(userId, testTestId);
    const hasNonExistent = await hasPurchased(userId, new mongoose.Types.ObjectId());

    console.log(`User has purchased course: ${hasCourse}`);
    console.log(`User has purchased test: ${hasTest}`);
    console.log(`User has purchased non-existent item: ${hasNonExistent}`);

    // Test 4: Get purchase history
    console.log('\n4. Testing purchase history...');
    const history = await getPurchaseHistory(userId, { limit: 10 });
    console.log('Purchase history:', history.length, 'records');

    // Test 5: Get analytics
    console.log('\n5. Testing analytics...');
    const analytics = await getPurchaseAnalytics();
    console.log('Analytics data:', {
      totalPurchases: analytics.totalPurchases,
      coursePurchases: analytics.coursePurchases,
      testPurchases: analytics.testPurchases
    });

    // Test 6: Verify data consistency
    console.log('\n6. Testing data consistency...');
    const userFinal = await User.findById(userId).select('purchasedCourses purchasedTests');
    const userPurchases = await Purchase.find({ user: userId });

    const userCourseIds = userFinal.purchasedCourses.map(id => id.toString());
    const userTestIds = userFinal.purchasedTests.map(id => id.toString());
    
    const purchaseCourseIds = userPurchases
      .filter(p => p.course)
      .map(p => p.course.toString());
    const purchaseTestIds = userPurchases
      .filter(p => p.test)
      .map(p => p.test.toString());

    console.log('User model course IDs:', userCourseIds);
    console.log('Purchase collection course IDs:', purchaseCourseIds);
    console.log('User model test IDs:', userTestIds);
    console.log('Purchase collection test IDs:', purchaseTestIds);

    const coursesConsistent = JSON.stringify(userCourseIds.sort()) === JSON.stringify(purchaseCourseIds.sort());
    const testsConsistent = JSON.stringify(userTestIds.sort()) === JSON.stringify(purchaseTestIds.sort());

    console.log('Courses consistent between user model and purchase collection:', coursesConsistent);
    console.log('Tests consistent between user model and purchase collection:', testsConsistent);

    if (coursesConsistent && testsConsistent) {
      console.log('\n✅ All tests passed! Hybrid system is working correctly.');
    } else {
      console.log('\n❌ Data consistency issues detected!');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testHybridSystem(); 