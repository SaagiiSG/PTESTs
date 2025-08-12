const mongoose = require('mongoose');
require('dotenv').config();

async function testAdminLogin() {
  try {
    console.log('🔍 Testing Admin User Authentication...');
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI is not set!');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    const usersCollection = mongoose.connection.db.collection('users');
    
    // Find admin users
    const adminUsers = await usersCollection.find({ isAdmin: true }).toArray();
    
    console.log(`\n👑 Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. Admin User:`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email || '❌ No email'}`);
      console.log(`   Phone: ${user.phoneNumber || '❌ No phone'}`);
      console.log(`   ID: ${user._id}`);
      
      if (user.email) {
        console.log(`   ✅ Can authenticate with email: ${user.email}`);
      } else if (user.phoneNumber) {
        console.log(`   ✅ Can authenticate with phone: ${user.phoneNumber}`);
      } else {
        console.log(`   ❌ No authentication method available`);
      }
    });
    
    // Check if any admin users have passwords
    console.log('\n🔐 Checking for admin users with passwords...');
    
    for (const user of adminUsers) {
      if (user.password) {
        console.log(`   ✅ ${user.name} has password`);
      } else {
        console.log(`   ❌ ${user.name} has no password`);
      }
    }
    
    // Find admin users with both email and password
    const adminUsersWithEmail = adminUsers.filter(user => user.email && user.password);
    const adminUsersWithPhone = adminUsers.filter(user => user.phoneNumber && user.password);
    
    console.log('\n📧 Admin users with email + password:', adminUsersWithEmail.length);
    adminUsersWithEmail.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });
    
    console.log('\n📱 Admin users with phone + password:', adminUsersWithPhone.length);
    adminUsersWithPhone.forEach(user => {
      console.log(`   - ${user.name} (${user.phoneNumber})`);
    });
    
    // Recommendations
    console.log('\n💡 Authentication Recommendations:');
    
    if (adminUsersWithEmail.length > 0) {
      console.log('   ✅ Use email authentication for analytics API');
      const bestUser = adminUsersWithEmail[0];
      console.log(`   📧 Login with: ${bestUser.email}`);
    } else if (adminUsersWithPhone.length > 0) {
      console.log('   ✅ Use phone authentication for analytics API');
      const bestUser = adminUsersWithPhone[0];
      console.log(`   📱 Login with: ${bestUser.phoneNumber}`);
    } else {
      console.log('   ❌ No admin users with valid authentication credentials');
      console.log('   💡 You need to either:');
      console.log('      1. Add an email to an existing admin user');
      console.log('      2. Add a password to an existing admin user');
      console.log('      3. Create a new admin user with email + password');
    }
    
  } catch (error) {
    console.error('\n❌ Error testing admin login:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 MongoDB disconnected');
    }
  }
}

testAdminLogin();
