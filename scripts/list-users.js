require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function listUsers() {
  console.log('👥 Listing All Users\n');

  try {
    // Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = require('../app/models/user');
    
    const users = await User.find({}).select('name phoneNumber email createdAt');
    
    console.log(`\n2. Found ${users.length} users:`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} - ${user.phoneNumber} - ${user.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

listUsers().catch(console.error); 