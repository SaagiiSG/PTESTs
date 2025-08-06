require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testUserExists() {
  console.log('🔍 Testing User Existence\n');

  try {
    // Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = require('../app/models/user');
    
    const testPhone = '+97699999999';
    console.log(`\n2. Checking for user with phone: ${testPhone}`);
    
    const user = await User.findOne({ phoneNumber: testPhone });
    
    if (user) {
      console.log('✅ User found:', { 
        name: user.name, 
        phoneNumber: user.phoneNumber,
        email: user.email 
      });
    } else {
      console.log('❌ User not found. Creating test user...');
      
      // Create a test user
      const newUser = new User({
        name: 'Test User',
        phoneNumber: testPhone,
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      await newUser.save();
      console.log('✅ Test user created successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testUserExists().catch(console.error); 