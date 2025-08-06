require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function debugVerificationCode() {
  console.log('🔍 Debugging Verification Code\n');

  try {
    // Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = require('../app/models/user');
    
    // Get phone number from command line argument or use default
    const phoneNumber = process.argv[2] || '+97699999999';
    console.log(`\n2. Checking user with phone: ${phoneNumber}`);
    
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', { 
      name: user.name, 
      phoneNumber: user.phoneNumber,
      email: user.email 
    });

    console.log('\n3. Checking verification code details:');
    console.log('   - passwordResetCode:', user.passwordResetCode || 'NOT SET');
    console.log('   - passwordResetExpires:', user.passwordResetExpires || 'NOT SET');
    
    if (user.passwordResetExpires) {
      const now = new Date();
      const expires = new Date(user.passwordResetExpires);
      const isExpired = expires < now;
      console.log('   - Current time:', now);
      console.log('   - Expires at:', expires);
      console.log('   - Is expired:', isExpired);
      console.log('   - Time difference (minutes):', Math.round((expires - now) / (1000 * 60)));
    }

    // Test verification logic
    console.log('\n4. Testing verification logic:');
    const testCode = process.argv[3] || '123456';
    console.log('   - Testing with code:', testCode);
    
    const codeMatch = user.passwordResetCode === testCode;
    const notExpired = user.passwordResetExpires && user.passwordResetExpires > new Date();
    
    console.log('   - Code matches:', codeMatch);
    console.log('   - Not expired:', notExpired);
    console.log('   - Would pass verification:', codeMatch && notExpired);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Usage: node scripts/debug-verification-code.js [phoneNumber] [testCode]
debugVerificationCode().catch(console.error); 