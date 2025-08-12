const mongoose = require('mongoose');
require('dotenv').config();

async function testAnalyticsAPI() {
  try {
    console.log('🔍 Testing Analytics API Endpoints...');
    
    // Check environment variables
    console.log('\n📋 Environment Check:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Found' : '❌ Missing');
    
    if (!process.env.MONGODB_URI) {
      console.log('\n❌ MONGODB_URI is not set!');
      return;
    }
    
    // Test MongoDB connection
    console.log('\n🔌 Testing MongoDB Connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Test Users Analytics
    console.log('\n👥 Testing Users Analytics...');
    const usersCollection = mongoose.connection.db.collection('users');
    const totalUsers = await usersCollection.countDocuments();
    const adminUsers = await usersCollection.countDocuments({ isAdmin: true });
    const regularUsers = totalUsers - adminUsers;
    
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Admin Users: ${adminUsers}`);
    console.log(`  Regular Users: ${regularUsers}`);
    
    // Test Courses Analytics
    console.log('\n📚 Testing Courses Analytics...');
    const coursesCollection = mongoose.connection.db.collection('courses');
    const totalCourses = await coursesCollection.countDocuments();
    const activeCourses = await coursesCollection.countDocuments({ status: 'active' });
    const inactiveCourses = await coursesCollection.countDocuments({ status: 'inactive' });
    
    console.log(`  Total Courses: ${totalCourses}`);
    console.log(`  Active Courses: ${activeCourses}`);
    console.log(`  Inactive Courses: ${inactiveCourses}`);
    
    // Test UserProgress Analytics
    console.log('\n📈 Testing User Progress Analytics...');
    const userProgressCollection = mongoose.connection.db.collection('userprogresses');
    const totalProgress = await userProgressCollection.countDocuments();
    const usersWithProgress = await userProgressCollection.countDocuments({ 'courses.0': { $exists: true } });
    
    console.log(`  Total Progress Records: ${totalProgress}`);
    console.log(`  Users with Course Progress: ${usersWithProgress}`);
    
    // Test Purchase Analytics
    console.log('\n💰 Testing Purchase Analytics...');
    const purchasesCollection = mongoose.connection.db.collection('purchases');
    const totalPurchases = await purchasesCollection.countDocuments();
    const completedPurchases = await purchasesCollection.countDocuments({ status: 'completed' });
    
    console.log(`  Total Purchases: ${totalPurchases}`);
    console.log(`  Completed Purchases: ${completedPurchases}`);
    
    // Test Test Analytics
    console.log('\n🧪 Testing Test Analytics...');
    const testsCollection = mongoose.connection.db.collection('tests');
    const totalTests = await testsCollection.countDocuments();
    const activeTests = await testsCollection.countDocuments({ isActive: { $ne: false } });
    
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Active Tests: ${activeTests}`);
    
    // Calculate estimated revenue
    console.log('\n💵 Revenue Estimation...');
    const estimatedMonthlyRevenue = totalUsers * 0.15 * 25000;
    const estimatedActiveSubscriptions = Math.floor(totalUsers * 0.25);
    const conversionRate = totalUsers > 0 ? Math.floor((estimatedActiveSubscriptions / totalUsers) * 100) : 0;
    
    console.log(`  Estimated Monthly Revenue: ₮${estimatedMonthlyRevenue.toLocaleString()}`);
    console.log(`  Estimated Active Subscriptions: ${estimatedActiveSubscriptions}`);
    console.log(`  Estimated Conversion Rate: ${conversionRate}%`);
    
    console.log('\n✅ Analytics API test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during analytics API test:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 MongoDB disconnected');
    }
  }
}

testAnalyticsAPI();
