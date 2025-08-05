const mongoose = require('mongoose');
require('dotenv').config();

async function checkPurchaseDataSync() {
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

    // Get all users with purchases
    const users = await User.find({
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    }).select('_id name purchasedCourses purchasedTests');

    console.log(`\n=== PURCHASE DATA SYNC ANALYSIS ===`);
    console.log(`Found ${users.length} users with purchases in User model`);

    let totalUserCoursePurchases = 0;
    let totalUserTestPurchases = 0;
    let totalPurchaseCollectionRecords = 0;

    for (const user of users) {
      const userCourseCount = user.purchasedCourses?.length || 0;
      const userTestCount = user.purchasedTests?.length || 0;
      
      totalUserCoursePurchases += userCourseCount;
      totalUserTestPurchases += userTestCount;

      // Check Purchase collection for this user
      const purchaseRecords = await Purchase.find({ user: user._id });
      totalPurchaseCollectionRecords += purchaseRecords.length;

      console.log(`\nUser: ${user.name} (${user._id})`);
      console.log(`  User Model - Courses: ${userCourseCount}, Tests: ${userTestCount}`);
      console.log(`  Purchase Collection Records: ${purchaseRecords.length}`);

      if (purchaseRecords.length === 0) {
        console.log(`  ⚠️  NO PURCHASE RECORDS FOUND - Data missing from Purchase collection`);
      } else if (purchaseRecords.length !== (userCourseCount + userTestCount)) {
        console.log(`  ⚠️  MISMATCH - Purchase records don't match User model counts`);
      }

      // Check for specific mismatches
      const purchaseCourseIds = purchaseRecords
        .filter(p => p.course)
        .map(p => p.course.toString());
      
      const purchaseTestIds = purchaseRecords
        .filter(p => p.test)
        .map(p => p.test.toString());

      const userCourseIds = user.purchasedCourses?.map(c => c.toString()) || [];
      const userTestIds = user.purchasedTests?.map(t => t.toString()) || [];

      // Find missing courses in Purchase collection
      const missingCoursesInPurchase = userCourseIds.filter(id => !purchaseCourseIds.includes(id));
      if (missingCoursesInPurchase.length > 0) {
        console.log(`  ❌ Missing courses in Purchase collection: ${missingCoursesInPurchase.length}`);
      }

      // Find missing tests in Purchase collection
      const missingTestsInPurchase = userTestIds.filter(id => !purchaseTestIds.includes(id));
      if (missingTestsInPurchase.length > 0) {
        console.log(`  ❌ Missing tests in Purchase collection: ${missingTestsInPurchase.length}`);
      }

      // Find extra records in Purchase collection
      const extraCoursesInPurchase = purchaseCourseIds.filter(id => !userCourseIds.includes(id));
      const extraTestsInPurchase = purchaseTestIds.filter(id => !userTestIds.includes(id));
      
      if (extraCoursesInPurchase.length > 0 || extraTestsInPurchase.length > 0) {
        console.log(`  ⚠️  Extra records in Purchase collection: ${extraCoursesInPurchase.length + extraTestsInPurchase.length}`);
      }
    }

    // Overall statistics
    console.log(`\n=== OVERALL STATISTICS ===`);
    console.log(`Total User Model Purchases: ${totalUserCoursePurchases + totalUserTestPurchases}`);
    console.log(`  - Courses: ${totalUserCoursePurchases}`);
    console.log(`  - Tests: ${totalUserTestPurchases}`);
    console.log(`Total Purchase Collection Records: ${totalPurchaseCollectionRecords}`);

    const discrepancy = Math.abs((totalUserCoursePurchases + totalUserTestPurchases) - totalPurchaseCollectionRecords);
    console.log(`Discrepancy: ${discrepancy} records`);

    if (discrepancy > 0) {
      console.log(`\n🔴 DATA SYNC ISSUE DETECTED!`);
      console.log(`The User model and Purchase collection are out of sync.`);
      console.log(`This explains why profile pages show different data than expected.`);
    } else {
      console.log(`\n✅ Data appears to be in sync`);
    }

    // Check if Purchase collection has any records at all
    const totalPurchaseRecords = await Purchase.countDocuments();
    console.log(`\nTotal records in Purchase collection: ${totalPurchaseRecords}`);

    if (totalPurchaseRecords === 0) {
      console.log(`\n🔴 CRITICAL ISSUE: Purchase collection is completely empty!`);
      console.log(`All profile history pages will show no data.`);
    }

  } catch (error) {
    console.error('Error checking purchase data sync:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkPurchaseDataSync(); 