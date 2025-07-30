const mongoose = require('mongoose');
require('dotenv').config();

async function implementHybridPurchases() {
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

    // Get all users with purchases
    const users = await User.find({
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    }).lean();

    console.log(`Found ${users.length} users with purchases`);

    let totalPurchasesCreated = 0;

    // Recreate purchase records from user data
    for (const user of users) {
      const purchases = [];

      // Create purchase records for courses
      if (user.purchasedCourses && user.purchasedCourses.length > 0) {
        for (const courseId of user.purchasedCourses) {
          purchases.push({
            user: user._id,
            course: courseId,
            purchasedAt: user.createdAt || new Date() // Use user creation date as fallback
          });
        }
      }

      // Create purchase records for tests
      if (user.purchasedTests && user.purchasedTests.length > 0) {
        for (const testId of user.purchasedTests) {
          purchases.push({
            user: user._id,
            test: testId,
            purchasedAt: user.createdAt || new Date() // Use user creation date as fallback
          });
        }
      }

      // Insert all purchases for this user
      if (purchases.length > 0) {
        await Purchase.insertMany(purchases);
        totalPurchasesCreated += purchases.length;
        console.log(`Created ${purchases.length} purchase records for user ${user._id}`);
      }
    }

    console.log(`\nHybrid implementation completed successfully!`);
    console.log(`Total purchase records created: ${totalPurchasesCreated}`);
    console.log(`Users processed: ${users.length}`);

    // Verify the data integrity
    const totalPurchases = await Purchase.countDocuments();
    console.log(`Total purchases in database: ${totalPurchases}`);

    // Show sample analytics queries
    console.log('\n--- Sample Analytics Queries ---');
    
    // Most popular courses
    const popularCourses = await Purchase.aggregate([
      { $match: { course: { $exists: true } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    console.log('Most popular courses:', popularCourses);

    // Most popular tests
    const popularTests = await Purchase.aggregate([
      { $match: { test: { $exists: true } } },
      { $group: { _id: '$test', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    console.log('Most popular tests:', popularTests);

    // Purchases by date
    const purchasesByDate = await Purchase.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$purchasedAt' },
            month: { $month: '$purchasedAt' },
            day: { $dayOfMonth: '$purchasedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 10 }
    ]);
    console.log('Recent purchases by date:', purchasesByDate);

  } catch (error) {
    console.error('Hybrid implementation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the hybrid implementation
implementHybridPurchases(); 