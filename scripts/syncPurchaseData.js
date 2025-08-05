const mongoose = require('mongoose');
require('dotenv').config();

async function syncPurchaseData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define schemas inline
    const UserSchema = new mongoose.Schema({
      name: String,
      purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
      purchasedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
    });

    const PurchaseSchema = new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
      purchasedAt: { type: Date, default: Date.now },
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);

    console.log('=== SYNCING PURCHASE DATA ===');

    // Get all users with purchases
    const users = await User.find({
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    }).select('_id name purchasedCourses purchasedTests');

    console.log(`Found ${users.length} users with purchases to sync`);

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const user of users) {
      console.log(`\nProcessing user: ${user.name} (${user._id})`);

      // Get existing purchase records for this user
      const existingPurchases = await Purchase.find({ user: user._id });
      const existingCourseIds = existingPurchases
        .filter(p => p.course)
        .map(p => p.course.toString());
      const existingTestIds = existingPurchases
        .filter(p => p.test)
        .map(p => p.test.toString());

      // Process courses
      if (user.purchasedCourses && user.purchasedCourses.length > 0) {
        for (const courseId of user.purchasedCourses) {
          const courseIdStr = courseId.toString();
          
          if (!existingCourseIds.includes(courseIdStr)) {
            // Create purchase record for this course
            await Purchase.create({
              user: user._id,
              course: courseId,
              purchasedAt: new Date() // Use current date since we don't have original purchase date
            });
            console.log(`  ✅ Created purchase record for course: ${courseIdStr}`);
            totalCreated++;
          } else {
            console.log(`  ⏭️  Skipped course: ${courseIdStr} (already exists)`);
            totalSkipped++;
          }
        }
      }

      // Process tests
      if (user.purchasedTests && user.purchasedTests.length > 0) {
        for (const testId of user.purchasedTests) {
          const testIdStr = testId.toString();
          
          if (!existingTestIds.includes(testIdStr)) {
            // Create purchase record for this test
            await Purchase.create({
              user: user._id,
              test: testId,
              purchasedAt: new Date() // Use current date since we don't have original purchase date
            });
            console.log(`  ✅ Created purchase record for test: ${testIdStr}`);
            totalCreated++;
          } else {
            console.log(`  ⏭️  Skipped test: ${testIdStr} (already exists)`);
            totalSkipped++;
          }
        }
      }
    }

    console.log(`\n=== SYNC COMPLETE ===`);
    console.log(`Total records created: ${totalCreated}`);
    console.log(`Total records skipped (already existed): ${totalSkipped}`);

    // Verify the sync worked
    console.log(`\n=== VERIFICATION ===`);
    const totalPurchaseRecords = await Purchase.countDocuments();
    console.log(`Total records in Purchase collection: ${totalPurchaseRecords}`);

    // Check if we need to update the purchase API to use both systems
    console.log(`\n=== RECOMMENDATIONS ===`);
    console.log(`1. Update /api/purchase/route.ts to also create Purchase collection records`);
    console.log(`2. Consider using the purchaseUtils.js functions for consistency`);
    console.log(`3. The profile pages should now show the correct data`);

  } catch (error) {
    console.error('Error syncing purchase data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

syncPurchaseData(); 