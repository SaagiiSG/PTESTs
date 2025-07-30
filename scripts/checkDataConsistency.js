const mongoose = require('mongoose');
require('dotenv').config();

async function checkDataConsistency() {
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

    console.log('\n=== Data Consistency Check ===\n');

    // Get all purchases
    const allPurchases = await Purchase.find({}).lean();
    console.log(`Total purchases in Purchase collection: ${allPurchases.length}`);

    // Get all users with purchases
    const usersWithPurchases = await User.find({
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    }).lean();

    console.log(`Users with purchases in User model: ${usersWithPurchases.length}`);

    // Analyze each purchase
    console.log('\n--- Purchase Collection Analysis ---');
    for (const purchase of allPurchases) {
      console.log(`Purchase ID: ${purchase._id}`);
      console.log(`  User: ${purchase.user}`);
      console.log(`  Course: ${purchase.course || 'N/A'}`);
      console.log(`  Test: ${purchase.test || 'N/A'}`);
      console.log(`  Date: ${purchase.purchasedAt}`);
      console.log('');
    }

    // Analyze each user
    console.log('--- User Model Analysis ---');
    let totalUserPurchases = 0;
    for (const user of usersWithPurchases) {
      const courseCount = user.purchasedCourses ? user.purchasedCourses.length : 0;
      const testCount = user.purchasedTests ? user.purchasedTests.length : 0;
      totalUserPurchases += courseCount + testCount;
      
      console.log(`User ID: ${user._id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Purchased Courses: ${courseCount}`);
      console.log(`  Purchased Tests: ${testCount}`);
      if (courseCount > 0) {
        console.log(`  Course IDs: ${user.purchasedCourses.map(id => id.toString())}`);
      }
      if (testCount > 0) {
        console.log(`  Test IDs: ${user.purchasedTests.map(id => id.toString())}`);
      }
      console.log('');
    }

    console.log(`Total purchases in User model: ${totalUserPurchases}`);

    // Check for inconsistencies
    console.log('\n--- Inconsistency Analysis ---');
    
    // Check if all purchases have corresponding user entries
    for (const purchase of allPurchases) {
      const user = await User.findById(purchase.user);
      if (!user) {
        console.log(`❌ Purchase ${purchase._id} references non-existent user ${purchase.user}`);
        continue;
      }

      if (purchase.course) {
        const hasCourse = user.purchasedCourses && user.purchasedCourses.includes(purchase.course);
        if (!hasCourse) {
          console.log(`❌ Purchase ${purchase._id} has course ${purchase.course} but user ${purchase.user} doesn't have it in purchasedCourses`);
        }
      }

      if (purchase.test) {
        const hasTest = user.purchasedTests && user.purchasedTests.includes(purchase.test);
        if (!hasTest) {
          console.log(`❌ Purchase ${purchase._id} has test ${purchase.test} but user ${purchase.user} doesn't have it in purchasedTests`);
        }
      }
    }

    // Check if all user purchases have corresponding purchase records
    for (const user of usersWithPurchases) {
      if (user.purchasedCourses) {
        for (const courseId of user.purchasedCourses) {
          const purchase = await Purchase.findOne({ user: user._id, course: courseId });
          if (!purchase) {
            console.log(`❌ User ${user._id} has course ${courseId} in purchasedCourses but no corresponding purchase record`);
          }
        }
      }

      if (user.purchasedTests) {
        for (const testId of user.purchasedTests) {
          const purchase = await Purchase.findOne({ user: user._id, test: testId });
          if (!purchase) {
            console.log(`❌ User ${user._id} has test ${testId} in purchasedTests but no corresponding purchase record`);
          }
        }
      }
    }

    console.log('\n--- Summary ---');
    console.log(`Purchase collection count: ${allPurchases.length}`);
    console.log(`User model total purchases: ${totalUserPurchases}`);
    console.log(`Discrepancy: ${Math.abs(allPurchases.length - totalUserPurchases)} items`);

  } catch (error) {
    console.error('Data consistency check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the consistency check
checkDataConsistency(); 