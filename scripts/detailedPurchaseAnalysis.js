const mongoose = require('mongoose');
require('dotenv').config();

async function detailedPurchaseAnalysis() {
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

    console.log('\n=== DETAILED PURCHASE ANALYSIS ===\n');

    // Get all purchases with detailed breakdown
    const allPurchases = await Purchase.find({}).lean();
    console.log(`📊 TOTAL PURCHASES IN DATABASE: ${allPurchases.length}\n`);

    // Breakdown by type
    const coursePurchases = allPurchases.filter(p => p.course);
    const testPurchases = allPurchases.filter(p => p.test);
    
    console.log(`📚 Course Purchases: ${coursePurchases.length}`);
    console.log(`🧪 Test Purchases: ${testPurchases.length}`);
    console.log(`📋 Total Items: ${coursePurchases.length + testPurchases.length}\n`);

    // Detailed breakdown by user
    console.log('=== BREAKDOWN BY USER ===\n');
    
    const userPurchaseMap = {};
    
    for (const purchase of allPurchases) {
      if (!userPurchaseMap[purchase.user]) {
        userPurchaseMap[purchase.user] = {
          courses: [],
          tests: [],
          total: 0
        };
      }
      
      if (purchase.course) {
        userPurchaseMap[purchase.user].courses.push(purchase.course);
        userPurchaseMap[purchase.user].total++;
      }
      
      if (purchase.test) {
        userPurchaseMap[purchase.user].tests.push(purchase.test);
        userPurchaseMap[purchase.user].total++;
      }
    }

    for (const [userId, purchases] of Object.entries(userPurchaseMap)) {
      const user = await User.findById(userId).select('name');
      const userName = user ? user.name : 'Unknown User';
      
      console.log(`👤 User: ${userName} (${userId})`);
      console.log(`   📚 Courses: ${purchases.courses.length} - ${purchases.courses.map(id => id.toString())}`);
      console.log(`   🧪 Tests: ${purchases.tests.length} - ${purchases.tests.map(id => id.toString())}`);
      console.log(`   📊 Total Items: ${purchases.total}\n`);
    }

    // User model analysis
    console.log('=== USER MODEL ANALYSIS ===\n');
    
    const usersWithPurchases = await User.find({
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    }).lean();

    let totalUserItems = 0;
    
    for (const user of usersWithPurchases) {
      const courseCount = user.purchasedCourses ? user.purchasedCourses.length : 0;
      const testCount = user.purchasedTests ? user.purchasedTests.length : 0;
      totalUserItems += courseCount + testCount;
      
      console.log(`👤 User: ${user.name} (${user._id})`);
      console.log(`   📚 Purchased Courses: ${courseCount}`);
      console.log(`   🧪 Purchased Tests: ${testCount}`);
      console.log(`   📊 Total Items: ${courseCount + testCount}\n`);
    }

    console.log(`📊 TOTAL ITEMS IN USER MODEL: ${totalUserItems}`);

    // Cross-reference analysis
    console.log('\n=== CROSS-REFERENCE ANALYSIS ===\n');
    
    for (const purchase of allPurchases) {
      const user = await User.findById(purchase.user).select('name purchasedCourses purchasedTests');
      if (!user) {
        console.log(`❌ Purchase ${purchase._id} - User not found: ${purchase.user}`);
        continue;
      }

      console.log(`🔍 Purchase: ${purchase._id}`);
      console.log(`   👤 User: ${user.name}`);
      
      if (purchase.course) {
        const hasInUser = user.purchasedCourses && user.purchasedCourses.includes(purchase.course);
        console.log(`   📚 Course: ${purchase.course} - In User Model: ${hasInUser ? '✅' : '❌'}`);
      }
      
      if (purchase.test) {
        const hasInUser = user.purchasedTests && user.purchasedTests.includes(purchase.test);
        console.log(`   🧪 Test: ${purchase.test} - In User Model: ${hasInUser ? '✅' : '❌'}`);
      }
      console.log('');
    }

    // Summary
    console.log('=== SUMMARY ===');
    console.log(`📊 Purchase Collection Items: ${allPurchases.length}`);
    console.log(`📊 User Model Items: ${totalUserItems}`);
    console.log(`📊 Discrepancy: ${Math.abs(allPurchases.length - totalUserItems)}`);
    
    if (allPurchases.length === totalUserItems) {
      console.log('✅ Data is consistent between Purchase collection and User model!');
    } else {
      console.log('❌ Data inconsistency detected!');
    }

  } catch (error) {
    console.error('Detailed analysis failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the detailed analysis
detailedPurchaseAnalysis(); 