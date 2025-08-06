require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function createTestUser() {
  console.log('👤 Creating Test User\n');

  try {
    // Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = require('../app/models/user');
    
    // Get phone number from command line argument
    const phoneNumber = process.argv[2];
    
    if (!phoneNumber) {
      console.log('❌ Please provide a phone number as argument');
      console.log('Usage: node scripts/create-test-user.js +976XXXXXXXX');
      return;
    }
    
    console.log(`\n2. Creating test user with phone: ${phoneNumber}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.name);
      return;
    }
    
    // Create a test user
    const newUser = new User({
      name: 'Test User',
      phoneNumber: phoneNumber,
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    await newUser.save();
    console.log('✅ Test user created successfully');
    console.log('   - Name: Test User');
    console.log('   - Phone: ' + phoneNumber);
    console.log('   - Email: test@example.com');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

createTestUser().catch(console.error); 