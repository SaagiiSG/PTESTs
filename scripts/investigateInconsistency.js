const mongoose = require('mongoose');
require('dotenv').config();

async function investigateInconsistency() {
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

    console.log('\n=== INVESTIGATING INCONSISTENCY ===\n');

    // Focus on user Baysaa (6888c335e1dd095cc9de99e6)
    const userId = '6888c335e1dd095cc9de99e6';
    
    const user = await User.findById(userId).lean();
    const purchases = await Purchase.find({ user: userId }).lean();

    console.log(`👤 User: ${user.name} (${userId})`);
    console.log(`📚 Courses in User Model: ${user.purchasedCourses.length}`);
    console.log(`🧪 Tests in User Model: ${user.purchasedTests.length}`);
    console.log(`📊 Purchases in Collection: ${purchases.length}`);

    console.log('\n--- User Model Courses ---');
    for (const courseId of user.purchasedCourses) {
      console.log(`  Course ID: ${courseId}`);
    }

    console.log('\n--- Purchase Collection Records ---');
    for (const purchase of purchases) {
      console.log(`  Purchase ID: ${purchase._id}`);
      console.log(`    Course: ${purchase.course || 'N/A'}`);
      console.log(`    Test: ${purchase.test || 'N/A'}`);
      console.log(`    Date: ${purchase.purchasedAt}`);
      console.log('');
    }

    // Find courses in user model that don't have purchase records
    console.log('--- Missing Purchase Records ---');
    const userCourseIds = user.purchasedCourses.map(id => id.toString());
    const purchaseCourseIds = purchases.filter(p => p.course).map(p => p.course.toString());

    console.log('User model course IDs:', userCourseIds);
    console.log('Purchase collection course IDs:', purchaseCourseIds);

    const missingPurchases = userCourseIds.filter(courseId => !purchaseCourseIds.includes(courseId));
    
    if (missingPurchases.length > 0) {
      console.log('\n❌ Courses missing purchase records:');
      for (const courseId of missingPurchases) {
        console.log(`  - ${courseId}`);
      }
    } else {
      console.log('\n✅ All user courses have purchase records');
    }

    // Find purchase records that don't have user model entries
    const extraPurchases = purchaseCourseIds.filter(courseId => !userCourseIds.includes(courseId));
    
    if (extraPurchases.length > 0) {
      console.log('\n❌ Purchase records without user model entries:');
      for (const courseId of extraPurchases) {
        console.log(`  - ${courseId}`);
      }
    } else {
      console.log('\n✅ All purchase records have user model entries');
    }

    // Check if there are any orphaned purchase records
    console.log('\n--- Checking for Orphaned Records ---');
    const allPurchases = await Purchase.find({}).lean();
    const allUserIds = allPurchases.map(p => p.user.toString());
    const uniqueUserIds = [...new Set(allUserIds)];
    
    console.log(`Total purchase records: ${allPurchases.length}`);
    console.log(`Unique users with purchases: ${uniqueUserIds.length}`);
    
    for (const purchaseUserId of uniqueUserIds) {
      const userExists = await User.findById(purchaseUserId);
      if (!userExists) {
        console.log(`❌ Purchase record references non-existent user: ${purchaseUserId}`);
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`User model items: ${user.purchasedCourses.length + user.purchasedTests.length}`);
    console.log(`Purchase collection items: ${purchases.length}`);
    console.log(`Missing purchase records: ${missingPurchases.length}`);
    console.log(`Extra purchase records: ${extraPurchases.length}`);

  } catch (error) {
    console.error('Investigation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the investigation
investigateInconsistency(); 