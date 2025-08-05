const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupExtraPurchases() {
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

    console.log('=== CLEANING UP EXTRA PURCHASE RECORDS ===');

    // Get all users with purchases
    const users = await User.find({
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    }).select('_id name purchasedCourses purchasedTests');

    let totalRemoved = 0;

    for (const user of users) {
      console.log(`\nProcessing user: ${user.name} (${user._id})`);
      
      // Get all purchase records for this user
      const purchaseRecords = await Purchase.find({ user: user._id });

      const userCourseIds = user.purchasedCourses?.map(c => c.toString()) || [];
      const userTestIds = user.purchasedTests?.map(t => t.toString()) || [];

      // Find extra records
      const purchaseCourseIds = purchaseRecords
        .filter(p => p.course)
        .map(p => p.course.toString());
      
      const purchaseTestIds = purchaseRecords
        .filter(p => p.test)
        .map(p => p.test.toString());

      const extraCourses = purchaseCourseIds.filter(id => !userCourseIds.includes(id));
      const extraTests = purchaseTestIds.filter(id => !userTestIds.includes(id));

      // Remove extra course records
      for (const courseId of extraCourses) {
        const result = await Purchase.deleteMany({ 
          user: user._id, 
          course: courseId 
        });
        console.log(`  🗑️  Removed extra course record: ${courseId} (${result.deletedCount} records)`);
        totalRemoved += result.deletedCount;
      }

      // Remove extra test records
      for (const testId of extraTests) {
        const result = await Purchase.deleteMany({ 
          user: user._id, 
          test: testId 
        });
        console.log(`  🗑️  Removed extra test record: ${testId} (${result.deletedCount} records)`);
        totalRemoved += result.deletedCount;
      }
    }

    // Remove orphaned records (users that don't exist)
    console.log(`\n=== REMOVING ORPHANED RECORDS ===`);
    const allUserIds = users.map(u => u._id.toString());
    const orphanedResult = await Purchase.deleteMany({
      user: { $nin: allUserIds }
    });
    console.log(`  🗑️  Removed ${orphanedResult.deletedCount} orphaned purchase records`);
    totalRemoved += orphanedResult.deletedCount;

    console.log(`\n=== CLEANUP COMPLETE ===`);
    console.log(`Total records removed: ${totalRemoved}`);

    // Verify the cleanup worked
    console.log(`\n=== VERIFICATION ===`);
    const totalPurchaseRecords = await Purchase.countDocuments();
    console.log(`Total records in Purchase collection: ${totalPurchaseRecords}`);

  } catch (error) {
    console.error('Error cleaning up extra purchases:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanupExtraPurchases(); 