const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupTestData() {
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

    console.log('Cleaning up test data...');

    // Remove test purchases (those created today during testing)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const testPurchases = await Purchase.find({
      purchasedAt: { $gte: today }
    });

    console.log(`Found ${testPurchases.length} test purchases to remove`);

    if (testPurchases.length > 0) {
      // Get unique test IDs
      const testCourseIds = [...new Set(testPurchases.filter(p => p.course).map(p => p.course.toString()))];
      const testTestIds = [...new Set(testPurchases.filter(p => p.test).map(p => p.test.toString()))];

      console.log('Test course IDs to remove:', testCourseIds);
      console.log('Test test IDs to remove:', testTestIds);

      // Remove from user models
      if (testCourseIds.length > 0) {
        await User.updateMany(
          { purchasedCourses: { $in: testCourseIds } },
          { $pull: { purchasedCourses: { $in: testCourseIds } } }
        );
        console.log('Removed test course IDs from user models');
      }

      if (testTestIds.length > 0) {
        await User.updateMany(
          { purchasedTests: { $in: testTestIds } },
          { $pull: { purchasedTests: { $in: testTestIds } } }
        );
        console.log('Removed test test IDs from user models');
      }

      // Remove from purchase collection
      const deleteResult = await Purchase.deleteMany({
        purchasedAt: { $gte: today }
      });
      console.log(`Deleted ${deleteResult.deletedCount} test purchase records`);
    }

    console.log('Test data cleanup completed successfully!');

  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run cleanup
cleanupTestData(); 