const mongoose = require('mongoose');
require('dotenv').config();

async function investigateExtraPurchases() {
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

    console.log('=== INVESTIGATING EXTRA PURCHASE RECORDS ===');

    // Get all users with purchases
    const users = await User.find({
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    }).select('_id name purchasedCourses purchasedTests');

    for (const user of users) {
      console.log(`\nUser: ${user.name} (${user._id})`);
      
      // Get all purchase records for this user
      const purchaseRecords = await Purchase.find({ user: user._id });
      console.log(`Total purchase records: ${purchaseRecords.length}`);

      const userCourseIds = user.purchasedCourses?.map(c => c.toString()) || [];
      const userTestIds = user.purchasedTests?.map(t => t.toString()) || [];

      console.log(`User model - Courses: ${userCourseIds.join(', ')}`);
      console.log(`User model - Tests: ${userTestIds.join(', ')}`);

      // Check each purchase record
      for (const purchase of purchaseRecords) {
        const purchaseId = purchase._id.toString();
        const courseId = purchase.course?.toString();
        const testId = purchase.test?.toString();
        const purchasedAt = purchase.purchasedAt;

        if (courseId) {
          if (userCourseIds.includes(courseId)) {
            console.log(`  ✅ Course ${courseId} - Valid (${purchasedAt})`);
          } else {
            console.log(`  ❌ Course ${courseId} - EXTRA RECORD (${purchasedAt})`);
          }
        }

        if (testId) {
          if (userTestIds.includes(testId)) {
            console.log(`  ✅ Test ${testId} - Valid (${purchasedAt})`);
          } else {
            console.log(`  ❌ Test ${testId} - EXTRA RECORD (${purchasedAt})`);
          }
        }
      }

      // Find extra records
      const purchaseCourseIds = purchaseRecords
        .filter(p => p.course)
        .map(p => p.course.toString());
      
      const purchaseTestIds = purchaseRecords
        .filter(p => p.test)
        .map(p => p.test.toString());

      const extraCourses = purchaseCourseIds.filter(id => !userCourseIds.includes(id));
      const extraTests = purchaseTestIds.filter(id => !userTestIds.includes(id));

      if (extraCourses.length > 0) {
        console.log(`\n  🔍 Extra courses in Purchase collection: ${extraCourses.join(', ')}`);
      }
      if (extraTests.length > 0) {
        console.log(`\n  🔍 Extra tests in Purchase collection: ${extraTests.join(', ')}`);
      }
    }

    // Check for orphaned purchase records (users that don't exist)
    console.log(`\n=== CHECKING FOR ORPHANED RECORDS ===`);
    const allPurchaseRecords = await Purchase.find({});
    const allUserIds = users.map(u => u._id.toString());
    
    const orphanedRecords = allPurchaseRecords.filter(p => !allUserIds.includes(p.user.toString()));
    console.log(`Orphaned purchase records: ${orphanedRecords.length}`);
    
    if (orphanedRecords.length > 0) {
      console.log('Orphaned user IDs:');
      orphanedRecords.forEach(p => {
        console.log(`  - ${p.user} (${p.course ? 'course' : 'test'}: ${p.course || p.test})`);
      });
    }

  } catch (error) {
    console.error('Error investigating extra purchases:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

investigateExtraPurchases(); 