const mongoose = require('mongoose');
require('dotenv').config();

async function migratePurchases() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define schemas inline to avoid import issues
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

    // Get all purchases
    const purchases = await Purchase.find({}).lean();
    console.log(`Found ${purchases.length} purchase records`);

    // Group purchases by user
    const userPurchases = {};
    purchases.forEach(purchase => {
      const userId = purchase.user.toString();
      if (!userPurchases[userId]) {
        userPurchases[userId] = {
          courses: new Set(),
          tests: new Set()
        };
      }
      
      if (purchase.course) {
        userPurchases[userId].courses.add(purchase.course.toString());
      }
      if (purchase.test) {
        userPurchases[userId].tests.add(purchase.test.toString());
      }
    });

    console.log(`Found purchases for ${Object.keys(userPurchases).length} users`);

    // Update each user with their unique purchases
    for (const [userId, purchases] of Object.entries(userPurchases)) {
      const user = await User.findById(userId);
      if (user) {
        // Convert Sets to Arrays
        const courseIds = Array.from(purchases.courses);
        const testIds = Array.from(purchases.tests);
        
        // Update user's purchased courses and tests
        user.purchasedCourses = courseIds.map(id => new mongoose.Types.ObjectId(id));
        user.purchasedTests = testIds.map(id => new mongoose.Types.ObjectId(id));
        
        await user.save();
        console.log(`Updated user ${userId}: ${courseIds.length} courses, ${testIds.length} tests`);
      } else {
        console.log(`User ${userId} not found, skipping...`);
      }
    }

    // Optional: Delete old purchase records
    const deleteResult = await Purchase.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} old purchase records`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migratePurchases(); 