const mongoose = require('mongoose');
require('dotenv').config();

async function fixMissingPurchases() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define schemas inline
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

    console.log('\n=== Fixing Missing Purchase Records ===\n');

    // Get all users with purchases
    const usersWithPurchases = await User.find({
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    }).lean();

    let totalMissingPurchases = 0;
    let totalCreatedPurchases = 0;

    for (const user of usersWithPurchases) {
      console.log(`\n👤 Processing user: ${user.name} (${user._id})`);
      
      // Get existing purchases for this user
      const existingPurchases = await Purchase.find({ user: user._id }).lean();
      const existingCourseIds = existingPurchases.filter(p => p.course).map(p => p.course.toString());
      const existingTestIds = existingPurchases.filter(p => p.test).map(p => p.test.toString());

      // Find missing course purchases
      const userCourseIds = user.purchasedCourses ? user.purchasedCourses.map(id => id.toString()) : [];
      const missingCourseIds = userCourseIds.filter(courseId => !existingCourseIds.includes(courseId));

      // Find missing test purchases
      const userTestIds = user.purchasedTests ? user.purchasedTests.map(id => id.toString()) : [];
      const missingTestIds = userTestIds.filter(testId => !existingTestIds.includes(testId));

      if (missingCourseIds.length > 0 || missingTestIds.length > 0) {
        console.log(`  📚 Missing course purchases: ${missingCourseIds.length}`);
        console.log(`  🧪 Missing test purchases: ${missingTestIds.length}`);
        
        totalMissingPurchases += missingCourseIds.length + missingTestIds.length;

        // Create missing purchase records
        const newPurchases = [];

        // Create course purchases
        for (const courseId of missingCourseIds) {
          newPurchases.push({
            user: user._id,
            course: courseId,
            purchasedAt: user.createdAt || new Date(), // Use user creation date as fallback
            amount: 0, // Unknown amount for historical purchases
            paymentMethod: 'unknown',
            purchaseSource: 'migration',
            note: 'Created during missing purchase fix'
          });
        }

        // Create test purchases
        for (const testId of missingTestIds) {
          newPurchases.push({
            user: user._id,
            test: testId,
            purchasedAt: user.createdAt || new Date(), // Use user creation date as fallback
            amount: 0, // Unknown amount for historical purchases
            paymentMethod: 'unknown',
            purchaseSource: 'migration',
            note: 'Created during missing purchase fix'
          });
        }

        if (newPurchases.length > 0) {
          await Purchase.insertMany(newPurchases);
          totalCreatedPurchases += newPurchases.length;
          console.log(`  ✅ Created ${newPurchases.length} missing purchase records`);
        }
      } else {
        console.log(`  ✅ No missing purchases found`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total missing purchases found: ${totalMissingPurchases}`);
    console.log(`Total purchase records created: ${totalCreatedPurchases}`);

    // Verify the fix
    console.log('\n=== Verification ===');
    const finalUsers = await User.find({
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    }).lean();

    let totalUserItems = 0;
    let totalPurchaseItems = 0;

    for (const user of finalUsers) {
      const courseCount = user.purchasedCourses ? user.purchasedCourses.length : 0;
      const testCount = user.purchasedTests ? user.purchasedTests.length : 0;
      totalUserItems += courseCount + testCount;

      const userPurchases = await Purchase.find({ user: user._id });
      totalPurchaseItems += userPurchases.length;

      console.log(`👤 ${user.name}: ${courseCount + testCount} items in user model, ${userPurchases.length} purchase records`);
    }

    console.log(`\n📊 Final Counts:`);
    console.log(`User model total items: ${totalUserItems}`);
    console.log(`Purchase collection total items: ${totalPurchaseItems}`);
    console.log(`Discrepancy: ${Math.abs(totalUserItems - totalPurchaseItems)}`);

    if (totalUserItems === totalPurchaseItems) {
      console.log('✅ Data consistency restored!');
    } else {
      console.log('❌ Data inconsistency still exists');
    }

  } catch (error) {
    console.error('Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixMissingPurchases(); 