const mongoose = require('mongoose');
require('dotenv').config();

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking Admin Users...');
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI is not set!');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    const usersCollection = mongoose.connection.db.collection('users');
    
    // Get all users
    const users = await usersCollection.find({}).toArray();
    
    console.log(`\n👥 Total Users: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User Details:`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Phone: ${user.phoneNumber || 'N/A'}`);
      console.log(`   Is Admin: ${user.isAdmin ? '✅ YES' : '❌ NO'}`);
      console.log(`   Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`);
      console.log(`   ID: ${user._id}`);
    });
    
    // Check admin users specifically
    const adminUsers = users.filter(user => user.isAdmin);
    console.log(`\n👑 Admin Users: ${adminUsers.length}`);
    
    if (adminUsers.length === 0) {
      console.log('\n⚠️  WARNING: No admin users found!');
      console.log('   This could be why the analytics API is failing.');
      console.log('   You need at least one user with isAdmin: true');
    } else {
      console.log('\n✅ Admin users found:');
      adminUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email || user.phoneNumber})`);
      });
    }
    
    // Check for users with email (needed for auth)
    const usersWithEmail = users.filter(user => user.email);
    console.log(`\n📧 Users with Email: ${usersWithEmail.length}`);
    
    if (usersWithEmail.length === 0) {
      console.log('\n⚠️  WARNING: No users with email addresses!');
      console.log('   Email is required for authentication in the analytics API.');
    }
    
    // Check for users with phone (alternative auth method)
    const usersWithPhone = users.filter(user => user.phoneNumber);
    console.log(`\n📱 Users with Phone: ${usersWithPhone.length}`);
    
    console.log('\n💡 To fix authentication issues:');
    console.log('   1. Ensure at least one user has isAdmin: true');
    console.log('   2. Ensure the admin user has an email address');
    console.log('   3. Log in with the admin user credentials');
    console.log('   4. Check that the session is maintained');
    
  } catch (error) {
    console.error('\n❌ Error checking admin users:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 MongoDB disconnected');
    }
  }
}

checkAdminUsers();
