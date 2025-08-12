const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../app/models/user');

async function fixAdminUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users
    const allUsers = await User.find({});
    console.log(`\nTotal users found: ${allUsers.length}`);

    // Find admin users
    const adminUsers = await User.find({ isAdmin: true });
    console.log(`\nAdmin users found: ${adminUsers.length}`);

    // Display admin users
    if (adminUsers.length > 0) {
      console.log('\n=== ADMIN USERS ===');
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user._id}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Phone: ${user.phoneNumber || 'N/A'}`);
        console.log(`   isAdmin: ${user.isAdmin}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('   ---');
      });
    }

    // Find users with potential admin privileges but not marked as admin
    const potentialAdmins = await User.find({
      $or: [
        { email: { $regex: /admin/i } },
        { name: { $regex: /admin/i } },
        { email: { $regex: /@admin/i } }
      ],
      isAdmin: { $ne: true }
    });

    if (potentialAdmins.length > 0) {
      console.log('\n=== POTENTIAL ADMIN USERS (not marked as admin) ===');
      potentialAdmins.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user._id}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Phone: ${user.phoneNumber || 'N/A'}`);
        console.log(`   isAdmin: ${user.isAdmin}`);
        console.log('   ---');
      });
    }

    // Find users with corrupted admin status (should be false but might be true)
    const suspiciousUsers = await User.find({
      $or: [
        { email: { $regex: /test/i } },
        { email: { $regex: /demo/i } },
        { name: { $regex: /test/i } },
        { name: { $regex: /demo/i } }
      ],
      isAdmin: true
    });

    if (suspiciousUsers.length > 0) {
      console.log('\n=== SUSPICIOUS ADMIN USERS (test/demo accounts marked as admin) ===');
      suspiciousUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user._id}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Phone: ${user.phoneNumber || 'N/A'}`);
        console.log(`   isAdmin: ${user.isAdmin}`);
        console.log('   ---');
      });
    }

    // Interactive admin management
    console.log('\n=== ADMIN MANAGEMENT OPTIONS ===');
    console.log('1. View specific user details');
    console.log('2. Make user admin');
    console.log('3. Remove admin privileges');
    console.log('4. Exit');

    // For now, just provide instructions
    console.log('\nTo fix admin issues:');
    console.log('- Check the users above for any suspicious admin accounts');
    console.log('- Use MongoDB Compass or similar tool to manually fix isAdmin field');
    console.log('- Or run this script with additional functionality to fix automatically');

    console.log('\n=== RECOMMENDATIONS ===');
    console.log('1. Ensure only legitimate admin accounts have isAdmin: true');
    console.log('2. Check for any test/demo accounts that might have admin privileges');
    console.log('3. Verify that the admin layout is properly checking database admin status');
    console.log('4. Consider implementing additional admin verification (2FA, IP restrictions)');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
fixAdminUsers();
