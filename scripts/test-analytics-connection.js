const mongoose = require('mongoose');
require('dotenv').config();

async function testAnalyticsConnection() {
  try {
    console.log('🔍 Testing Analytics API Connection...');
    
    // Check environment variables
    console.log('\n📋 Environment Check:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Found' : '❌ Missing');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
    
    if (!process.env.MONGODB_URI) {
      console.log('\n❌ MONGODB_URI is not set!');
      console.log('Please create a .env.local file with your MongoDB connection string');
      return;
    }
    
    // Test MongoDB connection
    console.log('\n🔌 Testing MongoDB Connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Check collections
    console.log('\n📊 Database Collections:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check User data directly
    console.log('\n👥 User Data:');
    const usersCollection = mongoose.connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`  Total Users: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUser = await usersCollection.findOne();
      console.log(`  Sample User: ${sampleUser.name} (${sampleUser.email || sampleUser.phoneNumber})`);
      console.log(`  Is Admin: ${sampleUser.isAdmin || false}`);
    }
    
    // Check Course data directly
    console.log('\n📚 Course Data:');
    const coursesCollection = mongoose.connection.db.collection('courses');
    const courseCount = await coursesCollection.countDocuments();
    console.log(`  Total Courses: ${courseCount}`);
    
    if (courseCount > 0) {
      const sampleCourse = await coursesCollection.findOne();
      console.log(`  Sample Course: ${sampleCourse.title}`);
      console.log(`  Lessons: ${sampleCourse.lessons?.length || 0}`);
    }
    
    // Check UserProgress data directly
    console.log('\n📈 User Progress Data:');
    const userProgressCollection = mongoose.connection.db.collection('userprogresses');
    const progressCount = await userProgressCollection.countDocuments();
    console.log(`  Total Progress Records: ${progressCount}`);
    
    if (progressCount > 0) {
      const sampleProgress = await userProgressCollection.findOne();
      console.log(`  Sample Progress - Courses: ${sampleProgress.courses?.length || 0}`);
      console.log(`  Total Completed: ${sampleProgress.totalCoursesCompleted || 0}`);
    }
    
    // Test analytics calculations
    console.log('\n🧮 Testing Analytics Calculations:');
    
    // Users analytics
    const totalUsers = await usersCollection.countDocuments();
    const adminUsers = await usersCollection.countDocuments({ isAdmin: true });
    const regularUsers = totalUsers - adminUsers;
    
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Admin Users: ${adminUsers}`);
    console.log(`  Regular Users: ${regularUsers}`);
    
    // Courses analytics
    const totalCourses = await coursesCollection.countDocuments();
    const activeCourses = await coursesCollection.countDocuments({ status: 'active' });
    
    console.log(`  Total Courses: ${totalCourses}`);
    console.log(`  Active Courses: ${activeCourses}`);
    
    // UserProgress analytics
    const totalProgress = await userProgressCollection.countDocuments();
    const usersWithProgress = await userProgressCollection.countDocuments({ 'courses.0': { $exists: true } });
    
    console.log(`  Total Progress Records: ${totalProgress}`);
    console.log(`  Users with Course Progress: ${usersWithProgress}`);
    
    console.log('\n✅ Analytics connection test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during analytics connection test:', error.message);
    
    if (error.message.includes('MONGODB_URI')) {
      console.log('\n💡 Solution: Create a .env.local file with your MongoDB connection string');
      console.log('Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
    } else if (error.message.includes('connect')) {
      console.log('\n💡 Solution: Check your MongoDB connection string and network access');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 MongoDB disconnected');
    }
  }
}

testAnalyticsConnection();
