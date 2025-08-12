const mongoose = require('mongoose');
require('dotenv').config();

async function investigateRevenue() {
  try {
    console.log('🔍 Investigating Revenue Data Sources...');
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI is not set!');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Check all collections for revenue-related data
    console.log('\n📊 Checking all collections for revenue data...');
    
    // 1. Check purchases collection
    console.log('\n💰 PURCHASES Collection:');
    const purchasesCollection = mongoose.connection.db.collection('purchases');
    const totalPurchases = await purchasesCollection.countDocuments();
    console.log(`  Total Purchases: ${totalPurchases}`);
    
    if (totalPurchases > 0) {
      const samplePurchases = await purchasesCollection.find({}).limit(5).toArray();
      samplePurchases.forEach((purchase, index) => {
        console.log(`  ${index + 1}. Purchase: ${purchase.amount || 'No amount'} MNT, Status: ${purchase.status || 'Unknown'}, Date: ${purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : 'N/A'}`);
      });
      
      // Calculate total revenue from purchases
      const allPurchases = await purchasesCollection.find({}).toArray();
      const totalRevenue = allPurchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
      const completedRevenue = allPurchases.filter(p => p.status === 'completed').reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
      
      console.log(`  💵 Total Revenue from Purchases: ₮${totalRevenue.toLocaleString()}`);
      console.log(`  ✅ Completed Revenue: ₮${completedRevenue.toLocaleString()}`);
    }
    
    // 2. Check payments collection
    console.log('\n💳 PAYMENTS Collection:');
    const paymentsCollection = mongoose.connection.db.collection('payments');
    const totalPayments = await paymentsCollection.countDocuments();
    console.log(`  Total Payments: ${totalPayments}`);
    
    if (totalPayments > 0) {
      const samplePayments = await paymentsCollection.find({}).limit(5).toArray();
      samplePayments.forEach((payment, index) => {
        console.log(`  ${index + 1}. Payment: ${payment.amount || 'No amount'} MNT, Status: ${payment.status || 'Unknown'}, Date: ${payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}`);
      });
    }
    
    // 3. Check courses collection for pricing
    console.log('\n📚 COURSES Collection (Pricing):');
    const coursesCollection = mongoose.connection.db.collection('courses');
    const totalCourses = await coursesCollection.countDocuments();
    console.log(`  Total Courses: ${totalCourses}`);
    
    if (totalCourses > 0) {
      const coursesWithPrices = await coursesCollection.find({ price: { $exists: true, $gt: 0 } }).toArray();
      console.log(`  Courses with Prices: ${coursesWithPrices.length}`);
      
      const totalCourseValue = coursesWithPrices.reduce((sum, course) => sum + (course.price || 0), 0);
      console.log(`  💵 Total Course Value: ₮${totalCourseValue.toLocaleString()}`);
      
      coursesWithPrices.forEach((course, index) => {
        console.log(`  ${index + 1}. ${course.title || 'Untitled'}: ₮${course.price?.toLocaleString() || 0}`);
      });
    }
    
    // 4. Check tests collection for pricing
    console.log('\n🧪 TESTS Collection (Pricing):');
    const testsCollection = mongoose.connection.db.collection('tests');
    const totalTests = await testsCollection.countDocuments();
    console.log(`  Total Tests: ${totalTests}`);
    
    if (totalTests > 0) {
      const testsWithPrices = await testsCollection.find({ price: { $exists: true, $gt: 0 } }).toArray();
      console.log(`  Tests with Prices: ${testsWithPrices.length}`);
      
      const totalTestValue = testsWithPrices.reduce((sum, test) => sum + (test.price || 0), 0);
      console.log(`  💵 Total Test Value: ₮${totalTestValue.toLocaleString()}`);
      
      testsWithPrices.forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.title?.en || test.title?.mn || 'Untitled'}: ₮${test.price?.toLocaleString() || 0}`);
      });
    }
    
    // 5. Check users collection for purchased items
    console.log('\n👥 USERS Collection (Purchased Items):');
    const usersCollection = mongoose.connection.db.collection('users');
    const totalUsers = await usersCollection.countDocuments();
    console.log(`  Total Users: ${totalUsers}`);
    
    const usersWithPurchases = await usersCollection.find({ 
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    }).toArray();
    
    console.log(`  Users with Purchases: ${usersWithPurchases.length}`);
    
    // 6. Calculate estimated monthly revenue based on actual data
    console.log('\n🧮 REVENUE CALCULATION ANALYSIS:');
    
    // Get actual purchase data
    const actualPurchases = await purchasesCollection.find({ status: 'completed' }).toArray();
    const actualRevenue = actualPurchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
    
    console.log(`  💵 Actual Completed Revenue: ₮${actualRevenue.toLocaleString()}`);
    console.log(`  📅 Purchase Dates: ${actualPurchases.map(p => p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A').join(', ')}`);
    
    // Calculate monthly estimate based on actual data
    const monthlyEstimate = actualRevenue > 0 ? actualRevenue : (totalUsers * 0.15 * 25000);
    console.log(`  📊 Monthly Revenue Estimate: ₮${monthlyEstimate.toLocaleString()}`);
    
    // 7. Check where the 22k calculation comes from
    console.log('\n🔍 INVESTIGATING THE 22K CALCULATION:');
    const calculation = totalUsers * 0.15 * 25000;
    console.log(`  Formula: ${totalUsers} users × 0.15 × 25000 = ₮${calculation.toLocaleString()}`);
    console.log(`  This is a FICTITIOUS calculation based on:`);
    console.log(`    - ${totalUsers} total users`);
    console.log(`    - 15% conversion rate (assumed)`);
    console.log(`    - ₮25,000 average purchase (assumed)`);
    console.log(`  ❌ NOT based on actual revenue data!`);
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('  1. Remove the fake 22k calculation');
    console.log('  2. Show actual revenue from purchases collection');
    console.log('  3. Show actual course/test values');
    console.log('  4. Calculate real monthly estimates based on actual data');
    
  } catch (error) {
    console.error('\n❌ Error investigating revenue:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 MongoDB disconnected');
    }
  }
}

investigateRevenue();
